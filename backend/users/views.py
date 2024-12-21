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
from .serializers import LoginSerializer, RegisterSerializer
from .models import DriveAccess
from rest_framework.serializers import ModelSerializer
from rest_framework.decorators import authentication_classes
from middleware.skip_csrf import CSRFExemptSessionAuthentication

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
        """
        Creates a new user with the given email and password, and generates a QR code for MFA setup.

        Args:
            request (Request): The request object containing the email and password.

        Returns:
            Response: A response object containing a success message and the MFA secret if the user is created successfully.
        """
        
        # serialize the data
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
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
        """
        Handles user login by validating credentials and issuing JWT tokens.

        Args:
            request: The HTTP request object containing user login data.

        Returns:
            Response: A Django REST Framework Response object. On successful login,
            returns a message "Login successful" with access and refresh tokens set
            as HttpOnly cookies. On failure, returns an error message with the
            appropriate HTTP status code.

        Raises:
            User.DoesNotExist: If the user with the given email does not exist.
            AuthenticationFailed: If authentication fails due to invalid credentials.
            Exception: For any other exceptions that may occur during the login process.
        """

        # serialize the data
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            
            # set http only cookies / access token
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=tokens["access"],
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                # secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                # samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            # set http only cookies / refresh token
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=tokens["refresh"],
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                # secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                # samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            # Verify the password
            # Verify MFA code
            # totp = pyotp.TOTP(user.mfa_secret)
            # if not totp.verify(mfa_code):
            #     return Response({"error": "Invalid MFA code"}, status=status.HTTP_400_BAD_REQUEST)
            
            return response
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=401)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class UserLogoutView(APIView):
    """
    View to log out a user.
    """
    def post(self, request):
        """
        Log out a user by deleting the access and refresh tokens.

        Returns:
            Response: A response object containing a success message.
        """
        try:
            response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class UserProfileView(APIView):
    """
    View to return user profile data.
    """
    def get(self, request):
        """
        Return user profile data.

        Returns:
            Response: A response object containing user profile data.
        """
        try:
            user = request.user  # User is attached via middleware

            # Return user profile data
            data = {
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

# DRIVE ACCESS
@authentication_classes([CSRFExemptSessionAuthentication])
class DriveAccessView(APIView):
    def post(self, request, email):
        try:
            owner = request.user
            role = request.data.get('role')
            
            DriveAccess.objects.update_or_create(owner=owner, receiver_email=email, defaults={'role': role})
            
            return Response({"message": "Access granted successfully"})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)
    
    def delete(self, request, email):
        try:
            owner = request.user
            
            DriveAccess.objects.filter(owner=owner, receiver_email=email).delete()
            
            return Response({"message": "Access revoked successfully"})
        except DriveAccess.DoesNotExist:
            return Response({"message": "Access revoked successfully"})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class DriveAccessSerializer(ModelSerializer):
    class Meta:
        model = DriveAccess
        # email and role
        fields = ['receiver_email', 'role']

class DriveAccessListView(APIView):
    def get(self, request):
        try:
            owner = request.user
            users = DriveAccess.objects.filter(owner=owner)
            users = DriveAccessSerializer(users, many=True).data
            
            users = [{"email": user["receiver_email"], "role": user["role"]} for user in users]

            return Response({"users": users})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)