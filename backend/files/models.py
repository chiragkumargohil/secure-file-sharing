from django.db import models
from django.conf import settings

# files and folders models

class Folder(models.Model):
  name = models.CharField(max_length=255)
  owner_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  parent_id = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return self.name

class File(models.Model):
  owner_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  folder_id = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True)
  name = models.CharField(max_length=255)
  file = models.FileField(upload_to='secure_files/')
  mime_type = models.CharField(max_length=255)
  size = models.IntegerField()
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return self.name