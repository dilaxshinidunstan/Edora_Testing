from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import subscribe_user, unsubscribe_user
from .models import Subscriber
import logging
import requests
from django.conf import settings
import base64
from django.contrib.auth import get_user_model
import urllib.parse
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


logger = logging.getLogger(__name__)

ideamart_app_id = settings.IDEAMART_APP_ID
ideamart_password = settings.IDEAMART_PASSWORD

@csrf_exempt  # Exempt from CSRF for webhook handling
def sms_receiver(request):
    if request.method == "POST":
        try:
            # Parse incoming JSON payload
            payload = json.loads(request.body)

            # Extract required fields from the payload
            source_address = payload.get("sourceAddress")
            message = payload.get("message")

            if not source_address or not message:
                response = JsonResponse(
                    {"statusCode": "E1312", "statusDetail": "Invalid request payload"},
                    status=400,
                )
                logger.info("Response: %s", response.content)  # Log the response
                return response

            # Process the message
            if message.strip().lower() == "reg edu_tech":
                # Register the user or perform required action
                # Example: Save the user info to the database

                response = JsonResponse(
                    {
                        "statusCode": "S1000",
                        "statusDetail": "You have successfully registered for EduTech!",
                    }
                )
                logger.info("Response: %s", response.content)  # Log the response
                return response
            else:
                # Handle invalid messages
                response = JsonResponse(
                    {
                        "statusCode": "E1301",
                        "statusDetail": "Invalid message format. Please send 'reg edu_tech' to register.",
                    },
                    status=400,
                )
                logger.info("Response: %s", response.content)  # Log the response
                return response

        except json.JSONDecodeError:
            # Handle JSON parsing errors
            response = JsonResponse(
                {"statusCode": "E1312", "statusDetail": "Invalid JSON payload"}, status=400
            )
            logger.info("Response: %s", response.content)  # Log the response
            return response
    else:
        # Reject non-POST requests
        response = JsonResponse(
            {"statusCode": "E1313", "statusDetail": "Invalid request method"}, status=405
        )
        logger.info("Response: %s", response.content)  # Log the response
        return response

def broadcast_message(message):
    subscribers = Subscriber.objects.filter(is_subscribed=True)
    for subscriber in subscribers:
        send_sms(message, subscriber.phone_number)
    return "Broadcast sent"

def send_sms(message, address):
    sms_payload = {
        "applicationId": ideamart_app_id,  # Replace with your app ID
        "password": ideamart_password,  # Replace with your app password
        "message": message,
        "destinationAddresses": [address],
        "version": "1.0"
    }
    response = requests.post("https://api.dialog.lk/sms/send", json=sms_payload)
    logger.info("SMS sent to %s: %s", address, response.text)
    return response.text

@csrf_exempt
def subscribe(request):
    """Handle user subscription using Ideamart API"""
    if request.method == "POST":
        encrypted_phone_number = request.POST.get('encrypted_phone_number')
        
        if not encrypted_phone_number:
            return JsonResponse({"status": "error", "message": "Encrypted phone number is required."}, status=400)
        
        try:
            # Call subscribe_user from utils
            api_response = subscribe_user(encrypted_phone_number)
            
            if api_response:
                # Create or update local subscriber record
                subscriber, created = Subscriber.objects.get_or_create(
                    encrypted_phone_number=encrypted_phone_number,
                    defaults={
                        'is_subscribed': True
                    }
                )
                
                # Update subscription status
                subscriber.is_subscribed = True
                subscriber.save()
                
                logger.info(f"Subscriber {encrypted_phone_number} successfully subscribed")
                return JsonResponse({
                    "status": "subscribed", 
                    "message": "Successfully subscribed!",
                    "api_response": api_response
                })
            else:
                logger.error(f"Subscription failed for {encrypted_phone_number}")
                return JsonResponse({
                    "status": "error", 
                    "message": "Subscription failed. Please try again."
                }, status=400)
        
        except Exception as e:
            logger.error(f"Subscription error: {str(e)}")
            return JsonResponse({
                "status": "error", 
                "message": f"An error occurred: {str(e)}"
            }, status=500)
    
    return JsonResponse({
        "status": "error", 
        "message": "Invalid request method."
    }, status=405)

