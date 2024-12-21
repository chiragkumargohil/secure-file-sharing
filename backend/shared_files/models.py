from django.db import models
from files.models import File
from django.conf import settings

class SharedFile(models.Model):
  PERMISSION_TYPES = [('view', 'View'), ('download', 'Download'), ('edit', 'Edit')]

  file = models.ForeignKey(File, on_delete=models.CASCADE)
  sender_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  receiver_email = models.EmailField()
  access_type = models.CharField(max_length=255, choices=PERMISSION_TYPES)
  message = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  
  class Meta:
    unique_together = ('file', 'receiver_email')

  def __str__(self):
    return self.receiver_email