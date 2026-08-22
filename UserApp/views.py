from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from django.core.mail import send_mail
from django.contrib import messages
import re
from .serializers import UserRegistrationSerializer,UserLoginSerializer,MedicalImageSerializer,MedicalImageSerializer  # Make sure to import your serializer
from rest_framework import status
from django.contrib.auth import login, authenticate  # Ensure authenticate is imported
from django.contrib.auth.backends import ModelBackend
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from .models import *
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
# Algorithm related data
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from django.contrib import messages
from rest_framework.response import Response

# Algorithm related info..
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import scrypt
import base64

import os

from .keygen import *


# views.py

import os



from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image


from django.http import HttpResponse
import mimetypes




import os
import base64
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MedicalImage
from .serializers import MedicalImageSerializer
from django.contrib import messages
from ecdsa import NIST256p, SigningKey, VerifyingKey
import hashlib



#Time package
from datetime import datetime
import pytz
import time




class IndexView(APIView):
    def get(self, request):
        return render(request, 'index.html')

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = UserRegistration.objects.get(email=username)
        except UserRegistration.DoesNotExist:
            return None
        if user.check_password(password):
            return user
        return None

class UserRegistrationView(APIView):
    ...
    def get(self, request):
        return render(request, 'user_registration.html')  # Ensure this template exists

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            messages.success(request, "Registration successful! Please log in.")
            return redirect('user_login')
        return Response(serializer.errors, status=400)  # Make sure to handle errors properly


class UserLoginView(APIView):
    def get(self, request):
        return render(request, 'user_login.html')
        
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                user = UserRegistration.objects.get(email=email)

                # Debugging: Check user details
                print(f"User found: {user.email}, Status: {user.status}")

                # Check if the user is active
                if user.status != "active":
                    raise AuthenticationFailed("You are not an authorized user.")

                refresh = RefreshToken.for_user(user)
                request.session['email'] = email  
                # Set a unique cookie for the user
                response = redirect('user_home')
                response.set_cookie(
                    key='user_id',
                    value=user.id,
                    max_age=60*60*24*7,  # 1 week
                    httponly=True,
                    secure=True,
                    samesite='Lax'
                )

                # Get the current time in UTC and convert it to Indian Standard Time (IST)
                utc_now = timezone.now()
                ist_timezone = pytz.timezone('Asia/Kolkata')
                ist_now = utc_now.astimezone(ist_timezone)

                # Format the time as DD-MM-YYYY, hh:mm AM/PM
                formatted_login_time = ist_now.strftime('%d-%m-%Y, %I:%M %p')

                # Set login time cookie
                response.set_cookie(
                    key='login_time',
                    value=formatted_login_time,
                    max_age=60*60*24*7,  # 1 week
                    httponly=True,
                    secure=True,
                    samesite='Lax'
                )

                return response
            
            except UserRegistration.DoesNotExist:
                print("No user found with this email.")
                raise AuthenticationFailed("Invalid email or password. Please try again.")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserHomeView(APIView):
    def get(self, request):
        user_id = request.COOKIES.get('user_id')

        if user_id:
            
            return render(request, 'user_home.html', {'user_id': user_id})  # Pass it to your template

        return redirect('user_login')  # Redirect if cookie not present


class UserLogoutView(APIView):
    def get(self, request):
        # Clear the user_id and login_time cookies
        response = redirect('user_login')  # Redirect to index or another page
        response.delete_cookie('user_id')
        response.delete_cookie('login_time')

        return response


class UserProfile(APIView):
    def get(self, request):
        user_id = request.COOKIES.get('user_id')
        user = UserRegistration.objects.get(id=user_id)
        # serializer = UserRegistrationSerializer(user)
        
        # Pass the serialized data to the template
        return render(request, "user_profile.html", {'user': user})


class ViewMedicalImages(APIView):

    def get(self, request):
        # user_email = request.session['useremail']
        queryset = MedicalImage.objects.all()
        serializer = MedicalImageSerializer(queryset, many=True)
        page = request.GET.get('page', 1)
        paginator = Paginator(serializer.data, 4)
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
        return render(request, 'view_medicalimages.html', context)



# generate_keys.py

from Crypto.PublicKey import ECC

