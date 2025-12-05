from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat_view, name='chat'),
    path('history/', views.get_chat_history, name='history'),
    path('sessions', views.get_chat_sessions, name='sessions'),
    path('rename_chat_session/<str:chat_id>/', views.rename_chat_session, name='rename_chat_session'),
    path('delete_chat_session/<str:chat_id>/', views.delete_chat_session, name='delete_chat_session'),
    path('soft_delete_chat_session/<str:chat_id>/', views.soft_delete_chat_session, name='soft_delete_chat_session'),
    path('generate_suggestions/', views.generate_suggestions, name='generate_suggestions'),
]
