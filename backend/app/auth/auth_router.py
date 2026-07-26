"""
Auth router — Firebase edition.

Registration and login are now handled entirely by the Firebase SDK on the
frontend.  These endpoints remain for:
  - /auth/me       → return current user info (still useful)
  - /auth/sync     → auto-provision user row on first Firebase login
  - Legacy /auth/register and /auth/login kept but deprecated.
    They will 410 Gone in a future release.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User
from backend.app.schemas import UserCreate, UserLogin, TokenResponse
from backend.app.auth.password_utils import hash_password, verify_password
from backend.app.auth.jwt_handler import create_access_token
from backend.app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Active endpoints ──────────────────────────────────────────────────────────

@router.get("/me")
async def get_current_user_info(user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return {
        "id":         user.id,
        "email":      user.email,
        "is_active":  user.is_active,
        "created_at": user.created_at,
        "firebase_uid": user.firebase_uid,
    }


@router.post("/sync")
async def sync_firebase_user(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Called once after first Firebase sign-in to ensure the user row exists.
    The dependency already auto-creates the row, so this is mostly a no-op
    that returns the profile — useful as a sign-in 'ping'.
    """
    return {
        "id":         user.id,
        "email":      user.email,
        "is_active":  user.is_active,
        "created_at": user.created_at,
    }


# ── Legacy endpoints (deprecated — kept for backward compat) ─────────────────

@router.post("/register", response_model=TokenResponse, deprecated=True)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Deprecated: use Firebase SDK on the frontend.
    Kept so existing clients don't hard-break during the migration window.
    """
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(email=user_in.email, hashed_password=hash_password(user_in.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse, deprecated=True)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """
    Deprecated: use Firebase SDK on the frontend.
    """
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if not db_user or not verify_password(user_in.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password", deprecated=True)
def forgot_password_legacy():
    """Deprecated: Firebase handles password reset emails automatically."""
    return {
        "message": "Password reset is now handled by Firebase. "
                   "Use the 'Forgot password?' link on the login page.",
        "deprecated": True,
    }


@router.post("/reset-password", deprecated=True)
def reset_password_legacy():
    """Deprecated: Firebase handles password reset via oobCode."""
    return {
        "message": "Password reset is now handled by Firebase. "
                   "Use the reset link sent to your email.",
        "deprecated": True,
    }