def generate_and_save_keys(private_key_path='recipient_private_key.pem', public_key_path='recipient_public_key.pem'):
    # Generate ECC key pair
    private_key = ECC.generate(curve='P-256')
    public_key = private_key.public_key()

    # Export keys in PEM format
    private_key_pem = private_key.export_key(format='PEM')
    public_key_pem = public_key.export_key(format='PEM')

    # Save private key
    with open(private_key_path, 'wt') as priv_file:
        priv_file.write(private_key_pem)

    # Save public key
    with open(public_key_path, 'wt') as pub_file:
        pub_file.write(public_key_pem)

    print(f"Keys generated and saved to '{private_key_path}' and '{public_key_path}'.")

if __name__ == "__main__":
    generate_and_save_keys()


def load_private_key(private_key_path='keys/recipient_private_key.pem'):
    try:
        with open(private_key_path, 'rb') as key_file:
            private_key = SigningKey.from_pem(key_file.read())
        return private_key
    except FileNotFoundError:
        raise FileNotFoundError(f"Private key file not found at '{private_key_path}'.")

def load_public_key(public_key_path='keys/recipient_public_key.pem'):
    try:
        with open(public_key_path, 'rb') as key_file:
            public_key = VerifyingKey.from_pem(key_file.read())
        return public_key
    except FileNotFoundError:
        raise FileNotFoundError(f"Public key file not found at '{public_key_path}'.")
    
def derive_symmetric_key(private_key, public_key):
    # Derive shared secret between sender's private key and recipient's public key
    shared_secret_point = private_key.privkey.secret_multiplier * public_key.pubkey.point
    shared_secret_bytes = shared_secret_point.x().to_bytes(32, byteorder='big')
    
    # Use a cryptographic hash to derive a symmetric key from the shared secret
    symmetric_key = hashlib.sha256(shared_secret_bytes).digest()
    return symmetric_key

def encrypt_data(data, symmetric_key):
    # Simple XOR encryption (Not secure for sensitive data)
    return bytes([b ^ symmetric_key[i % len(symmetric_key)] for i, b in enumerate(data)])

def decrypt_data(data, symmetric_key):
    # Simple XOR decryption (same as encryption)
    return bytes([b ^ symmetric_key[i % len(symmetric_key)] for i, b in enumerate(data)])





