from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework import status
from .models import File, ShareableFileLink, ShareFile
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes
from rest_framework.serializers import Serializer, FileField, ModelSerializer
from users.models import CustomUser
from django.shortcuts import get_object_or_404

class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Skip CSRF validation
        return

class UploadSerializer(Serializer):
  file = FileField()
  
  class Meta:
    fields = ['file']

class FileSerializer(ModelSerializer):
  class Meta:
    model = File
    fields = ['id', 'name', 'file', 'mime_type', 'size', 'created_at', 'updated_at']

# disable CSRF protection
@authentication_classes([CSRFExemptSessionAuthentication])
class FileView(APIView):
  serializer_class = UploadSerializer

  def post(self, request):
    file = request.FILES.get('file')
    print(file)
    if not file:
      return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
    
    user_instance = CustomUser.objects.get(id=request.user.id)
    
    # Save the file to the database
    File.objects.create(
      owner_id=user_instance,
      folder_id=request.data.get('folder_id'),
      name=file.name,
      file=file,
      mime_type=file.content_type,
      size=file.size
    )

    return Response({"message": "File uploaded successfully"}, status=status.HTTP_200_OK)
  
  def get(self, request):
    files = File.objects.filter(owner_id=request.user.id)
    files = FileSerializer(files, many=True).data
    return Response({"files": files}, status=status.HTTP_200_OK)

class DownloadFileView(APIView):
  def get(self, request, file_id):
    file = File.objects.get(id=file_id)

    # Check if the user has permission to download the file
    if str(file.owner_id) != str(request.user.username):
      return Response({"error": "You do not have permission to download this file"}, status=status.HTTP_403_FORBIDDEN)
    
    # Return the file response
    return FileResponse(file.file, as_attachment=True, filename=file.name)

@authentication_classes([CSRFExemptSessionAuthentication])
class DeleteFileView(APIView):
  def delete(self, request, file_id):
    file = File.objects.get(id=file_id)

    # Check if the user has permission to delete the file
    if str(file.owner_id) != str(request.user.username):
      return Response({"error": "You do not have permission to delete this file"}, status=status.HTTP_403_FORBIDDEN)
    file_path = file.file.path
    # Delete the file from the database
    file.delete()
    
    # delete the file from the server
    import os
    if os.path.exists(file_path):
      os.remove(file_path)

    return Response({"message": "File deleted successfully"}, status=status.HTTP_200_OK)

class ShareFileLinkView(APIView):
  def get(self, request, file_uuid):
    shareable_link = ShareableFileLink.objects.filter(uuid=file_uuid).latest('created_at')
    
    is_valid = shareable_link.is_valid()
    
    if not is_valid:
      return Response({"error": "Link has expired"}, status=status.HTTP_400_BAD_REQUEST)
    
    response = FileResponse(shareable_link.file_id.file, as_attachment=False, filename=shareable_link.file_id.name)
    
    # send filename, expiration date, and is_active to the client
    response['X-File-Name'] = shareable_link.file_id.name
    return response
  
  def delete(self, request, file_uuid):
    shareable_link = ShareableFileLink.objects.get(uuid=file_uuid)
    
    file = shareable_link.file
    
    if str(file.owner_id) != str(request.user.username):
      return Response({"error": "You do not have permission to delete this file"}, status=status.HTTP_403_FORBIDDEN)
    
    shareable_link.delete()
    
    return Response({"message": "Link deleted successfully"}, status=status.HTTP_200_OK)
  
  # update expiration date or/and is_active
  def put(self, request, file_uuid):
    shareable_link = ShareableFileLink.objects.get(uuid=file_uuid)
    
    file = shareable_link.file_id.file
    
    if str(file.owner_id) != str(request.user.username):
      return Response({"error": "You do not have permission to update this file"}, status=status.HTTP_403_FORBIDDEN)
    
    body = request.data
    expiration_date = body.get('expiration_date')
    is_active = body.get('is_active')
    
    shareable_link.expiration_date = expiration_date
    shareable_link.is_active = is_active
    shareable_link.save()
    
    return Response({"message": "Link updated successfully"}, status=status.HTTP_200_OK)

