from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import File, SharedFile
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes
from rest_framework.serializers import ModelSerializer
from files.serializers import FileSerializer

# Skip CSRF validation for development
class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Skip CSRF validation
        return

class GetSharedFilesSerializer(ModelSerializer):
  class Meta:
    model = SharedFile
    fields = '__all__'

@authentication_classes([CSRFExemptSessionAuthentication])
class SharedFileView(APIView):
  def post(self, request, file_id):
    try:
      file = File.objects.get(id=file_id)
      # Check if the user has permission to share the file
      if str(file.owner) != str(request.user):
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
          SharedFile.objects.create(file=file, receiver_email=receiver_email, access_type=access_type, sender_user=request.user)
    
      # delete the records that are not in the new data
      SharedFile.objects.filter(file=file).exclude(receiver_email__in=[data.get('email') for data in new_data]).delete()
      
      return Response({"message": "File shared successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
  def get(self, request, file_id):
    try:
      file = File.objects.get(id=file_id)
      share_files = SharedFile.objects.filter(file=file)
      
      serializer = GetSharedFilesSerializer(share_files, many=True)

      return Response({"emails": serializer.data}, status=status.HTTP_200_OK)
    except SharedFile.DoesNotExist:
      return Response({"emails": []}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class ShareFileSerializer(ModelSerializer):
  class Meta:
    model = SharedFile
    # fields from File model
  

class SharedFilesView(APIView):
  def get(self, request):
    try:
      shared_files = SharedFile.objects.filter(receiver_email=request.user.email)
      
      shared_files = File.objects.filter(id__in=[file.file_id for file in shared_files])
      
      serializer = FileSerializer(shared_files, many=True)

      return Response({"files": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)