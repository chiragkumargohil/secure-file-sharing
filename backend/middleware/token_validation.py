import jwt
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthenticationMiddleware:
    """
    Middleware to validate JWT tokens and attach user to request.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip token validation for login/signup or non-API endpoints
        if request.path.startswith('/api/') and request.path not in ['/api/login/', '/api/signup/', '/api/logout/']:
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

            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=401)

        response = self.get_response(request)
        return response
