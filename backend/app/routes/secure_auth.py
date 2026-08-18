"""
Secure auth routes — all Firebase operations proxied through the backend.
Frontend never sees Firebase credentials.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
import requests as http_requests

from app.database import get_db
from app.models import User
from app.auth.firebase_admin_auth import (
    sign_up_with_email_password,
    sign_in_with_email_password,
    refresh_id_token,
    confirm_password_reset,
    verify_id_token,
    verify_google_id_token,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["secure-auth"])


# ── Request / Response models ─────────────────────────────────────────────
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    displayName: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class GoogleSignInRequest(BaseModel):
    id_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetWithOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class ConfirmResetRequest(BaseModel):
    oob_code: str
    new_password: str

class AuthResponse(BaseModel):
    id_token: str
    refresh_token: str
    expires_in: str
    email: str
    local_id: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    message: Optional[str] = None


def _ensure_local_user(db: Session, email: str, uid: str):
    """Auto-create local DB user if it doesn't exist."""
    if not db.query(User).filter(User.email == email).first():
        db.add(User(email=email, firebase_uid=uid, is_active=True))
        db.commit()
        logger.info(f"Auto-created local user: {email}")


# ── Sign Up ───────────────────────────────────────────────────────────────
@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    try:
        fb = sign_up_with_email_password(request.email, request.password)
        _ensure_local_user(db, fb["email"], fb["local_id"])
        return AuthResponse(
            id_token=fb["id_token"], refresh_token=fb["refresh_token"],
            expires_in=fb["expires_in"], email=fb["email"], local_id=fb["local_id"],
            display_name=request.displayName, message="Account created successfully"
        )
    except ValueError as e:
        msg = str(e)
        if "EMAIL_EXISTS" in msg:
            raise HTTPException(400, "Email already registered")
        if "WEAK_PASSWORD" in msg:
            raise HTTPException(400, "Password should be at least 6 characters")
        raise HTTPException(400, f"Sign up failed: {msg}")
    except Exception as e:
        logger.error(f"Sign up error: {e}")
        raise HTTPException(500, "An unexpected error occurred during sign up")


# ── Sign In ───────────────────────────────────────────────────────────────
@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest, db: Session = Depends(get_db)):
    try:
        fb = sign_in_with_email_password(request.email, request.password)
        _ensure_local_user(db, fb["email"], fb["local_id"])
        return AuthResponse(
            id_token=fb["id_token"], refresh_token=fb["refresh_token"],
            expires_in=fb["expires_in"], email=fb["email"], local_id=fb["local_id"],
            display_name=fb.get("display_name"), message="Sign in successful"
        )
    except ValueError as e:
        msg = str(e)
        if "INVALID_PASSWORD" in msg or "EMAIL_NOT_FOUND" in msg or "INVALID_LOGIN_CREDENTIALS" in msg:
            raise HTTPException(401, "Invalid email or password")
        raise HTTPException(401, "Authentication failed")
    except Exception as e:
        logger.error(f"Sign in error: {e}")
        raise HTTPException(500, "An unexpected error occurred during sign in")


# ── Google Sign-In ────────────────────────────────────────────────────────
@router.post("/google-signin")
async def google_signin(request: GoogleSignInRequest, db: Session = Depends(get_db)):
    user_info = verify_google_id_token(request.id_token)
    if not user_info:
        raise HTTPException(401, "Invalid Google token")

    email = user_info.get("email")
    uid   = user_info.get("uid")
    if not email:
        raise HTTPException(400, "No email returned from Google")

    _ensure_local_user(db, email, uid)

    return {
        "id_token":      request.id_token,
        "refresh_token": "",
        "expires_in":    "3600",
        "email":         email,
        "local_id":      uid,
        "display_name":  user_info.get("display_name", ""),
        "photo_url":     user_info.get("photo_url", ""),
        "provider":      "google",
        "message":       "Google sign-in successful"
    }


