# - When the selected drive in null, then fetch user's data (files, shared files with user) and obviously will have full access
# - When there is selected drive, it will be role based
# 	- admin - full access (view download files / shared files, delete files, add user in for sharing file)
# 	- editor - partial access (view and download files / shared files, delete files)
# 	- viewer - only view files (not shared files)

# middleware for role based access
from rest_framework import serializers
from rest_framework import status
from users.models import DriveAccess, User
from django.http import JsonResponse

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['email', 'first_name', 'last_name', 'selected_drive', 'id']

class AccessControlMixin:
    def dispatch(self, request, *args, **kwargs):
        try:
          user = request.user
          serialized_user = UserSerializer(user).data
          selected_drive = serialized_user['selected_drive']
          request.drive_user = user
          
          if selected_drive is not None:
            drive = DriveAccess.objects.get(id=selected_drive)
            request.drive_user = drive.owner

            role = drive.role
            if role == 'viewer':
              # allow 'GET' and 'HEAD' methods
              if request.method not in ['GET', 'HEAD']:
                return JsonResponse({"message": "You don't have permission to access this resource"}, status=status.HTTP_403_FORBIDDEN)
            
          return super().dispatch(request, *args, **kwargs)
        except Exception as e:
          return JsonResponse({"error": "Something went wrong", "message": str(e)}, status=500)