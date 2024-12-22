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
from .serializers import LoginSerializer, RegisterSerializer, UpdateUserSerializer, DriveAccessSerializer, DriveAccessListSerializer, ProfileSerializer
from .models import DriveAccess
from rest_framework.decorators import authentication_classes
from middleware.skip_csrf import CSRFExemptSessionAuthentication
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.shortcuts import get_object_or_404
import qrcode
from io import BytesIO
from django.http import FileResponse
from django.core.files import File
from middleware.role_accessibility import role_accessibility

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
        mfa_code = request.data.get("mfa_code")

        if not email or not password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            serialized_user = ProfileSerializer(user).data
            if not check_password(password, user.password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
            
            if user.is_mfa_enabled:
                print(settings.EMAIL_HOST_USER)
                send_mail(
                    'MFA Code',
                    f'Your MFA code is: {mfa_code}',
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False
                )
                if not pyotp.TOTP(user.mfa_secret).verify(mfa_code):
                    return Response({"error": "Invalid MFA code"}, status=status.HTTP_400_BAD_REQUEST)
            
            # fetch the drives user has access to
            drives = DriveAccess.objects.filter(receiver_email=serialized_user['email'])
            drives = DriveAccessSerializer(drives, many=True).data
            drives = [{'id': drive['id'], 'role': drive['role'], 'owner': drive['owner']['email']} for drive in drives]
            
            role = 'admin'
            if serialized_user['selected_drive'] is not None:
                drive = DriveAccess.objects.get(id=serialized_user['selected_drive'])
                role = drive.role
            
            # Return user profile data
            data = {
                'username': serialized_user['username'],
                'email': serialized_user['email'],
                'first_name': serialized_user['first_name'],
                'last_name': serialized_user['last_name'],
                'drive': serialized_user['selected_drive'],
                'is_mfa_enabled': serialized_user['is_mfa_enabled'],
                'drives': drives or [],
                'role': role
            }
            
            response = Response({"message": "Login successful", "user": data}, status=status.HTTP_200_OK)
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

@authentication_classes([CSRFExemptSessionAuthentication])
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
            user = ProfileSerializer(user).data
            
            # fetch the drives user has access to
            drives = DriveAccess.objects.filter(receiver_email=user['email'])
            drives = DriveAccessSerializer(drives, many=True).data
            drives = [{'id': drive['id'], 'role': drive['role'], 'owner': drive['owner']['email']} for drive in drives]
            
            role = 'admin'
            if user['selected_drive'] is not None:
                drive = DriveAccess.objects.get(id=user['selected_drive'])
                role = drive.role

            # Return user profile data
            data = {
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'drive': user['selected_drive'],
                'is_mfa_enabled': user['is_mfa_enabled'],
                'drives': drives or [],
                'role': role
            }
            
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)
    
    def put(self, request):
        """Update user's profile data."""
        try:
            user = request.user
            serializer = UpdateUserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Profile updated successfully"})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class MFAQRCodeView(APIView):
    def get(self, request):
        try:
            user = request.user
            totp = pyotp.TOTP(user.mfa_secret)
            qr_data = totp.provisioning_uri(
                user.email, 
                issuer_name="CG Drive",
            )
            # Generate QR code
            qr = qrcode.make(qr_data)
            buffer = BytesIO()
            qr.save(buffer, format="PNG")
            buffer.seek(0)
            
            qr_image = File(buffer, name="qr_code.png")
            
            return FileResponse(qr_image, as_attachment=True, filename="qr_code.png")
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class ForgotPasswordView(APIView):
    def post(self, request):
        """
        Handle password reset requests by generating and sending a password reset email.

        This method retrieves the user's email from the request, generates a unique
        password reset token, and constructs a reset link. The link is then emailed
        to the user. If the email is not found, it returns a 404 error response.

        Args:
            request: The HTTP request object containing the user's email.

        Returns:
            Response: A response object indicating whether the password reset email
                    was sent successfully or containing an error message.
        """

        try:
            email = request.data.get('email')
            user = User.objects.get(email=email)
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            print(reset_link)

            # Send email
            send_mail(
                subject="Password Reset Request",
                message=f"Click the link to reset your password: {reset_link}",
                from_email="no-reply@secureapp.com",
                recipient_list=[email],
            )

            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Email not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class ResetPasswordConfirmView(APIView):
    def post(self, request, uidb64, token):
        """
        Verify the password reset token and set a new password for the user.

        Args:
            uidb64 (str): URL-safe base64-encoded user ID.
            token (str): Password reset token.

        Returns:
            Response: A response object containing a success message if the password is reset successfully.
        """
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
            token_generator = PasswordResetTokenGenerator()

            if not token_generator.check_token(user, token):
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

            new_password = request.data.get('password')
            user.set_password(new_password)
            user.save()

            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, ValueError):
            return Response({"error": "Invalid token or user."}, status=status.HTTP_400_BAD_REQUEST)

# DRIVE ACCESS
@authentication_classes([CSRFExemptSessionAuthentication])
class DriveAccessView(APIView):
    @role_accessibility(['admin'])
    def post(self, request, email):
        """
        Grant access to a user to access the current user's drive.

        Args:
            email (str): Email of the user to grant access to.

        Returns:
            Response: A response object containing a success message if the access is granted successfully.
        """
        
        try:
            owner = request.owner
            role = request.data.get('role')
            
            DriveAccess.objects.update_or_create(owner=owner, receiver_email=email, defaults={'role': role})
            
            return Response({"message": "Access granted successfully"})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)
    
    @role_accessibility(['admin'])
    def delete(self, request, email):
        """
        Revoke drive access for a specified user.

        Args:
            request: The HTTP request object.
            email (str): The email of the user whose access is to be revoked.

        Returns:
            Response: A response object containing a success message if the access
                    is revoked successfully, or an error message if something goes wrong.
        """

        try:
            owner = request.owner
            
            DriveAccess.objects.filter(owner=owner, receiver_email=email).delete()
            
            return Response({"message": "Access revoked successfully"})
        except DriveAccess.DoesNotExist:
            return Response({"message": "Access revoked successfully"})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

class DriveAccessListView(APIView):
    @role_accessibility(['admin'])
    def get(self, request):
        """
        Return a list of users with whom the current user has shared access to their Google Drive.

        Returns:
            Response: A response object containing a list of users with their respective roles.
        """
        try:
            owner = request.owner
            users = DriveAccess.objects.filter(owner=owner)
            users = DriveAccessListSerializer(users, many=True).data
            
            users = [{"email": user["receiver_email"], "role": user["role"]} for user in users]

            return Response({"users": users})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)

@authentication_classes([CSRFExemptSessionAuthentication])
class SwitchDriveView(APIView):
    def put(self, request):
        try:
            drive_id = request.data.get('drive_id')
            drive = None
            if drive_id:
                drive = get_object_or_404(DriveAccess, id=drive_id)
            user = request.user
            user.selected_drive = drive
            user.save()
            return Response({"message": "Drive switched successfully"})
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)