from rest_framework import serializers
from .models import User
from .models import DriveAccess

class RegisterSerializer(serializers.Serializer):
  username = serializers.CharField()
  email = serializers.EmailField()
  password = serializers.CharField()
  
class LoginSerializer(serializers.Serializer):
  email = serializers.EmailField()
  password = serializers.CharField()

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'is_mfa_enabled']

    def validate_email(self, value):
        """Restrict updating email."""
        raise serializers.ValidationError("Email cannot be updated.")

class DriveAccessOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email']

class DriveAccessSerializer(serializers.ModelSerializer):
    owner = DriveAccessOwnerSerializer()
    class Meta:
        model = DriveAccess
        fields = ['id', 'owner', 'role']

class ProfileSerializer(serializers.ModelSerializer):
    selected_drive = serializers.PrimaryKeyRelatedField(queryset=DriveAccess.objects.all())

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'selected_drive', 'is_mfa_enabled']

class DriveAccessListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriveAccess
        fields = ['receiver_email', 'role']