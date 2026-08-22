from django.urls import path
import os

from .views import (
    AdminLoginView,UserAuthenticationView,AdminHomeView,AcceptUsersView,RejectUsersView,Password_Reset,UpdatePassword

)



urlpatterns = [
    path('adminlogin/', AdminLoginView.as_view(), name='adminlogin'),
    path('authenticateview/', UserAuthenticationView.as_view(), name='authenticateview'),
    path('adminhome/', AdminHomeView.as_view(), name='adminhome'),
    path('api/accept/<str:email>/', AcceptUsersView.as_view(), name='accept'),
    path('api/reject/<str:email>/', RejectUsersView.as_view(), name='reject'),
    path('resetpassword/', Password_Reset.as_view(), name='resetpassword'),
    path('updatepass/', UpdatePassword.as_view(), name='updatepass'),


]