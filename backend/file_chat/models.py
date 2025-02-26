from django.db import models
from django.conf import settings
from files.models import File
from django.utils import timezone

class FileChat(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.user.username} - {self.file.filename}'
    
    class Meta:
        ordering = ['-created_at']

class FileChatMessage(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    chat = models.ForeignKey(FileChat, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.role} - {self.content}'
    
    class Meta:
        ordering = ['created_at']
    
    def get_chat_history_by_file(file):
        return FileChatMessage.objects.filter(chat__file=file).order_by('created_at')