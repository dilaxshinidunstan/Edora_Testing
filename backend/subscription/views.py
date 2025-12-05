from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from learner.models import Learner
from .models import SubscriptionRequest
import logging
import base64
from django.core.files.base import ContentFile
import mimetypes
import os
from PIL import Image  # Add this import for image handling
from io import BytesIO

logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription_request(request):
    try:
        username = request.data.get('username')
        subscription_type = request.data.get('subscriptionType')
        payment_slip = request.FILES.get('paymentSlip') if request.FILES else None

        # Check for required fields first
        if not username:
            return Response({
                'message': 'Username is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists in Learner table
        try:
            user = Learner.objects.get(username=username)
        except Learner.DoesNotExist:
            return Response({
                'message': 'User not found. Please sign up first.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Validate required fields
        if not subscription_type:
            return Response({
                'message': 'Subscription type is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not payment_slip:
            return Response({
                'message': 'Payment slip is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        if payment_slip:
            file_ext = os.path.splitext(payment_slip.name)[1].lower()
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf']
            
            if file_ext not in allowed_extensions:
                return Response({
                    'message': 'Invalid file type. Please upload JPG, PNG or PDF files only.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Set proper MIME type
            content_type = mimetypes.guess_type(payment_slip.name)[0]
            if not content_type:
                content_type = 'application/octet-stream'
            payment_slip.content_type = content_type

        try:
            # Create subscription request
            subscription_request = SubscriptionRequest.objects.create(
                user=user,
                subscription_type=subscription_type,
                payment_slip=payment_slip
            )

            # Email to learner
            send_mail(
                subject='Thank You for Your Subscription Request',
                message='',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=f"""
                    <h1>Thank You for Subscribing to Edora Premium!</h1>
                    <p>Dear {user.firstname or username},</p>
                    <p>We have received your subscription request for the {subscription_type} plan.</p>
                    <p>Our team will verify your payment and upgrade your account within 8 hours.</p>
                    <p>If you have any questions, please don\'t hesitate to contact our support team.</p>
                    <p>You can reach us at +94779363665 or simply reply to this email.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>The Edora Team</p>
                """
            )

            # Prepare admin email
            admin_email = EmailMessage(
                subject='New Subscription Request',
                body=f"""
                    <h1>New Subscription Request</h1>
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
                    <p><strong>Grade:</strong> {user.grade}</p>
                    <p><strong>Subscription Type:</strong> {subscription_type}</p>
                    <p><strong>Request ID:</strong> {subscription_request.id}</p>
                    <p>Please verify the attached payment slip and upgrade the user's account.</p>
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.ADMIN_EMAIL]
            )
            admin_email.content_subtype = "html"

            # Handle file attachment based on file type
            file_ext = os.path.splitext(payment_slip.name)[1].lower()
            if file_ext == '.pdf':
                # Handle PDF files
                payment_slip.seek(0)  # Reset file pointer
                pdf_content = payment_slip.read()  # Read the content
                
                # Create a copy of the content for the email attachment
                admin_email.attach(
                    filename=payment_slip.name,
                    content=pdf_content,
                    mimetype='application/pdf'
                )
                
                # Reset file pointer for database save
                payment_slip.seek(0)
            else:
                # Handle image files
                try:
                    # Open the image using PIL
                    img = Image.open(payment_slip)
                    # Convert to RGB if necessary (in case of RGBA images)
                    if img.mode in ('RGBA', 'LA'):
                        img = img.convert('RGB')
                    
                    # Save image to bytes
                    img_byte_arr = BytesIO()
                    img.save(img_byte_arr, format='JPEG', quality=85)
                    img_byte_arr = img_byte_arr.getvalue()

                    # Attach the processed image
                    admin_email.attach(
                        f"{os.path.splitext(payment_slip.name)[0]}.jpg",
                        img_byte_arr,
                        'image/jpeg'
                    )
                except Exception as e:
                    logger.error(f"Error processing image: {str(e)}")
                    # If image processing fails, try sending original file
                    admin_email.attach(
                        payment_slip.name,
                        payment_slip.read(),
                        payment_slip.content_type
                    )

            admin_email.send()

            return Response({
                'message': 'Subscription request received successfully',
                'id': subscription_request.id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            if 'subscription_request' in locals():
                subscription_request.delete()
            return Response({
                'message': 'Failed to process subscription request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"Subscription error: {str(e)}")
        return Response({
            'message': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscriptions(request):
    try:
        subscriptions = SubscriptionRequest.objects.filter(user=request.user)
        return Response({
            'subscriptions': [
                {
                    'id': sub.id,
                    'type': sub.subscription_type,
                    'created_at': sub.created_at,
                    'updated_at': sub.updated_at,
                    'payment_slip_url': request.build_absolute_uri(sub.payment_slip.url) if sub.payment_slip else None,
                } for sub in subscriptions
            ]
        })
    except Exception as e:
        logger.error(f"Error fetching subscriptions: {str(e)}")
        return Response({
            'message': 'Failed to fetch subscription history'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription_details(request, subscription_id):
    try:
        subscription = SubscriptionRequest.objects.get(id=subscription_id)
        
        # Check if user has permission to view this subscription
        if subscription.user != request.user and not request.user.is_staff:
            return Response({
                'message': 'You do not have permission to view this subscription'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'id': subscription.id,
            'type': subscription.subscription_type,
            'created_at': subscription.created_at,
            'updated_at': subscription.updated_at,
            'payment_slip_url': request.build_absolute_uri(subscription.payment_slip.url) if subscription.payment_slip else None,
            'username': subscription.user.username
        })
    except SubscriptionRequest.DoesNotExist:
        return Response({
            'message': 'Subscription not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching subscription details: {str(e)}")
        return Response({
            'message': 'Failed to fetch subscription details'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)