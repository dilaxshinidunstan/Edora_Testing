from django.urls import path
from .views import choose_category, play_hangman, guess_letter, get_word_from_gpt

urlpatterns = [
    path('choose-category/', choose_category, name='choose_category'),
    path('get-word-from-gpt/', get_word_from_gpt, name='get_word_from_gpt'),
    path('play-hangman/', play_hangman, name='play_hangman'),
    path('guess-letter/', guess_letter, name='guess_letter'),
]
