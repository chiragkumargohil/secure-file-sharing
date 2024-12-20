from django.urls import path
from .views import FileView, DownloadFileView, DeleteFileView, ShareFileLinkView, PostFileLinkView, GetShareSettingsView, ShareFileView, GetSharedFilesView

urlpatterns = [
    path("files/", FileView.as_view(), name="files"),
    path("files/<int:file_id>/download/", DownloadFileView.as_view(), name="download_file"),
    path("files/<int:file_id>/delete/", DeleteFileView.as_view(), name="delete_file"),
    path("files/public/<str:file_uuid>/", ShareFileLinkView.as_view(), name="share_file_link"),
    path("files/<str:file_id>/link/", PostFileLinkView.as_view(), name="post_file_link"),
    path("files/<str:file_id>/share/settings/", GetShareSettingsView.as_view(), name="get_share_settings"),
    path("files/<str:file_id>/share/", ShareFileView.as_view(), name="share_file"),
    path("files/share/", GetSharedFilesView.as_view(), name="get_shared_files"),
]
