import jwt
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from rest_framework import serializers
from users.models import DriveAccess

User = get_user_model()

# List of allowed paths
ALLOWED_PATHS = [
    '/api/users/login/',
    '/api/users/register/',
    '/api/users/logout/'
]

ALLOWED_START_WITH_PATH = [
    '/api/resources/files/public/',
    '/api/users/forgot-password/',
    '/api/users/reset-password/'
]

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['email', 'first_name', 'last_name', 'selected_drive', 'id']

class JWTAuthenticationMiddleware:
    """
    Middleware to validate JWT tokens and attach user to request.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip token validation for login/signup or non-API endpoints
        if request.path.startswith('/api/') and request.path not in ALLOWED_PATHS and request.path.startswith('/api/resources/public/files/download/') == False and request.path.startswith('/api/users/forgot-password/') == False and request.path.startswith('/api/users/reset-password/') == False:
            token = ""
            
            tokens = request.COOKIES
            if 'access_token' in tokens:
                token = tokens['access_token']
            elif 'refresh_token' in tokens:
                token = tokens['refresh_token']
            
            if not token:
                return JsonResponse({'error': 'Token not found'}, status=401)

            try:
                decoded_token = AccessToken(token)

                # Attach user to the request
                user_id = decoded_token['user_id']
                user = User.objects.get(id=user_id)
                request.user = user

                serialized_user = UserSerializer(user).data
                selected_drive = serialized_user['selected_drive']
                request.owner = user # Set default owner
                request.user.role = 'admin' # Set default role
                
                if selected_drive is not None:
                    drive = DriveAccess.objects.get(id=selected_drive)
                    request.owner = drive.owner
                    request.user.role = drive.role

            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=401)

        response = self.get_response(request)
        return response
