# utils.py
import logging
import json
import requests
from django.conf import settings  # Store your credentials here (like in settings.py)
import base64

IDEAMART_API_URL = "https://api.dialog.lk/subscription/send"  # URL for production
ideamart_app_id = settings.IDEAMART_APP_ID
ideamart_password = settings.IDEAMART_PASSWORD

# Configure logging at the top of the file
logger = logging.getLogger(__name__)

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
        # Attempt base64 decryption
        try:
            # Clean the input for URL-safe Base64
            cleaned_number = encrypted_number.replace('-', '+').replace('_', '/')
            base64_decoded = base64.b64decode(cleaned_number)
            return base64_decoded.decode('utf-8')
        except (base64.binascii.Error, UnicodeDecodeError) as base64_error:
            logger.warning(f"Base64 decryption failed: {base64_error}")

        # Attempt URL-safe base64 decryption
        try:
            url_safe_decoded = base64.urlsafe_b64decode(encrypted_number)
            return url_safe_decoded.decode('utf-8')
        except (base64.binascii.Error, UnicodeDecodeError) as url_safe_error:
            logger.warning(f"URL-safe base64 decryption failed: {url_safe_error}")

        # If no decryption works, return the original number
        logger.warning(f"All decryption attempts failed for number: {encrypted_number}")
        return encrypted_number

    except Exception as e:
        logger.error(f"Unexpected error in decrypt_phone_number: {e}")
        return encrypted_number

def subscribe_user(subscriber_id):
    """ Function to register a user to subscription """
    payload = {
        "applicationId": ideamart_app_id,
        "password": ideamart_password,
        "version": "1.0",
        "action": "1",  # 1 for subscribe (opt-in)
        "subscriberId": f"tel:{subscriber_id}"
    }
    
    try:
        logger.info(f"Raw subscriber_id received: {subscriber_id}")
        logger.debug(f"Full payload being sent: {json.dumps(payload, indent=2)}")
        
        response = requests.post(IDEAMART_API_URL, json=payload)
        
        # Log the raw response first
        logger.info(f"Raw response: {response.text}")
        logger.info(f"Response Status Code: {response.status_code}")
        
        try:
            response_data = response.json()
            logger.info(f"Parsed JSON response: {json.dumps(response_data)}")
            return response_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response content: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        return None

def unsubscribe_user(subscriber_id):
    """ Function to unregister a user from subscription """
    payload = {
        "applicationId": ideamart_app_id,
        "password": ideamart_password,
        "version": "1.0",
        "action": "0",  # 0 for unsubscribe (opt-out)
        "subscriberId": f"tel:{subscriber_id}"
    }
    
    try:
        response = requests.post(IDEAMART_API_URL, json=payload)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error unsubscribing user: {e}")
        return None

def write_log(message):
    logger.info(message)
