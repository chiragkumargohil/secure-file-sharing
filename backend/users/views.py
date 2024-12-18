from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import bcrypt
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

# Utility to generate JWT tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# User Registration View
class UserRegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
          
        try:
          if User.objects.filter(email=email).exists():
              return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

          if User.objects.filter(username=username).exists():
              return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

          # Hash the password using bcrypt
          hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

          # Generate MFA secret
          mfa_secret = pyotp.random_base32()

          # Create the user
          user = User.objects.create(username=username, email=email, password=hashed_password, mfa_secret=mfa_secret)
          user.set_password(password)  # Ensures Django stores the password securely
          user.save()

          # Generate QR code for MFA setup
          # otp_uri = pyotp.TOTP(mfa_secret).provisioning_uri(name=email, issuer_name="SecureFileSharingApp")
          # qr = qrcode.make(otp_uri)
          # buffer = BytesIO()
          # qr.save(buffer, format="PNG")
          # qr_image = buffer.getvalue()

          return Response(
              {"message": "User created successfully", "mfa_secret": mfa_secret},
              status=status.HTTP_201_CREATED
          )
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

# User Login View
class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        # mfa_code = request.data.get("mfa_code")

        if not email or not password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if not check_password(password, user.password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
            
            response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)
            # get tokens
            tokens = get_tokens_for_user(user)
            
            # set http only cookies
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=tokens["access"],
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                # secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                # samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=tokens["refresh"],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                # secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                # samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            
            return response
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

        # Verify the password

        # Verify MFA code
        # totp = pyotp.TOTP(user.mfa_secret)
        # if not totp.verify(mfa_code):
        #     return Response({"error": "Invalid MFA code"}, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        return response

class UserProfileView(APIView):
    """
    View to return user profile data.
    """
    def get(self, request):
        user = request.user  # User is attached via middleware

        if not user or not user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        # Return user profile data
        data = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        return Response(data, status=status.HTTP_200_OK)