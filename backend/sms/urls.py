from django.urls import path
from . import views

urlpatterns = [
    path('receive-sms/', views.sms_receiver, name='sms_receiver'),
    path('send-sms/', views.send_sms, name='send_sms'),
    path('subscription-notification/', views.subscription_notification, name='subscription_notification'),
    path('subscribe/', views.subscribe, name='subscribe'),
    path('unsubscribe/', views.unsubscribe, name='unsubscribe'),
    path('query-subscription-status/', views.query_subscription_status, name='query_subscription_status'),
    path('save-phone-number/', views.save_phone_number, name='save_phone_number'),
    path('test-decrypt/', views.test_decrypt, name='test_decrypt'),
]