# app/emails.py
from django.core.mail import send_mail
from smtplib import SMTPAuthenticationError
from django.conf import settings

def send_password_otp_email(to_email: str, code: str, minutes: int = 10):
    """
    Send password reset OTP email via SMTP2GO
    """
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("Email not sent: SMTP credentials missing.")
        return False

    subject = "Password Reset Code - M Eaton Trucking LLC"
    body = f"""Hello,

You have requested to reset your password for your M Eaton Trucking LLC account.

Your one-time password reset code is: {code}

This code will expire in {minutes} minutes.

If you did not request this password reset, please ignore this email. Your account remains secure.

Best regards,
M Eaton Trucking LLC
"""
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False
        )
        return True
    except SMTPAuthenticationError as e:
        print(f"SMTP auth failed sending email: {e}")
        return False
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
