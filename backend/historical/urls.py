from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.historical_chat_view, name="chat"),
    path('history/', views.get_historical_chat_history, name='history'),
    path('get_chat_titles', views.get_chat_titles, name="get_chat_titles"),
    path('rename_chat_title/<str:chat_id>/', views.rename_chat_title, name="rename_chat_title"),
    path('soft_delete_chat/<str:chat_id>/', views.soft_delete_chat, name='soft_delete_chat'),

]
