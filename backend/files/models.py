from django.db import models
from django.conf import settings
from common.utils.file_encryption import encrypt_file
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
  added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='files_added_by')
  
  class Meta:
    ordering = ['-created_at']
  
  def save(self, *args, **kwargs):
    file_data = self.file.read()
    ciphertext, self.encryption_iv, self.encryption_tag, self.encryption_key = encrypt_file(file_data)
    # self.filename = f"{self.file.name}.enc"
    self.size = len(ciphertext)
    self.file.save(self.filename, ContentFile(ciphertext), save=False)
    super(File, self).save(*args, **kwargs)

  def get_decrypted_file(self):
    """
    Return a ContentFile containing the decrypted file content.

    This method will read the encrypted file content from the storage backend,
    decrypt it using the stored encryption key, iv, and tag, and then return a
    ContentFile object containing the decrypted content.

    The file object is closed after reading, so it can be re-opened or used for
    other operations without having to worry about the file being open.

    Returns:
      ContentFile: A ContentFile containing the decrypted file content.
    """
    from common.utils.file_encryption import decrypt_file
    file_data = self.file.read()
    plaintext = decrypt_file(
      ciphertext = file_data,
      iv = self.encryption_iv,
      tag = self.encryption_tag,
      key = self.encryption_key
    )
    self.file.close()
    return ContentFile(plaintext)

  def __str__(self):
    return self.filename