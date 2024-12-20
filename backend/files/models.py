from django.db import models
from django.conf import settings
import uuid

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

# Shareable files

class ShareableFileLink(models.Model):
  file_id = models.ForeignKey(File, on_delete=models.CASCADE)
  uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
  is_active = models.BooleanField(default=True)
  expiration_date = models.DateTimeField(null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  
  @property
  def link(self):
    return f"{settings.FRONTEND_URL}/share/{self.uuid}"
  
  def is_valid(self):
    if not self.is_active:
      return False
    if self.expiration_date and self.expiration_date < self.created_at:
      return False
    return True

  def __str__(self):
    return self.uuid

class ShareFile(models.Model):
  PERMISSION_TYPES = ['view', 'download', 'edit']

  file = models.ForeignKey(File, on_delete=models.CASCADE)
  sender_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  receiver_email = models.EmailField()
  access_type = models.CharField(max_length=255, choices=[('view', 'View'), ('download', 'Download'), ('edit', 'Edit')])
  message = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  
  class Meta:
    unique_together = ('file', 'receiver_email')
  
  def has_permission(self):
    return self.access_type in self.PERMISSION_TYPES

  def __str__(self):
    return self.receiver_email