from django.urls import path
from .views import FileView, DownloadFileView, DeleteFileView

urlpatterns = [
    path("files/", FileView.as_view(), name="files"),
    path("files/<int:file_id>/download/", DownloadFileView.as_view(), name="download_file"),
    path("files/<int:file_id>/delete/", DeleteFileView.as_view(), name="delete_file"),
]
