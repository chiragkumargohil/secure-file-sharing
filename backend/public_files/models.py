from django.db import models
from django.conf import settings
import uuid
from files.models import File
from datetime import datetime

class PublicFile(models.Model):
  uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
  file = models.OneToOneField(File, on_delete=models.CASCADE)
  is_active = models.BooleanField(default=True)
  expiration_date = models.DateTimeField(null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  
  @property
  def link(self):
    return f"{settings.FRONTEND_URL}/files/public/{self.uuid}"
  
  def is_valid(self):
    if not self.is_active:
      return False
    if self.expiration_date and self.expiration_date < self.created_at:
      return False
    # check if the current date is before the expiration date
    # if self.expiration_date and datetime.now() > self.expiration_date:
    #   return False
    return True

  def __str__(self):
    return str(self.uuid)