"""
Firebase token verification for FastAPI.

Every protected route calls `get_current_user`.
The frontend sends:  Authorization: Bearer <Firebase ID token>
This dependency verifies the token with Firebase Admin SDK,
then looks up (or auto-creates) the matching User row in the DB.
"""
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User

logger = logging.getLogger(__name__)
security = HTTPBearer()

# ── Firebase Admin initialisation (done once at import time) ──────────────────
_firebase_ready = False

def _init_firebase():
    global _firebase_ready
    if _firebase_ready:
        return True
    try:
        import firebase_admin
        from firebase_admin import credentials, auth as fb_auth  # noqa: F401
        if not firebase_admin._apps:
            import os, json
            sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
            sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
            project_id = os.getenv("FIREBASE_PROJECT_ID", "")

            if sa_path and os.path.exists(sa_path):
                cred = credentials.Certificate(sa_path)
            elif sa_json:
                cred = credentials.Certificate(json.loads(sa_json))
            elif project_id:
                # Use Application Default Credentials (works on GCP / Cloud Run)
                cred = credentials.ApplicationDefault()
            else:
                logger.warning(
                    "Firebase Admin SDK not configured — falling back to legacy JWT auth. "
                    "Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID in .env"
                )
                return False

            firebase_admin.initialize_app(cred, {"projectId": project_id} if project_id else {})
        _firebase_ready = True
        return True
    except ImportError:
        logger.warning("firebase-admin not installed — falling back to legacy JWT auth.")
        return False
    except Exception as e:
        logger.error(f"Firebase Admin init failed: {e}")
        return False

# ── Token verification ────────────────────────────────────────────────────────

def _verify_firebase_token(token: str) -> dict | None:
    """Return decoded Firebase token dict, or None on failure."""
    try:
        from firebase_admin import auth as fb_auth
        return fb_auth.verify_id_token(token, check_revoked=True)
    except Exception as e:
        logger.debug(f"Firebase token verification failed: {e}")
        return None

def _verify_legacy_jwt(token: str) -> str | None:
    """Fallback: verify our old HS256 JWT and return email."""
    try:
        from backend.app.auth.jwt_handler import decode_token
        return decode_token(token)
    except Exception:
        return None

# ── Main dependency ───────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    email: str | None = None
    uid:   str | None = None

    firebase_ready = _init_firebase()

    if firebase_ready:
        decoded = _verify_firebase_token(token)
        if decoded:
            email = decoded.get("email")
            uid   = decoded.get("uid")
    else:
        # Graceful fallback while you're still migrating
        email = _verify_legacy_jwt(token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Look up user; auto-provision on first Firebase login
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password="",        # no password — Firebase owns auth
            is_active=True,
            firebase_uid=uid,
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise HTTPException(status_code=500, detail="User provisioning failed")

    return user


# ── Optional Auth (for public endpoints) ──────────────────────────────────────

async def optional_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Optional authentication dependency.
    Returns User if valid token provided, None otherwise.
    Does not raise 401 errors - allows public access.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    email: str | None = None
    uid: str | None = None

    firebase_ready = _init_firebase()

    if firebase_ready:
        decoded = _verify_firebase_token(token)
        if decoded:
            email = decoded.get("email")
            uid = decoded.get("uid")
    else:
        email = _verify_legacy_jwt(token)

    if not email:
        return None

    # Look up user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Auto-provision user on first Firebase login
        user = User(
            email=email,
            hashed_password="",
            is_active=True,
            firebase_uid=uid,
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter(User.email == email).first()

    return user
