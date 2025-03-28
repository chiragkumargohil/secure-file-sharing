from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from .models import PublicFile
from django.shortcuts import get_object_or_404
from files.models import File
from rest_framework.decorators import authentication_classes
from middleware.skip_csrf import CSRFExemptSessionAuthentication
from middleware.role_accessibility import role_accessibility
from django.utils import timezone

class PublicFileView(APIView):
  def get(self, request, file_uuid):
    """
    Return a file response with the specified uuid.

    Args:
        request: The HTTP request object.
        file_uuid: The uuid of the file to download.

    Returns:
        FileResponse: A file response containing the file.
    """
    try:
      public_file = PublicFile.objects.filter(uuid=file_uuid).latest('created_at')
      
      is_valid = public_file.is_valid()
      
      if not is_valid:
        return Response({"error": "Link has expired"}, status=status.HTTP_400_BAD_REQUEST)

      if public_file.expiration_date and public_file.expiration_date.date() < timezone.now().date():
        return Response({"error": "Link has expired"}, status=status.HTTP_400_BAD_REQUEST)
      
      file = public_file.file

      decrypted_file = file.get_decrypted_file()
      
      filename = file.filename
      if filename.endswith('.enc'):
          filename = filename[:-4]
      
      response = FileResponse(decrypted_file, as_attachment=True, filename=filename)
      response['x-filename'] = filename
      response['x-file-size'] = file.size
      response['x-file-owner-email'] = file.owner
      response['x-file-created-at'] = file.created_at
      return response
    except PublicFile.DoesNotExist:
      return Response({"error": "Link not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)

# disable CSRF protection
@authentication_classes([CSRFExemptSessionAuthentication])
class PublicFileSettingsView(APIView):
  @role_accessibility(['admin', 'editor'])
  def get(self, request, file_id):
    try:
      # get the file
      file = get_object_or_404(File, id=file_id)
      
      if str(file.owner) != str(request.owner):
        return Response({"error": "You do not have permission to access this resource"}, status=status.HTTP_403_FORBIDDEN)

      # fetch the last shareable link
      shareable_link = PublicFile.objects.filter(file=file).latest('created_at')
      
      # send filename, expiration date, and is_active to the client
      return Response({"is_active": shareable_link.is_active, "expiration_date": shareable_link.expiration_date, "id": shareable_link.uuid}, status=status.HTTP_200_OK)
    except PublicFile.DoesNotExist:
      return Response({"is_active": False, "expiration_date": None, "id": None}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
  @role_accessibility(['admin', 'editor'])
  def post(self, request, file_id):
    """
    Create / update a public link for a file.

    Args:
        request: The HTTP request object.
        file_id: The id of the file to share.

    Returns:
        Response: A response object containing the uuid of the shared file.
    """
    try:
      file = get_object_or_404(File, id=file_id)

      # Check if the user has permission to share the file
      if str(file.owner) != str(request.owner):
        return Response({"error": "You do not have permission to share this file"}, status=status.HTTP_403_FORBIDDEN)
      
      body = request.data
      is_active = body.get('is_active')
      expiration_date = body.get('expiration_date')
      
      # Check if the file is already shared
      public_file = PublicFile.objects.update_or_create(file=file, defaults={'is_active': is_active, 'expiration_date': expiration_date})
      
      return Response({"id": public_file[0].uuid}, status=status.HTTP_200_OK)
    except File.DoesNotExist:
      return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)


  @role_accessibility(['admin', 'editor'])
  def delete(self, request, file_id):
    """
    Delete a public link for a file.

    Args:
        request: The HTTP request object.
        file_id: The id of the file to delete the link for.

    Returns:
        Response: A response object containing a message indicating if the deletion was successful or not.
    """
    try:
      file = get_object_or_404(File, id=file_id)
      
      public_file = PublicFile.objects.filter(file=file).latest('created_at')
      
      if str(file.owner) != str(request.owner):
        return Response({"error": "You do not have permission to delete this file"}, status=status.HTTP_403_FORBIDDEN)
      
      public_file.delete()
      
      return Response({"message": "Link deleted successfully"}, status=status.HTTP_200_OK)
    except PublicFile.DoesNotExist:
      return Response({"error": "Link not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)