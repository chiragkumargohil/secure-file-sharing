from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework import status
from .models import File
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes
from django.conf import settings
from .serializers import UploadSerializer, FileSerializer

User = settings.AUTH_USER_MODEL

# Skip CSRF validation for development
class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Skip CSRF validation
        return

@authentication_classes([CSRFExemptSessionAuthentication])
class FilesView(APIView):
  serializer_class = UploadSerializer

  def post(self, request):
    """
    Upload files to the server.

    The request should contain a files list with the files to be uploaded.

    Returns:
        Response: A response object containing a message indicating if the upload was successful or not.
    """
    try:
      files = request.FILES.getlist('files')
      if not files or len(files) == 0:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

      # save the files
      for file in files:
        File.objects.create(
          owner=request.user,
          filename=file.name,
          file=file,
          mime_type=file.content_type,
          size=file.size
        )

      return Response({"message": "Files uploaded successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)
  
  def get(self, request):
    """
    Return a list of files uploaded by the current user.

    Returns:
        Response: A response object containing a list of files.
    """
    try:
      files = File.objects.filter(owner=request.user)
      files = FileSerializer(files, many=True).data
      return Response({"files": files}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)


@authentication_classes([CSRFExemptSessionAuthentication])
class FileView(APIView):
  def delete(self, request, file_id):
    """
    Delete a file with the specified file_id.

    Args:
        request: The HTTP request object.
        file_id: The id of the file to delete.

    Returns:
        Response: A response object containing a message indicating if the deletion was successful or not.
    """
    try:
      file = File.objects.get(id=file_id)

      # Check if the user has permission to delete the file
      if str(file.owner) != str(request.user):
        return Response({"error": "You do not have permission to delete this file"}, status=status.HTTP_403_FORBIDDEN)
      file_path = file.file.path
      # Delete the file from the database
      file.delete()
      
      # delete the file from the server
      import os
      if os.path.exists(file_path):
        os.remove(file_path)

      return Response({"message": "File deleted successfully"}, status=status.HTTP_200_OK)
    except File.DoesNotExist:
      return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class DownloadFileView(APIView):
  def get(self, request, file_id):
    """
    Return a file response with the specified file_id.

    Args:
        request: The HTTP request object.
        file_id: The id of the file to download.

    Returns:
        FileResponse: A file response containing the file.
    """
    try:
      file = File.objects.get(id=file_id)

      # Check if the user has permission to download the file
      if str(file.owner) != str(request.user):
        return Response({"error": "You do not have permission to download this file"}, status=status.HTTP_403_FORBIDDEN)
      
      # Return the file response
      return FileResponse(file.file, as_attachment=True, filename=file.filename)
    except File.DoesNotExist:
      return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)