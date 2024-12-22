from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import File, SharedFile
from rest_framework.decorators import authentication_classes
from files.serializers import SharedFileSerializer
from middleware.role_accessibility import role_accessibility
from middleware.skip_csrf import CSRFExemptSessionAuthentication
from .serializers import GetSharedFilesSerializer
from common.utils.send_email import send_email
from django.conf import settings

@authentication_classes([CSRFExemptSessionAuthentication])
class SharedFileView(APIView):
  @role_accessibility(['admin', 'editor'])
  def post(self, request, file_id):
    try:
      file = File.objects.get(id=file_id)
      # Check if the user has permission to share the file
      if str(file.owner) != str(request.owner):
        return Response({"error": "You do not have permission to share this file"}, status=status.HTTP_403_FORBIDDEN)
      
      body = request.data
      new_data = body.get('data')
      
      # new_data is a list of dictionaries
      for data in new_data:
        receiver_email = data.get('email')
        access_type = data.get('access_type')
        
        # check if the user already has access to the file and the access type is the same
        shared_file = SharedFile.objects.filter(file=file, receiver_email=receiver_email).first()
        if shared_file and shared_file.access_type == access_type:
          pass
        elif shared_file and shared_file.access_type != access_type:
          # if the user already has access to the file but the access type is different, update the access type
          shared_file.access_type = access_type
          shared_file.save()
        else:
          # if the user does not have access to the file, create a new share file object
          SharedFile.objects.create(
            file=file,
            receiver_email=receiver_email,
            access_type=access_type,
            sender_user=request.owner,
            shared_by=request.user
          )
          
          # send an email to the user
          send_email(
            "File Shared",
            f"A file has been shared with you by {request.owner.email}. You can access it by logging in to the app. {settings.FRONTEND_URL}",
            [receiver_email],
          )
          
    
      # delete the records that are not in the new data
      SharedFile.objects.filter(file=file).exclude(receiver_email__in=[data.get('email') for data in new_data]).delete()
      
      return Response({"message": "File shared successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
  @role_accessibility(['admin', 'editor'])
  def get(self, request, file_id):
    """
    Return a list of emails of users with whom the current user has shared the file with the specified file_id.

    Args:
        request: The HTTP request object.
        file_id: The id of the file to get the shared emails for.

    Returns:
        Response: A response object containing a list of emails.
    """
    
    try:
      file = File.objects.get(id=file_id)
      
      if str(file.owner) != str(request.owner):
        return Response({"error": "You do not have permission to access this resource"}, status=status.HTTP_403_FORBIDDEN)

      share_files = SharedFile.objects.filter(file=file)
      
      serializer = GetSharedFilesSerializer(share_files, many=True)

      return Response({"emails": serializer.data}, status=status.HTTP_200_OK)
    except SharedFile.DoesNotExist:
      return Response({"emails": []}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SharedFilesView(APIView):
  @role_accessibility(['admin', 'editor'])
  def get(self, request):
    try:
      shared_files = SharedFile.objects.filter(receiver_email=request.owner.email)
      shared_files = SharedFileSerializer(shared_files, many=True).data

      return Response({"files": shared_files}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)