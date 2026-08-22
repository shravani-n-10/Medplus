from django.shortcuts import render,redirect
from rest_framework.views import APIView
from .models import AdminUser
from django.contrib import messages
from UserApp.models import *
from .serializers import *
from UserApp.serializers import *
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status


class Pagenotfound(APIView):
    def get(self, request):
        return render(request, 'pagenotfound.html')


class AdminLoginView(APIView):

    def get(self, request):
        return render(request, 'admin_login.html')

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        default_username = 'admin'
        default_password = 'password123'
        email = 'admin@gmail.com'

        # Check for default credentials
        if username == default_username and password == default_password:
            # if not AdminUser.objects.filter(username=default_username).exists():
            #     AdminUser.objects.create(username=default_username, password=default_password, email=email)
            request.session['username'] = username
            
            # Set cookies for admin login
            response = redirect('adminhome')
            response.set_cookie(
                key='admin_username',
                value=username,
                max_age=60*60*24*7,  # 1 week
                httponly=True,
                secure=True,
                samesite='Lax'
            )
            response.set_cookie(
                key='admin_login_time',
                value=timezone.now().isoformat(),
                max_age=60*60*24*7,  # 1 week
                httponly=True,
                secure=True,
                samesite='Lax'
            )
            messages.success(request, "Login successful!")
            return response

        # Attempt to get user by username
        try:
            user = AdminUser.objects.get(username=username)
            if user.password == password:  # Check password (consider using hash comparison)
                request.session['username'] = username
                
                # Set cookies for admin login
                response = redirect('adminhome')
                response.set_cookie(
                    key='admin_username',
                    value=username,
                    max_age=60*60*24*7,  # 1 week
                    httponly=True,
                    secure=True,
                    samesite='Lax'
                )
                response.set_cookie(
                    key='admin_login_time',
                    value=timezone.now().isoformat(),
                    max_age=60*60*24*7,  # 1 week
                    httponly=True,
                    secure=True,
                    samesite='Lax'
                )
                messages.success(request, "Login successful!")
                return response
            else:
                messages.error(request, "Invalid credentials. Please try again.")
                return render(request, 'admin_login.html')

        except AdminUser.DoesNotExist:
            messages.error(request, "Invalid credentials. Please try again.")
            return render(request, 'admin_login.html')


class AdminHomeView(APIView):
    def get(self, request):
        return render(request, 'admin_home.html')


class UserAuthenticationView(APIView):

    def get(self, request):
            queryset = UserRegistration.objects.filter(status="pending")
        serializer = UserRegistrationSerializer(queryset, many=True)
        page = request.GET.get('page', 1)
        paginator = Paginator(queryset, 4)
        try:
            paginated_data = paginator.page(page)
        except PageNotAnInteger:
            paginated_data = paginator.page(1)
        except EmptyPage:
            paginated_data = paginator.page(paginator.num_pages)
        context = {
            'owners': paginated_data.object_list,
            'paginator': paginator,
            'page_obj': paginated_data,
        }
        return render(request, 'user_authentication.html', context)

class AcceptUsersView(APIView):
    
    def get(self, request, email):
        # Handle POST request to accept the user
        user = get_object_or_404(UserRegistration, email=email)
        user.status = "active"
        user.save()

        # Send a notification email
        message = (f'Hi {email},\n\n'
                   'Your registration request has been accepted by the admin. You can now log in.\n\n'
                   'This message is automatically generated, so please do not reply to this email.\n\n'
                   'Thank you.\n\nRegards,\nAdmin')
        subject = "EDASVIC FROM ADMIN"
        email_from = settings.EMAIL_HOST_USER
        send_mail(subject, message, email_from, [email], fail_silently=False)

        # Optionally, redirect or render a response
        return Response({'detail': 'User accepted and notified successfully'}, status=status.HTTP_200_OK)



class RejectUsersView(APIView):

    def get(self, request, email):
        # Handle POST request to accept the user
        user = get_object_or_404(UserRegistration, email=email)
        user.status = "rejected"
        user.save()

        # Send a notification email
        message = (f'Hi {email},\n\n'
                   'Your registration request has been accepted by the admin. You can now log in.\n\n'
                   'This message is automatically generated, so please do not reply to this email.\n\n'
                   'Thank you.\n\nRegards,\nAdmin')
        subject = "EDASVIC FROM ADMIN"
        email_from = settings.EMAIL_HOST_USER
        send_mail(subject, message, email_from, [email], fail_silently=False)

        # Optionally, redirect or render a response
        return Response({'detail': 'User rejected and notified successfully'}, status=status.HTTP_200_OK)
    

class Password_Reset(APIView):
    def get(self, request):
        return render(request, 'reset-pass.html')

    
class UpdatePassword(APIView):
    def post(self, request):
        serializer = UpdatePasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            new_pwd = serializer.validated_data['password']

            # Fetch the user (from either AdminUser or UserRegistration)
            cloud_user = AdminUser.objects.filter(email=email).first()
            kgc_user = UserRegistration.objects.filter(email=email).first()
            user = cloud_user or kgc_user

            if user:
                user.password = new_pwd
                user.save()
                messages.success(request, 'Your password was successfully updated')
                if isinstance(user, AdminUser):
                    return redirect('adminlogin')
                else:
                    return redirect('user_login')
            else:
                messages.error(request, 'User not found')
                return redirect('resetpassword')
        else:
            # If the serializer is not valid, show the errors
            messages.error(request, 'Password and Confirm Password do not match')
            return redirect('resetpassword')
