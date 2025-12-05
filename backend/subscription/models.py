from django.db import models
from learner.models import Learner

class SubscriptionRequest(models.Model):
    SUBSCRIPTION_TYPES = (
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )
    
    user = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='subscription_requests')
    subscription_type = models.CharField(max_length=10, choices=SUBSCRIPTION_TYPES)
    payment_slip = models.FileField(upload_to='payment_slips/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.subscription_type}"
