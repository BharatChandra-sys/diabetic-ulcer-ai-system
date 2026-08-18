"""
Firebase Admin SDK authentication proxy.
Backend handles all Firebase operations — frontend never sees Firebase config.
"""
import logging
import os
from typing import Optional
import requests
from app.config import settings

logger = logging.getLogger(__name__)

FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts"

# ── Firebase Admin SDK (for Google Sign-In token verification) ─────────────
_firebase_admin_initialized = False

def _init_firebase_admin():
    global _firebase_admin_initialized
    if _firebase_admin_initialized:
        return True
    try:
        import firebase_admin
        from firebase_admin import credentials

        if firebase_admin._apps:
            _firebase_admin_initialized = True
            return True

        # Priority 1: Single-line JSON string in env var (production on Render)
        sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "")
        if sa_json:
            import json
            cred = credentials.Certificate(json.loads(sa_json))
            firebase_admin.initialize_app(cred)
            _firebase_admin_initialized = True
            logger.info("✓ Firebase Admin SDK initialized via FIREBASE_SERVICE_ACCOUNT_JSON env var")
            return True

        # Priority 2: File path (local development)
        sa_path = settings.firebase_service_account_path
        if sa_path and os.path.exists(sa_path):
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
            _firebase_admin_initialized = True
            logger.info(f"✓ Firebase Admin SDK initialized via service account file: {sa_path}")
            return True

        logger.warning("Firebase Admin SDK not initialized — set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH")
        return False
    except Exception as e:
        logger.error(f"Firebase Admin init error: {e}")
        return False


def sign_up_with_email_password(email: str, password: str) -> dict:
    url = f"{FIREBASE_AUTH_URL}:signUp?key={settings.firebase_web_api_key}"
    response = requests.post(url, json={"email": email, "password": password, "returnSecureToken": True})
    if response.status_code != 200:
        raise ValueError(response.json().get("error", {}).get("message", "Sign up failed"))
    d = response.json()
    return {"id_token": d["idToken"], "refresh_token": d["refreshToken"],
            "expires_in": d["expiresIn"], "email": d["email"], "local_id": d["localId"]}


def sign_in_with_email_password(email: str, password: str) -> dict:
    url = f"{FIREBASE_AUTH_URL}:signInWithPassword?key={settings.firebase_web_api_key}"
    response = requests.post(url, json={"email": email, "password": password, "returnSecureToken": True})
    if response.status_code != 200:
        raise ValueError(response.json().get("error", {}).get("message", "Sign in failed"))
    d = response.json()
    return {"id_token": d["idToken"], "refresh_token": d["refreshToken"],
            "expires_in": d["expiresIn"], "email": d["email"], "local_id": d["localId"],
            "display_name": d.get("displayName", ""), "photo_url": d.get("photoUrl", "")}


def refresh_id_token(refresh_token: str) -> dict:
    url = f"https://securetoken.googleapis.com/v1/token?key={settings.firebase_web_api_key}"
    response = requests.post(url, json={"grant_type": "refresh_token", "refresh_token": refresh_token})
    if response.status_code != 200:
        raise ValueError(response.json().get("error", {}).get("message", "Token refresh failed"))
    d = response.json()
    return {"id_token": d["id_token"], "refresh_token": d["refresh_token"], "expires_in": d["expires_in"]}


def send_password_reset_email(email: str, app_url: str = "") -> dict:
    """Send password reset email. app_url is the continueUrl shown after reset."""
    url = f"{FIREBASE_AUTH_URL}:sendOobCode?key={settings.firebase_web_api_key}"
    payload = {"requestType": "PASSWORD_RESET", "email": email}
    if app_url:
        payload["continueUrl"] = app_url
    response = requests.post(url, json=payload)
    if response.status_code != 200:
        raise ValueError(response.json().get("error", {}).get("message", "Password reset failed"))
    return {"email": response.json()["email"], "message": "Password reset email sent"}


def confirm_password_reset(oob_code: str, new_password: str) -> dict:
    """Confirm password reset using the oobCode from the email link."""
    url = f"{FIREBASE_AUTH_URL}:resetPassword?key={settings.firebase_web_api_key}"
    response = requests.post(url, json={"oobCode": oob_code, "newPassword": new_password})
    if response.status_code != 200:
        raise ValueError(response.json().get("error", {}).get("message", "Confirm reset failed"))
    return {"email": response.json().get("email", ""), "message": "Password reset successfully"}


def verify_id_token(id_token: str) -> Optional[dict]:
    """Verify a Firebase ID token and return user info."""
    url = f"{FIREBASE_AUTH_URL}:lookup?key={settings.firebase_web_api_key}"
    response = requests.post(url, json={"idToken": id_token})
    if response.status_code != 200:
        logger.error("Firebase token verification failed")
        return None
    users = response.json().get("users", [])
    if not users:
        return None
    u = users[0]
    return {
        "uid": u["localId"],
        "email": u["email"],
        "email_verified": u.get("emailVerified", False),
        "display_name": u.get("displayName", ""),
        "photo_url": u.get("photoUrl", ""),
        "disabled": u.get("disabled", False)
    }


def verify_google_id_token(id_token: str) -> Optional[dict]:
    """
    Verify a Google ID token obtained from Google Sign-In (GSI).
    Uses Firebase Admin SDK to verify the token.
    Returns user info dict or None on failure.
    """
    if not _init_firebase_admin():
        # Fallback: verify via Firebase REST API
        return verify_id_token(id_token)
    
    try:
        from firebase_admin import auth as firebase_auth
        decoded = firebase_auth.verify_id_token(id_token)
        return {
            "uid":           decoded.get("uid"),
            "email":         decoded.get("email"),
            "email_verified": decoded.get("email_verified", True),
            "display_name":  decoded.get("name", ""),
            "photo_url":     decoded.get("picture", ""),
            "provider":      "google",
        }
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        return None
