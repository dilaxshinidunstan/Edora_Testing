import logging
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from .serializers import LearnerSerializer
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.http import JsonResponse
from .models import Learner
from django.shortcuts import get_object_or_404
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re
from smtplib import SMTPException
from django.utils import timezone
from django.utils.crypto import get_random_string
from .models import LearnerProfile

# Configure logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    try:
        # Get data from request
        email = request.data.get('email', '').strip()
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        grade = request.data.get('grade', '').strip()
        mobile_no = request.data.get('mobile_no', '').strip()

        # Initialize errors dictionary
        errors = {}

        # Email validation
        try:
            validate_email(email)
            if Learner.objects.filter(email=email).exists():
                errors['email'] = 'This email is already registered.'
        except ValidationError:
            errors['email'] = 'Please enter a valid email address.'
        except Exception as e:
            errors['email'] = str(e)

        # Username validation
        if not username:
            errors['username'] = 'Username is required.'
        elif len(username) < 3:
            errors['username'] = 'Username must be at least 3 characters long.'
        elif len(username) > 30:
            errors['username'] = 'Username cannot exceed 30 characters.'
        elif not re.match(r'^[a-zA-Z0-9_]+$', username):
            errors['username'] = 'Username can only contain letters, numbers, and underscores.'
        elif Learner.objects.filter(username=username).exists():
            errors['username'] = 'This username is already taken.'

        # Password validation
        if not password:
            errors['password'] = 'Password is required.'
        elif len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters long.'
        elif not re.search(r'[A-Z]', password):
            errors['password'] = 'Password must contain at least one uppercase letter.'
        elif not re.search(r'[a-z]', password):
            errors['password'] = 'Password must contain at least one lowercase letter.'
        elif not re.search(r'\d', password):
            errors['password'] = 'Password must contain at least one number.'
        elif not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors['password'] = 'Password must contain at least one special character.'

        # Grade validation
        valid_grades = ['Below grade 6','6', '7', '8', '9', '10', 'O/L', 'A/L', 'Above A/L']
        if not grade:
            errors['grade'] = 'Grade is required.'
        elif grade not in valid_grades:
            errors['grade'] = 'Please select a valid grade.'

        # Mobile number validation
        if not mobile_no:
            errors['mobile_no'] = 'Mobile number is required.'
        elif not re.match(r'^\+?\d{10,15}$', mobile_no):
            errors['mobile_no'] = 'Please enter a valid mobile number (10-15 digits, optional +).'
        elif Learner.objects.filter(mobile_no=mobile_no).exists():
            errors['mobile_no'] = 'This mobile number is already registered.'

        # If there are any errors, return them
        if errors:
            return Response({
                'status': 'error',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # If email test succeeds, create the user
        serializer = LearnerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()
            
            # Send actual verification email
            verification_url = f"{settings.FRONTEND_URL}/activate/{user.verification_token}"
            try:
                logger.info(f"Sending verification email to: {user.email}")
                verification_email_sent = send_mail(
                    'Activate to learn with Edora',
                    f'''
                    <html>
                        <body>
                            <h2 style="color: #04aaa2;">Welcome to Edora! 👋</h2>
                            <p>Please click the following link to activate your account:</p>
                            <p>
                                <a href="{verification_url}" style="color: #0000EE ; text-decoration: none; font-weight: bold;">
                                    Activate your account
                                </a>
                            </p>
                            <p>We are excited to have you on board and help you in your learning journey!</p>
                            <p>Please feel free to contact us at <strong>+94779363665</strong> with any additional questions.</p>
                            <p>Best regards,<br>The Edora Team</p>
                        </body>
                    </html>
                    ''',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                    html_message=(
                        '<html>'
                        '<body>'
                        '<h2 style="color: #04aaa2;">Welcome to Edora! 👋</h2>'
                        '<p>Please click the following link to activate your account:</p>'
                        f'<p><a href="{verification_url}" style="color: #0000EE ; text-decoration: none; font-weight: bold;">Activate your account</a></p>'
                        '<p>We are excited to have you on board and help you in your learning journey!</p>'
                        '<p>Please feel free to contact us at <strong>+94779363665</strong> with any additional questions.</p>'
                        '<p>Best regards,<br>The Edora Team</p>'
                        '</body>'
                        '</html>'
                    )
                )
                
                # Log the result
                logger.info(f"Verification email result for {user.email}: {verification_email_sent}")
                
                if not verification_email_sent:
                    # If verification email fails, delete the user
                    user.delete()
                    return Response({
                        'status': 'error',
                        'errors': {
                            'email': 'Failed to send verification email. Please try again later.'
                        }
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except SMTPException as e:
                # If verification email fails, delete the user and log the error
                logger.error(f"SMTP error while sending verification email to {user.email}: {str(e)}")
                user.delete()
                return Response({
                    'status': 'error',
                    'errors': {
                        'email': 'Failed to send verification email due to server error. Please try again later.'
                    }
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                # If verification email fails, delete the user and log the error
                logger.error(f"Unexpected error while sending verification email to {user.email}: {str(e)}")
                user.delete()
                return Response({
                    'status': 'error',
                    'errors': {
                        'email': 'Failed to send verification email. Please try again later.'
                    }
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'status': 'success',
                'message': 'Registration successful! Please check your email to activate your account.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'grade': user.grade,
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return Response({
            'status': 'error',
            'errors': {
                'general': 'An unexpected error occurred. Please try again later.'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token_view(request):
    try:
        refresh_token = request.data.get('refresh_token')

        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate and create a RefreshToken object
        refresh = RefreshToken(refresh_token)

        # Check if the token is valid and retrieve the access token
        access = str(refresh.access_token)

        return Response({
            'access': access,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def login_view(request):
    try:
        # Get credentials from request
        username_or_email = request.data.get('username_or_email', '').strip()
        password = request.data.get('password', '')

        # Initialize errors dictionary
        errors = {}

        # Validate username/email
        if not username_or_email:
            errors['username_or_email'] = 'Username or email is required.'

        # Validate password
        if not password:
            errors['password'] = 'Password is required.'
        
        # If there are validation errors, return them
        if errors:
            return Response({
                'status': 'error',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Try to find the user first (to give specific feedback)
        try:
            # Check if input is email
            if '@' in username_or_email:
                user = Learner.objects.get(email=username_or_email)
            else:
                user = Learner.objects.get(username=username_or_email)
                
            # Now authenticate with found user's username
            authenticated_user = authenticate(request, username=user.username, password=password)
            
            if not authenticated_user:
                return Response({
                    'status': 'error',
                    'error': 'Incorrect password'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Check if account is activated
            if not authenticated_user.is_active:
                return Response({
                    'status': 'error',
                    'error': 'Please activate your account. Check your email for the activation link.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # If we get here, user is authenticated and active
            access = AccessToken.for_user(authenticated_user)
            refresh = RefreshToken.for_user(authenticated_user)
            
            user_data = {
                'id': authenticated_user.id,
                'firstname': authenticated_user.firstname,
                'lastname': authenticated_user.lastname,
                'email': authenticated_user.email,
                'grade': authenticated_user.grade,
                'mobile_no': authenticated_user.mobile_no,
                'address': authenticated_user.address,
                'username': authenticated_user.username,
            }

            return Response({
                'status': 'success',
                'access': str(access),
                'refresh': str(refresh),
                'user': user_data,
            }, status.HTTP_200_OK)

        except Learner.DoesNotExist:
            return Response({
                'status': 'error',
                'error': 'No account found with this username/email'
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            'status': 'error',
            'error': 'An unexpected error occurred. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def activate_learner(request, token):
    try:
        # Find the user with the matching verification token
        user = get_object_or_404(Learner, verification_token=token)
        logger.info(f"Activating user: {user.email}, Current active status: {user.is_active}")
        
        if user.is_active:
            logger.info(f"User {user.email} is already activated.")
            return Response({
                'message': 'Account is already activated',
                'status': 'info',
                'redirectUrl': '/signin'
            }, status=status.HTTP_200_OK)

        # Activate the user
        user.is_active = True
        # Don't modify the verification_token
        user.save()
        logger.info(f"User {user.email} activated successfully.")
        
        # Generate tokens for automatic login
        access = AccessToken.for_user(user)
        refresh = RefreshToken.for_user(user);
        
        return Response({
            'message': 'Account activated successfully',
            'status': 'success',
            'access': str(access),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'email': user.email,
                'grade': user.grade,
                'mobile_no': user.mobile_no,
                'address': user.address,
                'username': user.username,
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e),
            'status': 'error',
            'redirectUrl': '/signin'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    try:
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'status': 'error', 'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Learner, email=email)
        reset_token = get_random_string(length=32)
        user.reset_token = reset_token
        user.reset_token_created_at = timezone.now()
        user.save()
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"
        subject = 'Reset your Edora password'
        message = f'Click the following link to reset your password: {reset_url}'
        
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        
        return Response({'status': 'success', 'message': 'Reset token generated successfully and sent to email'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error generating reset token or sending email: {str(e)}")
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    try:
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        errors = {}
        
        if not token or not new_password:
            return Response({'status': 'error', 'message': 'Token and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Password validation
        if len(new_password) < 8:
            errors['new_password'] = 'Password must be at least 8 characters long.'
        elif not re.search(r'[A-Z]', new_password):
            errors['new_password'] = 'Password must contain at least one uppercase letter.'
        elif not re.search(r'[a-z]', new_password):
            errors['new_password'] = 'Password must contain at least one lowercase letter.'
        elif not re.search(r'\d', new_password):
            errors['new_password'] = 'Password must contain at least one number.'
        elif not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
            errors['new_password'] = 'Password must contain at least one special character.'
        
        user = get_object_or_404(Learner, reset_token=token)
        
        if timezone.now() > user.reset_token_created_at + timezone.timedelta(hours=24):
            return Response({
                'status': 'error',
                'message': 'Reset token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_created_at = None
        user.save()
        
        return Response({'status': 'success', 'message': 'Password reset successful'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An error occurred while resetting password',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_or_update_learner_profile(request):
    try:
        # Get the current user's profile or create if it doesn't exist
        profile, created = LearnerProfile.objects.get_or_create(learner=request.user)
        
        # Get data from request
        interests = request.data.get('interests', [])
        progress = request.data.get('progress', {})
        grade = request.data.get('grade')  # Added grade field
        calling_name = request.data.get('calling_name')
        
        # Validate interests (should be a list)
        if not isinstance(interests, list):
            return Response({
                'status': 'error',
                'message': 'Interests must be a list'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate progress (should be a dictionary)
        if not isinstance(progress, dict):
            return Response({
                'status': 'error',
                'message': 'Progress must be a dictionary'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate progress values (should be numbers between 0 and 100)
        for key, value in progress.items():
            if not isinstance(value, (int, float)) or value < 0 or value > 100:
                return Response({
                    'status': 'error',
                    'message': f'Progress value for {key} must be a number between 0 and 100'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate grade
        valid_grades = ['Below grade 6', '6', '7', '8', '9', '10', 'O/L', 'A/L', 'Above A/L']
        if grade and grade not in valid_grades:
            return Response({
                'status': 'error',
                'message': 'Invalid grade value'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the profile
        profile.interests = interests
        profile.progress = progress
        if grade:  # Only update grade if provided
            profile.grade = grade
        if calling_name:
            profile.calling_name = calling_name
        profile.save()
        
        return Response({
            'status': 'success',
            'message': 'Profile saved or updated successfully',
            'data': {
                'interests': profile.interests,
                'progress': profile.progress,
                'grade': profile.grade,
                'calling_name': profile.calling_name
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error updating learner profile: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred while updating the profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)