# disable CSRF protection
@authentication_classes([CSRFExemptSessionAuthentication])
class PostFileLinkView(APIView):
  
  def post(self, request, file_id):
    file = File.objects.get(id=file_id)

    # Check if the user has permission to share the file
    if str(file.owner_id) != str(request.user.username):
      return Response({"error": "You do not have permission to share this file"}, status=status.HTTP_403_FORBIDDEN)
    
    body = request.data
    is_active = body.get('is_active')
    expiration_date = body.get('expiration_date')
    
    # Check if the link already exists
    shareable_link = ShareableFileLink.objects.filter(file_id=file).latest('created_at')
    if shareable_link:
      shareable_link.is_active = is_active
      shareable_link.expiration_date = expiration_date
      shareable_link.save()
    else:
      shareable_link = ShareableFileLink.objects.create(file_id=file, expiration_date=expiration_date, is_active=is_active)
    
    return Response({"id": shareable_link.uuid}, status=status.HTTP_200_OK)

class GetShareSettingsView(APIView):
  def get(self, request, file_id):
    # get the file
    file = get_object_or_404(File, id=file_id)

    try:
      # fetch the last shareable link
      shareable_link = ShareableFileLink.objects.filter(file_id=file).latest('created_at')
      
      # send filename, expiration date, and is_active to the client
      return Response({"is_active": shareable_link.is_active, "expiration_date": shareable_link.expiration_date, "id": shareable_link.uuid}, status=status.HTTP_200_OK)
    except ShareableFileLink.DoesNotExist:
      return Response({"is_active": False, "expiration_date": None, "id": None}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetSharedFilesSerializer(ModelSerializer):
  class Meta:
    model = ShareFile
    fields = '__all__'

# views for share file with other users
@authentication_classes([CSRFExemptSessionAuthentication])
class ShareFileView(APIView):
  def post(self, request, file_id):
    try:
      file = File.objects.get(id=file_id)
      # Check if the user has permission to share the file
      if str(file.owner_id) != str(request.user.username):
        return Response({"error": "You do not have permission to share this file"}, status=status.HTTP_403_FORBIDDEN)
      
      body = request.data
      new_data = body.get('data')
      
      # new_data is a list of dictionaries
      for data in new_data:
        receiver_email = data.get('email')
        access_type = data.get('access_type')
        
        # check if the user already has access to the file and the access type is the same
        share_file = ShareFile.objects.filter(file=file, receiver_email=receiver_email).first()
        if share_file and share_file.access_type == access_type:
          pass
        elif share_file and share_file.access_type != access_type:
          # if the user already has access to the file but the access type is different, update the access type
          share_file.access_type = access_type
          share_file.save()
        else:
          # if the user does not have access to the file, create a new share file object
          ShareFile.objects.create(file=file, receiver_email=receiver_email, access_type=access_type, sender_user=request.user)
    
      # delete the records that are not in the new data
      ShareFile.objects.filter(file=file).exclude(receiver_email__in=[data.get('email') for data in new_data]).delete()
      
      return Response({"message": "File shared successfully"}, status=status.HTTP_200_OK)
    # if unique_together constraint fails
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
  def get(self, request, file_id):
    try:
      file = File.objects.get(id=file_id)
      share_files = ShareFile.objects.filter(file=file)
      
      serializer = GetSharedFilesSerializer(share_files, many=True)

      return Response({"emails": serializer.data}, status=status.HTTP_200_OK)
    except ShareFile.DoesNotExist:
      return Response({"emails": []}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class ShareFileSerializer(ModelSerializer):
  class Meta:
    model = ShareFile
    # fields from File model
  

class GetSharedFilesView(APIView):
  def get(self, request):
    try:
      shared_files = ShareFile.objects.filter(receiver_email=request.user.email)
      
      shared_files = File.objects.filter(id__in=[file.file_id for file in shared_files])
      
      serializer = FileSerializer(shared_files, many=True)

      return Response({"files": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)