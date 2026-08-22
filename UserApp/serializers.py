from rest_framework import serializers
from .models import UserRegistration, MedicalImage
from django.contrib.auth import login, authenticate  # Ensure authenticate is imported
from django.utils.translation import gettext_lazy as _  # Import the translation function
from django.contrib.auth.hashers import make_password, check_password
from .models import MedicalImage
from PIL import Image
import io
from django.conf import settings


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegistration
        fields = ['name','profile','email', 'password', 'mobile', 'address', 'status']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_profile_url(self, obj):
        if obj.profile:
            return f"{settings.MEDIA_URL}{obj.profile}"
        return None


    def create(self, validated_data):
        user = UserRegistration(**validated_data)
        user.save()  # The overridden save method in the model will handle created_at and password hashing
        return user
    
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError(_('Both email and password are required.'))

        try:
            user = UserRegistration.objects.get(email=email)

            # Check user status
            if user.status != "active":
                raise serializers.ValidationError(_('You are not an authorized user.'))

        except UserRegistration.DoesNotExist:
            raise serializers.ValidationError(_('Invalid email or password.'))

        data['user'] = user  # Add user to validated_data
        return data
    

class MedicalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalImage
        fields = [
            'id',
            'image_name',
            'imagestore',
            'encrypted_image',
            'sender_private_key',
            'recipient_public_key',
            'uploaded_at',
            'encryption_duration',
            'encryption_time_ist',
        ]
        read_only_fields = ['id', 'uploaded_at']

    def validate_imagestore(self, value):
        try:
            # Validate the image using Pillow
            img = Image.open(value)
            img.verify()  # This will raise an exception if the image is invalid
        except (IOError, SyntaxError) as e:
            raise serializers.ValidationError("Upload a valid image. The file you uploaded was either not an image or a corrupted image.")
        return value

    