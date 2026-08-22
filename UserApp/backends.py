# UserApp/backends.py

from django.contrib.auth.backends import ModelBackend
from .models import UserRegistration  # This should match the correct path to your models.py
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = UserRegistration.objects.get(email=username)
        except UserRegistration.DoesNotExist:
            return None
        if user.check_password(password):
            user.last_login = timezone.now()  # Update last_login
            user.save(update_fields=['last_login'])  # Save only the last_login field
            return user
        return None
