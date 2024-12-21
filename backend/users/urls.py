from django.urls import path
from .views import UserRegisterView, UserLoginView, UserProfileView, UserLogoutView, DriveAccessListView, DriveAccessView

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("logout/", UserLogoutView.as_view(), name="logout"),
    path("access/", DriveAccessListView.as_view(), name="access_list"),
    path("access/<str:email>/", DriveAccessView.as_view(), name="access"),
]
