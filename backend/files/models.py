from django.db import models
from django.conf import settings
import uuid

# the file directory will be stored in the secure_files folder with user id as the folder name
def user_directory_path(instance, filename):
  return 'private_storage/secure_files/{0}/{1}'.format(instance.owner.id, filename)

class File(models.Model):
  owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  filename = models.CharField(max_length=255)
  file = models.FileField(upload_to=user_directory_path)
  mime_type = models.CharField(max_length=255)
  size = models.IntegerField()
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return self.filename