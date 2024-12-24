from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from .models import File
from common.utils.file_encryption import decrypt_file

User = get_user_model()

class FileModelTest(TestCase):

    def setUp(self):
        # Create a test user
        self.owner = User.objects.create_user(username="testuser", password="testpass")

        # Create a test file
        self.test_file_content = b"This is a test file."
        self.test_file = SimpleUploadedFile(
            "testfile.txt", self.test_file_content, content_type="text/plain"
        )

    def test_file_save_and_encryption(self):
        # Create a File instance
        file_instance = File(
            owner=self.owner,
            filename="testfile.txt",
            file=self.test_file,
            mime_type="text/plain",
            size=len(self.test_file_content),
        )
        file_instance.save()

        # Fetch the saved instance
        saved_file = File.objects.get(id=file_instance.id)

        # Verify fields
        self.assertEqual(saved_file.owner, self.owner)
        self.assertEqual(saved_file.filename, "testfile.txt")
        self.assertEqual(saved_file.mime_type, "text/plain")
        self.assertGreater(saved_file.size, 0)
        self.assertIsNotNone(saved_file.encryption_key)
        self.assertIsNotNone(saved_file.encryption_iv)
        self.assertIsNotNone(saved_file.encryption_tag)

        # Verify encryption by decrypting the file
        encrypted_content = saved_file.file.read()
        decrypted_content = decrypt_file(
            encrypted_content,
            saved_file.encryption_key,
            saved_file.encryption_iv,
            saved_file.encryption_tag,
        )
        self.assertEqual(decrypted_content, self.test_file_content)

    def test_file_string_representation(self):
        # Create and save a File instance
        file_instance = File(
            owner=self.owner,
            filename="testfile.txt",
            file=self.test_file,
            mime_type="text/plain",
        )
        file_instance.save()

        # Verify string representation
        self.assertEqual(str(file_instance), "testfile.txt")

    def test_ordering(self):
        # Create multiple file instances with different creation times
        file1 = File.objects.create(
            owner=self.owner, filename="file1.txt", file=self.test_file, mime_type="text/plain"
        )
        file2 = File.objects.create(
            owner=self.owner, filename="file2.txt", file=self.test_file, mime_type="text/plain"
        )

        files = File.objects.all()
        self.assertEqual(files[1].filename, file2.filename)  # file2 is more recent
        self.assertEqual(files[0].filename, file1.filename)  # file1 is older
