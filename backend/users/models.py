from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    selected_drive = models.ForeignKey('users.DriveAccess', on_delete=models.SET_NULL, blank=True, null=True)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.email

# for giving access to account
class DriveAccess(models.Model):
    ROLES = [
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver_email = models.EmailField()
    role = models.CharField(max_length=255, choices=ROLES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='drive_access_added_by')

    class Meta:
        unique_together = ('owner', 'receiver_email')
        ordering = ['-created_at']

    def __str__(self):
        return self.receiver_email