@csrf_exempt
def unsubscribe(request):
    """Handle user unsubscription using Ideamart API"""
    if request.method == "POST":
        encrypted_phone_number = request.POST.get('encrypted_phone_number')
        
        if not encrypted_phone_number:
            return JsonResponse({
                "status": "error", 
                "message": "Phone number is required."
            }, status=400)
        
        try:
            # Call unsubscribe_user from utils
            api_response = unsubscribe_user(encrypted_phone_number)
            
            if api_response:
                # Find and update local subscriber record
                try:
                    subscriber = Subscriber.objects.get(encrypted_phone_number=encrypted_phone_number)
                    subscriber.is_subscribed = False
                    subscriber.save()
                except Subscriber.DoesNotExist:
                    # Create a record if it doesn't exist
                    Subscriber.objects.create(
                        encrypted_phone_number=encrypted_phone_number,
                        is_subscribed=False
                    )
                
                logger.info(f"Subscriber {encrypted_phone_number} successfully unsubscribed")
                return JsonResponse({
                    "status": "unsubscribed", 
                    "message": "Successfully unsubscribed!",
                    "api_response": api_response
                })
            else:
                logger.error(f"Unsubscription failed for {encrypted_phone_number}")
                return JsonResponse({
                    "status": "error", 
                    "message": "Unsubscription failed. Please try again."
                }, status=400)
        
        except Exception as e:
            logger.error(f"Unsubscription error: {str(e)}")
            return JsonResponse({
                "status": "error", 
                "message": f"An error occurred: {str(e)}"
            }, status=500)
    
    return JsonResponse({
        "status": "error", 
        "message": "Invalid request method."
    }, status=405)

def decrypt_phone_number(encrypted_number):
    """
    Enhanced decryption method with multiple decryption attempts
    
    Args:
        encrypted_number (str): The encrypted phone number
    
    Returns:
        str: Decrypted phone number or original number if decryption fails
    """
    if not encrypted_number:
        return None

    try:
        # First, URL-decode the encrypted number
        url_decoded = urllib.parse.unquote(encrypted_number)
        logger.info(f"URL-decoded number: {url_decoded}")
        
        missing_padding = len(url_decoded) % 4
        if missing_padding:
            url_decoded += "=" * (4 - missing_padding)

        # Attempt base64 decryption
        try:
            base64_decoded = base64.b64decode(url_decoded).decode('utf-8')
            logger.info(f"Successfully decoded using base64: {base64_decoded}")
            return base64_decoded
        except Exception as base64_error:
            logger.warning(f"Base64 decryption failed: {base64_error}")

        # Attempt URL-safe base64 decryption
        try:
            url_safe_decoded = base64.urlsafe_b64decode(url_decoded).decode('utf-8')
            logger.info(f"Successfully decoded using URL-safe base64: {url_safe_decoded}")
            return url_safe_decoded
        except Exception as url_safe_error:
            logger.warning(f"URL-safe base64 decryption failed: {url_safe_error}")

        # If no decryption works, return the original number
        logger.warning(f"All decryption attempts failed for number: {encrypted_number}")
        return encrypted_number

    except Exception as e:
        logger.error(f"Unexpected error in decrypt_phone_number: {e}")
        return encrypted_number

