from .models import SharedFile
from rest_framework.serializers import ModelSerializer

class GetSharedFilesSerializer(ModelSerializer):
  class Meta:
    model = SharedFile
    fields = '__all__'