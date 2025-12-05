from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.conf import settings
from uuid import uuid4
from django.utils import timezone
from datetime import timedelta

class LearnerManager(BaseUserManager):
    def create_user(self, email, username, firstname=None, lastname=None, grade=None, mobile_no=None, address=None, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            firstname=firstname,
            lastname=lastname,
            grade=grade,
            mobile_no=mobile_no,
            address=address,
            is_active = False,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, firstname=None, lastname=None, grade=None, mobile_no=None, address=None, password=None):
        user = self.create_user(
            email,
            username=username,
            firstname=firstname,
            lastname=lastname,
            grade=grade,
            mobile_no=mobile_no,
            address=address,
            password=password,
        )
        user.is_admin = True
        user.is_active = True
        user.save(using=self._db)
        return user

class Learner(AbstractBaseUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    firstname = models.CharField(max_length=100, blank=True, null=True)
    lastname = models.CharField(max_length=100, blank=True, null=True)
    grade = models.CharField(max_length=10, blank=True, null=True)
    mobile_no = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=False)
    verification_token = models.UUIDField(default=uuid4, editable=False)  # Store token for verification
    is_admin = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    reset_token = models.CharField(max_length=32, blank=True, null=True)  # Field to store the reset token
    reset_token_created_at = models.DateTimeField(blank=True, null=True)  # Field to store when the token was created

    objects = LearnerManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def is_reset_token_valid(self):
        """Check if the reset token is still valid (e.g., not expired)."""
        if self.reset_token_created_at:
            return timezone.now() < self.reset_token_created_at + timedelta(hours=1)  # Token valid for 1 hour
        return False

class LearnerQuota(models.Model):
    learner = models.OneToOneField(Learner, on_delete=models.CASCADE)
    general_bot_calls = models.IntegerField(default=0)
    pastpaper_bot_calls = models.IntegerField(default=0)
    historical_bot_calls = models.IntegerField(default=0)
    last_reset_date = models.DateField(null=True, blank=True)
    
    # Add quota fields
    general_bot_quota = models.IntegerField(default=settings.BOT_QUOTAS['general_bot'])
    pastpaper_bot_quota = models.IntegerField(default=settings.BOT_QUOTAS['pastpaper_bot'])
    historical_bot_quota = models.IntegerField(default=settings.BOT_QUOTAS['historical_bot'])

    
    def __str__(self):
        return f"{self.learner.username} Quotas"
    
class LearnerProfile(models.Model):
    learner = models.OneToOneField(Learner, on_delete=models.CASCADE, related_name='profile')
    interests = models.TextField(blank=True, null=True, help_text="Store interests as a comma-separated list e.g., 'cricket, singing, dancing'")
    progress = models.JSONField(
        null=True, 
        blank=True,
        help_text="Store progress as a dictionary e.g., {'grammar': 50, 'vocabulary': 40, 'conversation_skill': 60}"
    )
    grade = models.CharField(
        max_length=10, 
        blank=True, 
        null=True,
        help_text="Student's current grade e.g., 'Below grade 6', '6', '7', '8', '9', '10', 'O/L', 'A/L', 'Above A/L'"
    )
    calling_name = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.learner.username}'s Profile"