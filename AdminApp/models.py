from django.db import models

# Create your models here.
# Model for a generic admin user (not linked with the authentication system)
class AdminUser(models.Model):
    username = models.CharField(max_length=255, default='admin', unique=True)
    email = models.EmailField(default='admin@gmail.com')
    password = models.CharField(max_length=255, default='password123')  # Store plain text passwords (not recommended)

    def __str__(self):
        return self.username