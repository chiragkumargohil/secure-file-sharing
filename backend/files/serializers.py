from rest_framework.serializers import Serializer, FileField, ModelSerializer
from .models import File

class UploadSerializer(Serializer):
  file = FileField()
  
  class Meta:
    fields = ['files']

class FileSerializer(ModelSerializer):
  class Meta:
    model = File
    fields = ['id', 'filename', 'file', 'mime_type', 'size', 'created_at', 'updated_at']