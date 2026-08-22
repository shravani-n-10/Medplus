from rest_framework import serializers
from .models import AdminUser


class AdminUserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['username', 'password']  # Include only necessary fields

    def validate(self, attrs):
        if 'username' not in attrs:
            raise serializers.ValidationError({'username': 'This field is required.'})
        if 'password' not in attrs:
            raise serializers.ValidationError({'password': 'This field is required.'})
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class UpdatePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data