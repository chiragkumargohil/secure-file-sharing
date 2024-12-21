from django.urls import path
from .views import FilesView, FileView, DownloadFileView

urlpatterns = [
    path("files/", FilesView.as_view(), name="files"),
    path("files/<int:file_id>/", FileView.as_view(), name="file"),
    path("files/download/<int:file_id>/", DownloadFileView.as_view(), name="download_file"),
]
