from django.db import models
from django.core.validators import RegexValidator
from learner.models import Learner

class Subscriber(models.Model):
    phone_number = models.CharField(
        max_length=20, 
        null=True, 
        blank=True,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")]
    )
    encrypted_phone_number = models.CharField(max_length=255, null=True, blank=True) 
    is_subscribed = models.BooleanField(default=False)
    
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, null=True, blank=True)
    
    is_encrypted = models.BooleanField(default=True)  # Renamed for clarity

    class Meta:
        verbose_name = "Subscriber"
        verbose_name_plural = "Subscribers"
        ordering = ['phone_number']  # Example ordering