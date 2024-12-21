from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from .models import PublicFile
from django.conf import settings
from django.shortcuts import get_object_or_404
from files.models import File
from rest_framework.decorators import authentication_classes
from middleware.skip_csrf import CSRFExemptSessionAuthentication

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
      
      response = FileResponse(public_file.file.file, as_attachment=True, filename=public_file.file.filename)
      return response
    except PublicFile.DoesNotExist:
      return Response({"error": "Link not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)

# disable CSRF protection
@authentication_classes([CSRFExemptSessionAuthentication])
class PublicFileSettingsView(APIView):
  def get(self, request, file_id):
    try:
      # get the file
      file = get_object_or_404(File, id=file_id)
      # fetch the last shareable link
      shareable_link = PublicFile.objects.filter(file=file).latest('created_at')
      
      # send filename, expiration date, and is_active to the client
      return Response({"is_active": shareable_link.is_active, "expiration_date": shareable_link.expiration_date, "id": shareable_link.uuid}, status=status.HTTP_200_OK)
    except PublicFile.DoesNotExist:
      return Response({"is_active": False, "expiration_date": None, "id": None}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
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
      if str(file.owner) != str(request.user):
        return Response({"error": "You do not have permission to share this file"}, status=status.HTTP_403_FORBIDDEN)
      
      body = request.data
      is_active = body.get('is_active')
      expiration_date = body.get('expiration_date')
      
      # Check if the file is already shared
      public_file = PublicFile.objects.update_or_create(file=file, defaults={'is_active': is_active, 'expiration_date': expiration_date})
      
      return Response({"id": public_file[0]}, status=status.HTTP_200_OK)
    except File.DoesNotExist:
      return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)

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
      
      if str(file.owner) != str(request.user):
        return Response({"error": "You do not have permission to delete this file"}, status=status.HTTP_403_FORBIDDEN)
      
      public_file.delete()
      
      return Response({"message": "Link deleted successfully"}, status=status.HTTP_200_OK)
    except PublicFile.DoesNotExist:
      return Response({"error": "Link not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Something went wrong", "message": str(e)}, status=500)