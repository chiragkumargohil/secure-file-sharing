import pyotp
from .send_email import send_email

def send_otp(email, mfa_secret):
    if not mfa_secret:
        raise ValueError("MFA is not enabled for this user.")
    
    totp = pyotp.TOTP(mfa_secret, interval=300)
    otp = totp.now()
    send_email(
        subject="Your Secure File Sharing OTP",
        message=f"Your OTP is: {otp}",
        recipient_list=[email],
    )

def verify_otp(mfa_secret, otp):
    if not mfa_secret:
        raise ValueError("MFA is not enabled for this user.")
    
    totp = pyotp.TOTP(mfa_secret, interval=300)
    return totp.verify(otp)
