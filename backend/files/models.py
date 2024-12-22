from django.db import models
from django.conf import settings
from common.utils.file_encryption import encrypt_file
from Crypto.Random import get_random_bytes
from django.core.files.base import ContentFile

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
  encryption_key = models.BinaryField(default=b'') # encryption key
  encryption_iv = models.BinaryField(default=b'') # initialization vector
  encryption_tag = models.BinaryField(default=b'') # GCM tag
  
  def save(self, *args, **kwargs):
    file_data = self.file.read()
    ciphertext, self.encryption_iv, self.encryption_tag, self.encryption_key = encrypt_file(file_data)
    # self.filename = f"{self.file.name}.enc"
    self.size = len(ciphertext)
    self.file.save(self.filename, ContentFile(ciphertext), save=False)
    super(File, self).save(*args, **kwargs)

  def __str__(self):
    return self.filename