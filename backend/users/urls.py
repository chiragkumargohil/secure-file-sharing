from django.urls import path
from .views import UserRegisterView, UserLoginView, UserProfileView, UserLogoutView, DriveAccessListView, DriveAccessView, ResetPasswordConfirmView, ForgotPasswordView, SwitchDriveView, MFAQRCodeView

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("logout/", UserLogoutView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/<str:uidb64>/<str:token>/", ResetPasswordConfirmView.as_view(), name="reset_password"),
    path("access/", DriveAccessListView.as_view(), name="access_list"),
    path("access/<str:email>/", DriveAccessView.as_view(), name="access"),
    path("profile/switch-drive/", SwitchDriveView.as_view(), name="switch_drive"),
    path("profile/mfa/qr-code/", MFAQRCodeView.as_view(), name="mfa"),
]
