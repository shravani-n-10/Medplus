from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
from django.contrib import messages
from datetime import datetime
# middleware.py (where the issue occurs)
from datetime import datetime
from django.shortcuts import render, redirect
from datetime import datetime
import pytz  # Ensure pytz is installed and imported


class TokenExpirationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Access the 'login_time' cookie
        login_time_str = request.COOKIES.get('login_time')
        if login_time_str:
            try:
                # Parse the custom 'DD-MM-YYYY, hh:mm AM/PM' formatted time
                login_time = datetime.strptime(login_time_str, '%d-%m-%Y, %I:%M %p')

                # Convert to timezone-aware datetime (IST)
                ist_timezone = pytz.timezone('Asia/Kolkata')
                login_time = ist_timezone.localize(login_time)

                # Check if session has expired (example: 5 minutes timeout)
                if timezone.now() - login_time > timedelta(minutes=20):
                    # Clear the cookie and redirect to login
                    response = redirect('user_login')
                    response.delete_cookie('user_id')
                    response.delete_cookie('login_time')
                    return response

            except ValueError:
                # Handle the case where the string format is invalid
                print("Invalid login time format.")
        
        # Continue processing the request
        response = self.get_response(request)
        return response



class CustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Access the 'login_time' cookie
        login_time_str = request.COOKIES.get('login_time')
        if login_time_str:
            try:
                # Convert 'DD-MM-YYYY, hh:mm AM/PM' to a datetime object in IST timezone
                login_time = datetime.strptime(login_time_str, '%d-%m-%Y, %I:%M %p')

                # Make the datetime object timezone-aware (India Standard Time)
                ist_timezone = pytz.timezone('Asia/Kolkata')
                login_time = ist_timezone.localize(login_time)

                # You can now use `login_time` as a timezone-aware datetime
                print(f"Login time (IST): {login_time}")
            except ValueError:
                # Handle the case where the string format is invalid
                print("Invalid login time format")
                login_time = None
        
        # Continue processing the request
        response = self.get_response(request)
        return response
