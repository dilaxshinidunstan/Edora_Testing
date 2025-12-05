from django.urls import path
from .views import create_festival_entry


urlpatterns = [
    path('entry/', create_festival_entry, name='create_festival_entry'),
]


