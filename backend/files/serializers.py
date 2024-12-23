from rest_framework.serializers import Serializer, FileField, ModelSerializer, CharField, SerializerMethodField
from .models import File
from shared_files.models import SharedFile

class UploadSerializer(Serializer):
  file = FileField()
  
  class Meta:
    fields = ['files']

class FileSerializer(ModelSerializer):
  class Meta:
    model = File
    fields = ['id', 'filename', 'file', 'mime_type', 'size', 'created_at', 'updated_at']

class FileSerializer(ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'filename', 'file', 'size', 'mime_type', 'created_at', 'updated_at']

class SharedFileSerializer(ModelSerializer):
    id = SerializerMethodField()
    owner = SerializerMethodField()
    filename = SerializerMethodField()
    file = SerializerMethodField()
    size = SerializerMethodField()
    mime_type = SerializerMethodField()
    created_at = SerializerMethodField()
    updated_at = SerializerMethodField()
    access_type = CharField()

    class Meta:
        model = SharedFile
        fields = [
            'id',
            'owner',
            'filename',
            'file',
            'size',
            'mime_type',
            'created_at',
            'updated_at',
            'access_type',
        ]

    def get_id(self, obj):
        return obj.file.id

    def get_filename(self, obj):
        return obj.file.filename
    
    def get_owner(self, obj):
        return obj.file.owner.email

    def get_file(self, obj):
        return obj.file.file.url if obj.file.file else None

    def get_size(self, obj):
        return obj.file.size

    def get_mime_type(self, obj):
        return obj.file.mime_type

    def get_created_at(self, obj):
        return obj.file.created_at

    def get_updated_at(self, obj):
        return obj.file.updated_at