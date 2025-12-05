from django.urls import path
from . import views

app_name = 'subscription'

urlpatterns = [
    path('request/', views.create_subscription_request, name='create_request'),
    path('history', views.get_user_subscriptions, name='subscription_history'),
    path('subscription/<int:subscription_id>/', views.get_subscription_details, name='subscription-details'),
]
