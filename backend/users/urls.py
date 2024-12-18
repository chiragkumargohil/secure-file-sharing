from django.urls import path
from .views import UserRegisterView, UserLoginView, UserProfileView, UserLogoutView

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("logout/", UserLogoutView.as_view(), name="logout"),
]
