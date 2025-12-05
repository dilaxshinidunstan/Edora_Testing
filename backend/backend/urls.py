from django.contrib import admin
from django.urls import path, include
import quiz.urls as quiz_urls
import pastpaper.urls
import learner.urls
import chat.urls
import historical.urls
import guest_user.urls
import personalized_general_english.urls
import sms.urls
import subscription.urls
import festival.urls
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # Chat-related endpoints
    path('chat/', include(chat.urls)),
    
    # Learner-related endpoints
    path('learner/', include(learner.urls)),

    # Quiz-related endpoints
    path('quiz/', include(quiz_urls)),
    
    # Historical chat related
    path('historical/', include(historical.urls)),
    
    # Pastpaper chat related
    path('pastpaper/', include(pastpaper.urls)),

    # Hangman related
    path('hangman/', include('hangman.urls')),
    
    # SMS related
    path('sms/', include('sms.urls')),
    
    # Guest User related
    path('guest-user/', include(guest_user.urls)),
    
    # Personlized general English chat related
    path('personalized-general-english-chat/', include(personalized_general_english.urls)),
    
    # Subscriptin related
    path('subscription/', include(subscription.urls)),

    # Festival
    path('festival/', include(festival.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
