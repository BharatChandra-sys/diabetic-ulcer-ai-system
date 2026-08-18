"""
Email service using Gmail SMTP.
Sends password reset emails directly from your Gmail account.
Far more reliable than Firebase's default sender (no spam issues).
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_body: str, text_body: str = "") -> bool:
    """
    Send an email via Gmail SMTP.
    Returns True on success, False on failure.
    """
    if not settings.smtp_username or not settings.smtp_password:
        logger.warning("SMTP credentials not configured — skipping email send")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"]      = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_from_email, to_email, msg.as_string())

        logger.info(f"Email sent to {to_email}: {subject}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP auth failed — check SMTP_USERNAME and SMTP_PASSWORD (use App Password, not Gmail password)")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Send a branded password reset email with the Firebase oobCode link.
    """
    subject = "Reset your MedVision AI password"

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f766e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                MedVision AI
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Diabetic Foot Ulcer Detection
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:600;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your MedVision AI account
                associated with <strong>{to_email}</strong>.
              </p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Click the button below to set a new password. This link expires in
                <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#0f766e;border-radius:50px;text-align:center;">
                    <a href="{reset_link}"
                       style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                If the button doesn't work, copy and paste this link:
              </p>
              <p style="margin:0;word-break:break-all;">
                <a href="{reset_link}" style="color:#0f766e;font-size:12px;">{reset_link}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 MedVision AI · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    text_body = f"""
Reset your MedVision AI password

We received a request to reset your password for {to_email}.

Click the link below to reset it (expires in 1 hour):
{reset_link}

If you didn't request this, ignore this email.

— MedVision AI Team
"""

    return send_email(to_email, subject, html_body, text_body)


def send_otp_email(to_email: str, otp: str) -> bool:
    """Send a branded OTP email for password reset."""
    subject = f"{otp} is your MedVision AI reset code"

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#0f766e;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">MedVision AI</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">Diabetic Foot Ulcer Detection</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;text-align:center;">
          <p style="margin:0 0 8px;color:#374151;font-size:16px;font-weight:600;">Your password reset code</p>
          <p style="margin:0 0 32px;color:#6b7280;font-size:14px;">Enter this code in the app to reset your password.</p>

          <!-- OTP Box -->
          <div style="display:inline-block;background:#f0fdf4;border:2px solid #0f766e;border-radius:12px;padding:20px 48px;margin-bottom:32px;">
            <span style="font-size:40px;font-weight:800;color:#0f766e;letter-spacing:12px;font-family:monospace;">{otp}</span>
          </div>

          <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">⏱ This code expires in <strong>10 minutes</strong>.</p>
          <p style="margin:0;color:#9ca3af;font-size:13px;">If you didn't request this, you can ignore this email.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">© 2026 MedVision AI · All rights reserved</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    text_body = f"""
Your MedVision AI password reset code: {otp}

Enter this code in the app to reset your password.
It expires in 10 minutes.

If you didn't request this, ignore this email.
"""
    return send_email(to_email, subject, html_body, text_body)
