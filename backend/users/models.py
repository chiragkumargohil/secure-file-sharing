from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    selected_drive = models.ForeignKey('users.DriveAccess', on_delete=models.SET_NULL, blank=True, null=True)

    # remove is_staff field
    is_staff = None

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

    class Meta:
        unique_together = ('owner', 'receiver_email')

    def __str__(self):
        return self.receiver_email