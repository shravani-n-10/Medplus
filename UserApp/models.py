from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.db import models  # Import models from Django
#Time package
import pytz
from datetime import datetime
import os


from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserRegistrationManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class UserRegistration(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    profile = models.FileField(upload_to='user_profile/',null=True)
    password = models.CharField(max_length=255)
    mobile = models.CharField(max_length=15)
    address = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField()
    last_login = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=25, default="pending", null=True, blank=True)

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # Get current time in IST
        ist_timezone = pytz.timezone('Asia/Kolkata')
        if not self.created_at:
            self.created_at = timezone.now().astimezone(ist_timezone)

        # Hash the password if provided
        if self.password:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)


class MedicalImage(models.Model):
    image_name = models.CharField(max_length=255)
    imagestore = models.FileField(upload_to='medical_images/', null=True)
    encrypted_image = models.TextField(null=True, blank=True)
    sender_private_key = models.TextField(null=True, blank=True)
    sender_public_key = models.TextField(null=True, blank=True)
    recipient_public_key = models.TextField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    encryption_duration = models.FloatField(null=True, blank=True)
    encryption_time_ist = models.DateTimeField(null=True, blank=True)


class UploadImageModel(models.Model):
    image = models.ImageField(upload_to=os.path.join('static', 'MedicalImages'))
    image_name = models.CharField(max_length=255)
    encrypted_image = models.BinaryField(null=True)
    private_key = models.BinaryField()
    public_key = models.BinaryField()
    username = models.CharField(max_length=100)
    email = models.EmailField()
    imgtype = models.CharField(max_length=100)

    def __str__(self):
        return self.image_name

    class Meta:
        db_table = 'UploadImageModel'
