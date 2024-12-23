from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.base import ContentFile
from django.test import TestCase
from files.models import File

User = get_user_model()

class FileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        # Generate JWT tokens for authentication
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)

        self.file_data = {
            'filename': 'test_file.txt',
            'file': ContentFile(b'This is a test file.', name='test_file.txt'),
            'mime_type': 'text/plain',
            'size': 20,
        }

    def test_file_model(self):
        # Create a file instance
        file_instance = File.objects.create(
            file=ContentFile(b'This is a test file.', name='test_file.txt'),
            filename='test_file.txt',
            mime_type='text/plain',
            size=20,
        )
        self.assertIsInstance(file_instance, File)
        self.assertEqual(file_instance.filename, 'test_file.txt')
        self.assertEqual(file_instance.mime_type, 'text/plain')
        self.assertEqual(file_instance.size, 20)
