from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework import status
from .models import File
from rest_framework.decorators import authentication_classes
from django.conf import settings
from .serializers import UploadSerializer, FileSerializer
from middleware.skip_csrf import CSRFExemptSessionAuthentication
from common.utils.file_encryption import decrypt_file
from django.core.files.base import ContentFile
from middleware.role_accessibility import role_accessibility
from shared_files.models import SharedFile

User = settings.AUTH_USER_MODEL

@authentication_classes([CSRFExemptSessionAuthentication])
class FilesView(APIView):
  serializer_class = UploadSerializer

  @role_accessibility(['admin', 'editor'])
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
          owner=request.owner,
          filename=file.name,
          file=file,
          mime_type=file.content_type,
          size=file.size,
          added_by=request.user
        )

      return Response({"message": "Files uploaded successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)
  
  @role_accessibility(['admin', 'editor', 'viewer'])
  def get(self, request):
    """
    Return a list of files uploaded by the current user.

    Returns:
        Response: A response object containing a list of files.
    """
    try:
      files = File.objects.filter(owner=request.owner)
      files = FileSerializer(files, many=True).data
      return Response({"files": files}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)


@authentication_classes([CSRFExemptSessionAuthentication])
class FileView(APIView):
  @role_accessibility(['admin', 'editor'])
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
      if str(file.owner) != str(request.owner):
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
  @role_accessibility(['admin', 'editor'])
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
      shared_file_with_user = SharedFile.objects.filter(file=file, receiver_email=request.owner.email).exists()

      # Check if the user has permission to download the file
      if str(file.owner) != str(request.owner) and not shared_file_with_user:
        return Response({"error": "You do not have permission to download this file"}, status=status.HTTP_403_FORBIDDEN)
      
      # Decrypt the file
      with open(file.file.path, 'rb') as f:
          ciphertext = f.read()

      decrypted_data = decrypt_file(
          ciphertext,
          file.encryption_key,
          file.encryption_iv,
          file.encryption_tag
      )
      
      file.file.close()
      
      filename = file.filename
      if filename.endswith('.enc'):
          filename = filename[:-4]
      
      # Return the file response
      return FileResponse(ContentFile(decrypted_data), as_attachment=True, filename=filename)
    except File.DoesNotExist:
      return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)