# ── Refresh Token ─────────────────────────────────────────────────────────
@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    if not request.refresh_token:
        raise HTTPException(400, "No refresh token provided")
    try:
        refreshed = refresh_id_token(request.refresh_token)
        return {
            "id_token":      refreshed["id_token"],
            "refresh_token": refreshed["refresh_token"],
            "expires_in":    refreshed["expires_in"],
        }
    except ValueError:
        raise HTTPException(401, "Invalid refresh token")
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(500, "Token refresh failed")


# ── Forgot Password — Step 1: Send OTP ───────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    from app.services.otp_service import generate_otp
    from app.services.email_service import send_otp_email
    from app.config import settings as cfg

    otp = generate_otp(request.email)

    if cfg.smtp_username and cfg.smtp_password:
        sent = send_otp_email(request.email, otp)
        if sent:
            return {"message": "A 6-digit reset code has been sent to your email.", "email": request.email}
        raise HTTPException(500, "Failed to send reset code. Please check SMTP settings.")

    raise HTTPException(500, "Email service not configured.")


# ── Forgot Password — Step 2: Verify OTP ─────────────────────────────────
@router.post("/verify-otp")
async def verify_otp_route(request: OTPVerifyRequest):
    from app.services.otp_service import verify_otp

    success, message = verify_otp(request.email, request.otp)
    if not success:
        raise HTTPException(400, message)
    return {"message": "OTP verified. You can now set a new password.", "verified": True}


# ── Forgot Password — Step 3: Reset with verified OTP ────────────────────
@router.post("/reset-with-otp")
async def reset_with_otp(request: ResetWithOTPRequest):
    from app.services.otp_service import is_otp_verified, consume_otp
    from app.config import settings as cfg
    import urllib.parse

    if len(request.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    if not is_otp_verified(request.email):
        raise HTTPException(400, "OTP not verified. Please verify your code first.")

    try:
        # Get Firebase oobCode and use it to reset password
        oob_resp = http_requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={cfg.firebase_web_api_key}",
            json={"requestType": "PASSWORD_RESET", "email": request.email, "returnOobLink": True}
        )
        if oob_resp.status_code == 200:
            oob_link  = oob_resp.json().get("oobLink", "")
            oob_code  = urllib.parse.parse_qs(urllib.parse.urlparse(oob_link).query).get("oobCode", [""])[0]
            if oob_code:
                reset_resp = http_requests.post(
                    f"https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key={cfg.firebase_web_api_key}",
                    json={"oobCode": oob_code, "newPassword": request.new_password}
                )
                if reset_resp.status_code == 200:
                    consume_otp(request.email)
                    return {"message": "Password reset successfully. You can now sign in."}

        raise HTTPException(500, "Failed to reset password. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset-with-OTP error: {e}")
        raise HTTPException(500, "An unexpected error occurred.")


# ── Confirm Reset (oobCode from email link) ───────────────────────────────
@router.post("/confirm-reset")
async def confirm_reset(request: ConfirmResetRequest):
    try:
        result = confirm_password_reset(request.oob_code, request.new_password)
        return {"message": "Password reset successfully", "email": result["email"]}
    except ValueError as e:
        msg = str(e)
        if "EXPIRED" in msg:
            raise HTTPException(400, "Reset link has expired. Please request a new one.")
        if "INVALID" in msg:
            raise HTTPException(400, "Invalid reset link. Please request a new one.")
        raise HTTPException(400, msg)
    except Exception as e:
        logger.error(f"Confirm reset error: {e}")
        raise HTTPException(500, "An unexpected error occurred")


# ── Get Current User ──────────────────────────────────────────────────────
@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization header")

    id_token  = auth_header[7:]
    user_info = verify_id_token(id_token)

    if not user_info:
        raise HTTPException(401, "Invalid or expired token")

    local_user = db.query(User).filter(User.email == user_info["email"]).first()
    return {
        "uid":           user_info["uid"],
        "email":         user_info["email"],
        "email_verified": user_info["email_verified"],
        "display_name":  user_info.get("display_name"),
        "photo_url":     user_info.get("photo_url"),
        "local_user_id": local_user.id if local_user else None,
    }
