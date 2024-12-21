from django.urls import path
from .views import PublicFileView, PublicFileSettingsView

urlpatterns = [
    path("files/<str:file_uuid>/", PublicFileView.as_view(), name="public_file"),
    path("files/settings/<int:file_id>/", PublicFileSettingsView.as_view(), name="public_file_settings"),
]
