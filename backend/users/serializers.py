from rest_framework import serializers
from .models import User

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
        fields = ['first_name', 'last_name']

    def validate_email(self, value):
        """Restrict updating email."""
        raise serializers.ValidationError("Email cannot be updated.")