class MedicalImageStore(APIView):

    def get(self, request):
        return render(request, 'medicalimagestore.html')


    def post(self, request):
        # Step 1: Check if an image is in the request
        if 'image' not in request.FILES:
            return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES['image']

        # Step 2: Debugging - Log details of the uploaded file
        print(f"Uploaded file: {image_file}, file name: {image_file.name}")
        print(f"File content type: {image_file.content_type}")
        print(f"File size: {image_file.size}")

        # Step 3: Validate the image using Pillow
        try:
            img = Image.open(image_file)
            img.verify()  # Ensure the image is valid
            img_format = img.format  # Check the image format (JPEG, PNG, etc.)
            print(f"Image format: {img_format}")
        except (IOError, SyntaxError) as e:
            return Response({"error": "Upload a valid image. The file you uploaded was either not an image or a corrupted image."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Step 4: If validation passed, read the image content
        image_content = image_file.read()  # Read file data
        image_name = image_file.name

        # Step 5: Proceed with encryption
        keys_dir = os.path.join(os.getcwd(), 'UserApp/keys')
        recipient_private_key_path = os.path.join(keys_dir, 'recipient_private_key.pem')
        recipient_public_key_path = os.path.join(keys_dir, 'recipient_public_key.pem')

        try:
            recipient_private_key = load_private_key(recipient_private_key_path)
            recipient_public_key = load_public_key(recipient_public_key_path)
        except FileNotFoundError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Generate sender's key pair
        sender_private_key = SigningKey.generate(curve=NIST256p)
        sender_public_key = sender_private_key.get_verifying_key()

        # Derive symmetric key
        symmetric_key = derive_symmetric_key(sender_private_key, recipient_public_key)

        # Start the timer for encryption duration
        start_time = time.time()

        # Encrypt the image
        encrypted_data = encrypt_data(image_content, symmetric_key)

        # Stop the timer
        end_time = time.time()
        encryption_duration = end_time - start_time  # Calculate duration in seconds

        # Convert to IST and format as YYYY-MM-DD
        ist_timezone = pytz.timezone('Asia/Kolkata')
        encryption_time_ist = datetime.now(ist_timezone)  # Get only the date

        # Format duration to 2 decimal places
        formatted_encryption_duration = round(encryption_duration, 2)

        # Prepare the data to store in the database
        image_data = {
            'encrypted_image': base64.b64encode(encrypted_data).decode('utf-8'),
            'sender_private_key': base64.b64encode(sender_private_key.to_pem()).decode('utf-8'),
            'sender_public_key': sender_public_key.to_pem().decode('utf-8'),
            'recipient_public_key': recipient_public_key.to_pem().decode('utf-8'),
            'image_name': image_name,
            'encryption_duration': formatted_encryption_duration,  # Store the duration formatted
            'encryption_time_ist': encryption_time_ist,  # Store the date
        }

        # Step 7: Attach the image file and pass it to the serializer
        serializer = MedicalImageSerializer(data=image_data)
        serializer.initial_data['imagestore'] = image_file

        # Validate the serializer and save the data
        if serializer.is_valid():
            instance = serializer.save()  # Save the instance
            print(f"Saved instance with duration: {instance.encryption_duration}, time: {instance.encryption_time_ist}")  # Check values
            return Response({"message": "Medical Image stored and encrypted successfully"}, status=status.HTTP_201_CREATED)

        # Debugging: Log serializer errors
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class MedicalImageDecrypt(APIView):

    def get(self, request, file_id):
        # Retrieve the medical image by file ID
        try:
            medical_image = MedicalImage.objects.get(id=file_id)
            return render(request, 'medicalimagedecrypt.html', {'medical_image': medical_image})
        except MedicalImage.DoesNotExist:
            return Response({"error": "Medical image not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, file_id):
        # Retrieve the medical image by file ID
        try:
            medical_image = MedicalImage.objects.get(id=file_id)
        except MedicalImage.DoesNotExist:
            return Response({"error": "Medical image not found"}, status=status.HTTP_404_NOT_FOUND)

        # Decode the base64-encoded fields
        try:
            encrypted_image = base64.b64decode(medical_image.encrypted_image)
        except Exception as e:
            return Response({"error": f"Failed to decode the encrypted image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Use default keys instead of the ones from the model
        try:
            # Define the path to your default sender private and recipient public key files
            sender_private_key_path = os.path.join(os.getcwd(), 'UserApp/keys/recipient_private_key.pem')  # Update this path
            recipient_public_key_path = os.path.join(os.getcwd(), 'UserApp/keys/recipient_public_key.pem')  # Update this path

            # Load the default sender private key
            with open(sender_private_key_path, 'rb') as key_file:
                sender_private_key = SigningKey.from_pem(key_file.read())

            # Load the default recipient public key
            with open(recipient_public_key_path, 'rb') as key_file:
                recipient_public_key = VerifyingKey.from_pem(key_file.read())

        except FileNotFoundError as e:
            return Response({"error": f"Key file not found: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Derive symmetric key using private and public keys
        symmetric_key = derive_symmetric_key(sender_private_key, recipient_public_key)

        # Decrypt the image data
        try:
            decrypted_image = decrypt_data(encrypted_image, symmetric_key)
        except Exception as e:
            return Response({"error": f"Decryption failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Guess MIME type of the image
        file_type, _ = mimetypes.guess_type(medical_image.image_name)
        if not file_type:
            file_type = "image/jpeg"  # Default to JPEG if MIME type is not guessed correctly

        # Prepare the decrypted image as a base64-encoded string for the front-end
        decrypted_image_b64 = base64.b64encode(decrypted_image).decode('utf-8')

        # Send data back to the template
        return render(request, 'medicalimagedecrypt.html', {
            'medical_image': medical_image,
            'decrypted_image': decrypted_image_b64,
            'decrypted_image_format': file_type,
            'decrypted_image_extension': file_type.split('/')[1],  # Use the format like jpeg, png
            'success': 'Image decrypted successfully',
        })
    

from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import UploadImageModel
from ecdsa import NIST256p, SigningKey, VerifyingKey
import hashlib
import os

# Function to generate ECC keypair
def generate_ecc_keypair():
    private_key = SigningKey.generate(curve=NIST256p)
    public_key = private_key.get_verifying_key()
    return private_key, public_key

# Function to derive a symmetric key using ECC
def derive_symmetric_key(private_key, public_key):
    shared_secret = private_key.privkey.secret_multiplier * public_key.pubkey.point
    shared_secret_bytes = shared_secret.x().to_bytes(32, byteorder='big')
    symmetric_key = hashlib.sha256(shared_secret_bytes).digest()
    return symmetric_key

# Function to encrypt data using XOR
def encrypt_data(data, symmetric_key):
    return bytes([b ^ symmetric_key[i % len(symmetric_key)] for i, b in enumerate(data)])

# Function to decrypt data using XOR
def decrypt_data(data, symmetric_key):
    return encrypt_data(data, symmetric_key)  # XOR is symmetric

# Encrypt an image
def encrypt_image(input_path, output_path, public_key):
    # Generate a temporary private key for encryption
    private_key = SigningKey.generate(curve=NIST256p)
    symmetric_key = derive_symmetric_key(private_key, public_key)

    with open(input_path, 'rb') as img_file:
        image_data = img_file.read()

    encrypted_data = encrypt_data(image_data, symmetric_key)

    with open(output_path, 'wb') as enc_file:
        enc_file.write(encrypted_data)

    return private_key  # Return private key for decryption

# Upload Image View (Encrypt and Save)
def uploadimage(request):
    # UploadImageModel.objects.all().delete()

    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        imgtype = request.POST['imgtype']
        image = request.FILES['image']
        imgname = image.name

        # Define the directory for saving images
        image_directory = os.path.join('static', 'MedicalImages')
        os.makedirs(image_directory, exist_ok=True)

        # Save original image
        upload_path = os.path.join(image_directory, imgname)
        with open(upload_path, 'wb') as img_file:
            for chunk in image.chunks():
                img_file.write(chunk)

        # Generate ECC keypair
        private_key, public_key = generate_ecc_keypair()

        # Encrypt the image
        encrypted_image_path = os.path.join(image_directory, 'encrypted_' + imgname)
        private_key_for_decryption = encrypt_image(upload_path, encrypted_image_path, public_key)

        print("Image encrypted successfully.")

        # Convert private key and public key to bytes
        private_key_bytes = private_key_for_decryption.to_string()  
        public_key_bytes = public_key.to_string()

        # Remove the original uploaded image
        os.remove(upload_path)

        # Save the image data and keys to the database
        with open(encrypted_image_path, 'rb') as enc_file:
            encrypted_image_data = enc_file.read()

        upload_image_model = UploadImageModel(
            image_name=imgname,
            image='static/MedicalImages/encrypted_' + imgname,  # Relative path
            encrypted_image=encrypted_image_data,  # Encrypted binary data
            private_key=private_key_bytes,  # Private key as bytes
            public_key=public_key_bytes,  # Public key as bytes
            username=username,
            email=email,
            imgtype=imgtype
        )
        upload_image_model.save()

        print("Image uploaded and data saved to the database.")
        return redirect('uploadimage')

    return render(request, 'medicalimagestore.html')

def decryptimage(request, id):
    try:
        # Fetch image record from the database
        image_data = UploadImageModel.objects.get(id=id)

        # Retrieve the stored private and public keys
        private_key_bytes = image_data.private_key
        public_key_bytes = image_data.public_key

        # Convert bytes back to ECC keys
        private_key = SigningKey.from_string(private_key_bytes, curve=NIST256p)
        public_key = VerifyingKey.from_string(public_key_bytes, curve=NIST256p)

        # Derive the symmetric key
        symmetric_key = derive_symmetric_key(private_key, public_key)

        # Retrieve encrypted image data
        encrypted_image_data = image_data.encrypted_image

        # Decrypt image data
        decrypted_data = decrypt_data(encrypted_image_data, symmetric_key)

        # Save decrypted image to a file
        decrypted_image_path = os.path.join('static', 'MedicalImages', f"decrypted_{image_data.image_name}")
        with open(decrypted_image_path, 'wb') as dec_file:
            dec_file.write(decrypted_data)

        # Serve the file as a download
        with open(decrypted_image_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename={os.path.basename(decrypted_image_path)}'
        
        return response

    except UploadImageModel.DoesNotExist:
        return render(request, 'error.html', {'error_message': 'Image not found.'})
    


def viewimages(request):
    email = request.session['email']
    images = UploadImageModel.objects.filter(email=email)
    print(images)
    return render(request, 'view_medicalimages.html', {'images': images})
