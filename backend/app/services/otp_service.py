"""
OTP service for password reset.
Generates 6-digit OTPs, stores them in memory with expiry, verifies them.
"""
import random
import string
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# In-memory OTP store: { email: { otp, expires_at, attempts } }
# For production at scale, replace with Redis. For single-server, this works fine.
_otp_store: dict[str, dict] = {}

OTP_EXPIRY_SECONDS = 600   # 10 minutes
OTP_MAX_ATTEMPTS   = 5     # lock out after 5 wrong tries


def generate_otp(email: str) -> str:
    """Generate a 6-digit OTP for the given email and store it."""
    otp = "".join(random.choices(string.digits, k=6))
    _otp_store[email.lower()] = {
        "otp":        otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
        "attempts":   0,
        "verified":   False,
    }
    logger.info(f"OTP generated for {email} (expires in {OTP_EXPIRY_SECONDS}s)")
    return otp


def verify_otp(email: str, otp: str) -> tuple[bool, str]:
    """
    Verify OTP. Returns (success, message).
    On success marks the OTP as verified so the reset step can proceed.
    """
    key = email.lower()
    record = _otp_store.get(key)

    if not record:
        return False, "No OTP found for this email. Please request a new one."

    if time.time() > record["expires_at"]:
        _otp_store.pop(key, None)
        return False, "OTP has expired. Please request a new one."

    if record["attempts"] >= OTP_MAX_ATTEMPTS:
        _otp_store.pop(key, None)
        return False, "Too many incorrect attempts. Please request a new OTP."

    if record["otp"] != otp.strip():
        record["attempts"] += 1
        remaining = OTP_MAX_ATTEMPTS - record["attempts"]
        return False, f"Incorrect OTP. {remaining} attempt(s) remaining."

    # Correct — mark as verified
    record["verified"] = True
    logger.info(f"OTP verified for {email}")
    return True, "OTP verified"


def is_otp_verified(email: str) -> bool:
    """Check if a verified OTP exists (allows the password reset step)."""
    key = email.lower()
    record = _otp_store.get(key)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        _otp_store.pop(key, None)
        return False
    return record.get("verified", False)


def consume_otp(email: str) -> bool:
    """Remove OTP after password has been reset (one-time use)."""
    return bool(_otp_store.pop(email.lower(), None))