@csrf_exempt
def subscription_notification(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.info("Received subscription notification: %s", json.dumps(data, indent=2))

            # Handle both encrypted and non-encrypted numbers
            subscriber_id = data.get('subscriberId', '').replace('tel:', '')
            frequency = data.get('frequency')
            status = data.get('status')

            if status == "REGISTERED":
                # Update or create the subscriber
                subscriber, created = Subscriber.objects.get_or_create(
                    encrypted_phone_number=subscriber_id,
                    defaults={
                        'is_subscribed': True,
                        'frequency': frequency,
                        'is_encrypted': len(subscriber_id) > 20  # Heuristic to detect encryption
                    }
                )
                
                if not created:
                    subscriber.is_subscribed = True
                    subscriber.frequency = frequency
                    subscriber.save()

                logger.info("Subscriber %s registered with frequency %s", subscriber_id, frequency)
                return JsonResponse({"status": "success", "message": "Subscriber registered successfully."}, status=200)

            elif status == "UNREGISTERED":
                # Handle unregistration
                subscriber, created = Subscriber.objects.get_or_create(
                    encrypted_phone_number=subscriber_id,
                    defaults={
                        'is_subscribed': False,
                        'is_encrypted': len(subscriber_id) > 20
                    }
                )
                
                subscriber.is_subscribed = False
                subscriber.save()
                
                logger.info("Subscriber %s unregistered", subscriber_id)
                return JsonResponse({"status": "success", "message": "Subscriber unregistered successfully."}, status=200)
            else:
                return JsonResponse({"status": "error", "message": "Invalid status."}, status=400)

        except Exception as e:
            logger.error("Error processing subscription notification: %s", str(e))
            return JsonResponse({"error": "Failed to process notification"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def query_subscription_status(request):
    """
    Query the subscription status for a given subscriber
    
    Expected JSON payload:
    {
        "subscriberId": "tel:94771234567"
    }
    """
    if request.method == 'POST':
        try:
            # Parse incoming JSON payload
            data = json.loads(request.body)
            
            # Validate input
            subscriber_id = data.get('subscriberId')
            if not subscriber_id:
                return JsonResponse({
                    "status": "error", 
                    "message": "Subscriber ID is required"
                }, status=400)
            
            # Prepare payload for Dialog API
            query_payload = {
                "applicationId": ideamart_app_id,
                "password": ideamart_password,
                "subscriberId": subscriber_id,
                "version": "1.0"
            }
            
            # Send request to Dialog API
            try:
                response = requests.post(
                    "https://api.dialog.lk/subscription/getStatus", 
                    json=query_payload,
                    timeout=10  # Set a reasonable timeout
                )
                
                # Log the raw response for debugging
                logger.info(f"Dialog API Response: {response.text}")
                
                # Check if request was successful
                if response.status_code == 200:
                    api_response = response.json()
                    
                    # Extract and process subscription status
                    subscription_status = api_response.get('subscriptionStatus')
                    status_code = api_response.get('statusCode')
                    status_detail = api_response.get('statusDetail')
                    
                    return JsonResponse({
                        "status": "success",
                        "subscriptionStatus": subscription_status,
                        "statusCode": status_code,
                        "statusDetail": status_detail
                    })
                else:
                    # Handle non-200 responses
                    return JsonResponse({
                        "status": "error",
                        "message": f"API request failed with status {response.status_code}",
                        "raw_response": response.text
                    }, status=response.status_code)
            
            except requests.RequestException as req_error:
                logger.error(f"Request to Dialog API failed: {req_error}")
                return JsonResponse({
                    "status": "error", 
                    "message": "Failed to connect to subscription service"
                }, status=500)
        
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error", 
                "message": "Invalid JSON payload"
            }, status=400)
    
    # Handle non-POST requests
    return JsonResponse({
        "status": "error", 
        "message": "Only POST requests are allowed"
    }, status=405)

@csrf_exempt
def test_decrypt(request):
    """
    Endpoint to test phone number decryption
    """
    if request.method == 'POST':
        try:
            # Parse JSON payload
            data = json.loads(request.body)
            encrypted_number = data.get('encrypted_number')

            if not encrypted_number:
                return JsonResponse({
                    "status": "error", 
                    "message": "No encrypted number provided"
                }, status=400)

            # Attempt decryption
            decrypted_number = decrypt_phone_number(encrypted_number)

            return JsonResponse({
                "status": "success",
                "original_number": encrypted_number,
                "decrypted_number": decrypted_number,
                "decryption_attempted": True
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error", 
                "message": "Invalid JSON payload"
            }, status=400)
    
    return JsonResponse({
        "status": "error", 
        "message": "Only POST requests allowed"
    }, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated
def save_phone_number(request):
    """Get the phone number from the user and save it to the Learner model and Subscriber model."""
    if request.method == "POST":
        learner = request.user  # This should now be an authenticated Learner instance
        phone_number = request.data.get('phone_number')  # Use request.data for DRF

        # Validate the phone number (basic validation)
        if not phone_number:
            return JsonResponse({"status": "error", "message": "Phone number is required."}, status=400)

        # Example validation: Check if the phone number is valid (you can customize this regex)
        if not re.match(r'^\+?[1-9]\d{1,14}$', phone_number):
            return JsonResponse({"status": "error", "message": "Invalid phone number format."}, status=400)

        try:
            # Create or update the subscriber record
            # subscriber, created = Subscriber.objects.get_or_create(
            #     learner=learner,
            #     phone_number=phone_number,
            # )
            learner.mobile_no = phone_number
            learner.save()  # Save the updated learner record

            # if created:
            #     message = "Phone number successfully saved and subscribed!"
            # else:
            #     message = "Phone number already exists. Updated subscription status."

            # subscriber.save()  # Save the subscriber record (if any changes were made)

            return JsonResponse({"status": "success", "message": "Phone number is saved successfully"}, status=200)

        except Exception as e:
            return JsonResponse({"status": "error", "message": f"An error occurred: {str(e)}"}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)

