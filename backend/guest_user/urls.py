from django.urls import path
from . import views

urlpatterns = [
    path('general-chat/', views.general_chat_view, name='general_chat_view'),
    path('quiz/', views.generate_quiz_view, name='generate_quiz_view'),
    path('quiz/generate/', views.guest_generate_quiz, name='guest_generate_quiz'),
    path('quiz/submit/', views.guest_submit_quiz, name='guest_submit_quiz'),
]
