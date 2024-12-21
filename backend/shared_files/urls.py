from django.urls import path
from .views import SharedFileView, SharedFilesView

urlpatterns = [
  path("files/", SharedFilesView.as_view(), name="shared_files"),
  path("files/<int:file_id>/", SharedFileView.as_view(), name="shared_file"),
]
