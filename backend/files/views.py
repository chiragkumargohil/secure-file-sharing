from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework import status
from .models import File
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import authentication_classes
from rest_framework.serializers import Serializer, FileField, ModelSerializer
from users.models import CustomUser

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