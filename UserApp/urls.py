from django.urls import path
import os
from django.conf import settings
from django.conf.urls.static import static


from .views import (
    IndexView,UserRegistrationView,UserLoginView,UserHomeView,UserLogoutView,UserProfile,MedicalImageStore
,ViewMedicalImages,MedicalImageDecrypt
)
from .views import * 


urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('user_profile/', UserProfile.as_view(), name='user_profile'),
    path('user_home/', UserHomeView.as_view(), name='user_home'),
    path('userregister/', UserRegistrationView.as_view(), name='userregister'),
    path('user_login/', UserLoginView.as_view(), name='user_login'),
    path('logout/', UserLogoutView.as_view(), name='user_logout'),
    path('medicalimagestore/', MedicalImageStore.as_view(), name='medicalimagestore'),
    path('viewmedicalimages/', ViewMedicalImages.as_view(), name='viewmedicalimages'),
    path('medicalimagedecrypt/<int:file_id>/', MedicalImageDecrypt.as_view(), name='MedicalImageDecrypt'),
    path('uploadimage/',uploadimage,name="uploadimage"),
    path('decryptimage/<int:id>/',decryptimage, name='decryptimage'),
    path('viewimages/',viewimages,name="viewimages"),



]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
