from django.http import JsonResponse
import openai
import random
import re
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from dotenv import load_dotenv
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status


load_dotenv()  # Load environment variables from .env


openai.api_key = os.getenv('OPENAI_API_KEY')  # Assuming you have it in the .env file.


# Function to choose a category
def choose_category():
    categories = ["Animals", "Fruits", "Countries", "Colors", "Sports", "Vegetables", "Clothing", "Parts of the body", "Jobs", "Weather", "Transportations", "Flowers"]
    return JsonResponse({"categories": categories})

# Updated function to get a word from GPT-3.5 based on the chosen category
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_word_from_gpt(request):
    category = request.data.get('category', '')
    learner = request.user
    
    if learner.is_anonymous:
        return Response({"error": "User must be authenticated"}, status=status.HTTP_400_BAD_REQUEST)

    while True:
        if category:
            prompt = f"Give me a single word related to '{category}' for a hangman game. The word should have no symbols and should be between 4-12 letters long."
        else:
            prompt = "Give me a single word for a hangman game. The word should have no symbols and should be between 4-12 letters long."

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ]
            )

            # Log the response for debugging purposes
            print("GPT response:", response)

            message_content = response['choices'][0]['message']['content'].strip()
            match = re.search(r'\b[a-zA-Z]{4,12}\b', message_content)
            
            if match:
                word = match.group(0).lower()  # Ensure it's in lowercase
                return Response({"word": word}, status=200)
            else:
                print(f"No valid word found in response: {message_content}")
                continue

        except (KeyError, IndexError) as e:
            print("Error fetching word from GPT response:", e)
            continue
        except Exception as e:
            return Response(
                {"error": f"Failed to generate word: {str(e)}"}, 
                status=500
            )

# Function to handle playing the hangman game
@api_view(['GET'])
def play_hangman(request):
    category = request.GET.get('category')
    
    # Create a new request to get_word_from_gpt
    word_response = get_word_from_gpt(request)
    
    # Extract the word from the response
    if not word_response or not isinstance(word_response.data, dict):
        return JsonResponse({"error": "Failed to generate word"}, status=400)
    
    word = word_response.data.get('word')
    if not word:
        print("Debug: 'word' not found in response")
        return JsonResponse({"error": "Game not started or word missing from response."}, status=400)
    
    # Initialize game session
    request.session['word'] = word
    request.session['guessed_letters'] = []
    request.session['wrong_guesses'] = []
    request.session['attempts'] = 5
    
    # Choose a clue letter
    clue_index = random.randint(0, len(word) - 1)
    clue_letter = word[clue_index].lower()
    
    # Create initial masked word with clue letter revealed
    masked_word = ''.join([letter if letter == clue_letter else '_' for letter in word])
    request.session['masked_word'] = masked_word
    
    request.session.modified = True
    
    return JsonResponse({
        "word": word, 
        "masked_word": masked_word, 
        "attempts": 5
    })

# Function to handle letter guessing
@require_GET
def guess_letter(request):
    letter = request.GET.get('letter', '').lower()  # Get the guessed letter from the request
    word = request.session.get('word')

    guessed_letters = request.session.get('guessed_letters', [])
    wrong_guesses = request.session.get('wrong_guesses', [])
    masked_word = request.session.get('masked_word', '')
    attempts = request.session.get('attempts', 6)

    # Check if the game is properly initialized
    if not word:
        return JsonResponse({"error": "Game not started or word missing from session."}, status=400)

    # Check if the guessed letter is valid
    if not letter or len(letter) != 1 or not letter.isalpha():
        return JsonResponse({"error": "Invalid guess."}, status=401)

    # If letter was already guessed, return the current state without changes
    if letter in guessed_letters or letter in wrong_guesses:
        return JsonResponse({
            "masked_word": masked_word,
            "attempts": attempts,
            "guessed_letters": guessed_letters,
            "wrong_guesses": wrong_guesses,
            "game_over": attempts <= 0
        })

    # Process the guess
    if letter in word:
        # Update masked word to reveal correctly guessed letters
        masked_word = ''.join([char if char == letter or masked_word[i] != '_' else '_'
                               for i, char in enumerate(word)])
        guessed_letters.append(letter)
    else:
        # Wrong guess, reduce attempts
        wrong_guesses.append(letter)
        attempts -= 1

    # Update session variables
    request.session['masked_word'] = masked_word
    request.session['guessed_letters'] = guessed_letters
    request.session['wrong_guesses'] = wrong_guesses
    request.session['attempts'] = attempts
    request.session.modified = True

    # Determine if the game is over
    game_over = attempts <= 0 or '_' not in masked_word
    return JsonResponse({
    "updatedMaskedWord": masked_word,
    "attempts": attempts,
    "guessed_letters": guessed_letters,
    "wrong_guesses": wrong_guesses,
    "game_over": game_over
})

