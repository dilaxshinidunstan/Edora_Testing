from django.urls import path
from . import views

urlpatterns = [
    path('', views.personalized_general_english_chat, name="personalized_general_english_chat"),
]
