from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.core.logger import logger


def generate_password_reset_token(email: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a JWT token for password reset with 1-hour expiry.
    
    Args:
        email: User email address
        expires_delta: Custom expiry duration (default: 1 hour)
    
    Returns:
        JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=1)
    
    to_encode = {
        "sub": email,
        "exp": expire,
        "type": "password_reset"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify password reset token and return the email address.
    
    Args:
        token: JWT token string
    
    Returns:
        Email address if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "password_reset":
            logger.warning(f"Invalid token type or missing email in reset token")
            return None
        
        return email
    
    except ExpiredSignatureError:
        logger.warning("Password reset token has expired")
        return None
    except JWTError as e:
        logger.warning(f"Invalid password reset token: {str(e)}")
        return None


def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email to user via SMTP.
    
    Args:
        email: User email address
        reset_token: JWT reset token
    
    Returns:
        True if sent successfully, False otherwise
    """
    reset_link = f"{settings.frontend_url}/reset-password?token={reset_token}"
    
    try:
        # Create email message
        subject = "Password Reset Request - Diabetic Ulcer AI System"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You have requested to reset your password. Click the button below to proceed:</p>
                    <p>
                        <a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p><code>{reset_link}</code></p>
                    <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
                    <hr>
                    <p style="color: #999; font-size: 11px;">
                        If you did not request this password reset, please ignore this email or contact support if you have concerns.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Password Reset Request
        
        Hello,
        
        You have requested to reset your password. Visit this link to proceed:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email.
        """
        
        # Create MIME message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = email
        
        # Attach plain text and HTML versions
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        msg.attach(part1)
        msg.attach(part2)
        
        # If SMTP credentials are not configured, fall back to log-only mode.
        if not settings.smtp_username or not settings.smtp_password:
            logger.warning("SMTP credentials are missing; falling back to log-only password reset link.")
            logger.info(f"[DEV FALLBACK] Password reset email for {email}:")
            logger.info(f"  Link: {reset_link}")
            logger.info(f"  Subject: {subject}")
            return True
        
        # Send email via SMTP
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()  # Enable TLS encryption
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
        
        logger.info(f"Password reset email sent to {email}")
        return True
    
    except smtplib.SMTPAuthenticationError:
        logger.error(f"SMTP authentication failed. Check SMTP_USERNAME and SMTP_PASSWORD in .env")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error while sending password reset email to {email}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
        return False
