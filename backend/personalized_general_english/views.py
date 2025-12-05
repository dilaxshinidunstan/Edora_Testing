from django.shortcuts import render
from learner.models import Learner
from learner.models import LearnerProfile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import google.generativeai as genai
import logging
from rest_framework.response import Response
from django.utils import timezone
from chat.models import Chat, ChatHistory

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GOOGLE_AI_API_KEY)

max_input_length = 200

def limit_input_length(user_input, max_length=max_input_length):
    if len(user_input) > max_length:
        user_input = user_input[:max_length] + "..."
        print(f"Input was too long. Truncated to {max_length} characters.")
    return user_input

# Initialize conversation history as a dictionary with user IDs as keys
conversation_memory = {}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def personalized_general_english_chat(request):
    learner = request.user
    learner_id = learner.id
    
    # Initialize chat history for this user if it doesn't exist
    if learner_id not in conversation_memory:
        conversation_memory[learner_id] = []
    
    try:
        # Get learner profile data
        learner_obj = Learner.objects.get(id=learner.id)
        learner_profile = LearnerProfile.objects.get(learner=learner)
        
        learner_name = learner_obj.username
        grade = learner_obj.grade
        interests = learner_profile.interests
        progress = learner_profile.progress
        
    except (Learner.DoesNotExist, LearnerProfile.DoesNotExist):
        learner_name = learner.username
        grade = None
        interests = None
        progress = None
    
    user_input = request.data.get('user_input', '')
    new_chat = request.data.get('new_chat', False)
    chat_id = request.data.get('chat_id')
    
    if new_chat or chat_id is None:
            # Create a new chat
            new_chat = Chat.objects.create(
                learner=learner,
                chat_title=user_input[:30] + "..." if len(user_input) > 30 else user_input,
                chat_started_at=timezone.now()
            )
            chat_id = new_chat.chat_id
            conversation_memory[learner.id] = []
    else:
        try:
            # Retrieve existing chat session
            chat = Chat.objects.get(chat_id=chat_id, learner=learner)
            print(f"Retrieved chat: {chat}")
            chat_messages = ChatHistory.objects.filter(chat=chat).order_by('timestamp')
            
            print(f"Retrieved chat history: {len(chat_messages)}")
            conversation_memory[learner.id] = []
            for entry in chat_messages:
                logger.debug(f"Processing chat history entry: message={entry.message}, response={entry.response}")
                conversation_memory[learner.id].append({"role": "user", "content": entry.message})
                conversation_memory[learner.id].append({"role": "assistant", "content": entry.response})
        except Chat.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=404)

    
    # Build the prompt
    prompt = f"""
    You are Edora, an AI-powered English tutor designed to help students in Sri Lanka. Your goal is to help them develop a strong understanding of English grammar, vocabulary, and conversational skills. Personalize your guidance based on the student's profile:\n\n
    **Student Profile:**\n
    - **Name:** {learner_name}\n
    - **Grade:** {grade}\n"""

    if interests:
        prompt += f"    - **Interests:** {', '.join(interests)}\n"

    if progress:
        prompt += f"""    - **Progress:**\n
        - Grammar: {progress.get('grammar', 'N/A')}%\n
        - Vocabulary: {progress.get('vocabulary', 'N/A')}%\n
        - Conversation: {progress.get('conversation', 'N/A')}%\n\n"""

    prompt += f"""
    **Guidelines for Assistance:**\n
    1. **Grammar Assistance:**\n
       - Provide simple explanations of grammar rules using examples, stories, or easy-to-understand language.\n
       - Encourage {learner_name} to identify and correct their own mistakes by giving hints, not direct answers.\n
       - Offer practice exercises like fill-in-the-blank, matching, and sentence-building activities.\n\n
    2. **Conversational Skills:**\n
       - Teach basic English conversations for everyday situations, such as greetings, asking for help, talking about school or family, etc.\n
       - Provide feedback on vocabulary, sentence structure, and pronunciation.\n
       - Encourage speaking practice through role-playing and simple sentence exercises.\n\n
    3. **Interactive Learning:**\n
       - Create quizzes, word games, riddles, and simple puzzles to reinforce grammar and vocabulary.\n
       - Relate learning to Sri Lankan school life, family, and cultural events to make it more engaging and relevant.\n"""

    if interests:
        prompt += f"       - Use {learner_name}'s interests ({', '.join(interests)}) to create engaging exercises.\n"

    prompt += f"""
       - Offer activities such as 'find the mistake' games and matching exercises.\n\n
    4. **Supportive Guidance:**\n
       - Always offer encouragement and positive feedback, using friendly language and emojis.\n
       - Provide hints and reasoning for correct answers to help {learner_name} think independently.\n\n
    5. **Self-Study Support:**\n
       - Be available to assist {learner_name} on-demand with any questions about grammar, vocabulary, or conversational practice.\n
       - Provide helpful notes and summary guides for self-study and review.\n\n
    6. **Motivating Students:**\n
       - Use positive reinforcement to motivate {learner_name} and celebrate small successes.\n
       - Offer encouragement when {learner_name} feels discouraged, helping them understand that learning English opens up opportunities.\n"""

    if progress:
        prompt += f"""       - Tailor the difficulty level of exercises based on {learner_name}'s progress.\n
       - Since {learner_name} has stronger vocabulary skills ({progress.get('vocabulary', 'N/A')}%), challenge them with advanced words.\n
       - Since conversation skills need improvement ({progress.get('conversation', 'N/A')}%), provide extra speaking exercises.\n\n"""

    prompt += f"""
    Please maintain a friendly, patient, and motivating tone in all responses, focusing on making English learning fun and enjoyable. 😊\n\n
    **Conversation History:**\n"""
    
    # Add conversation history
    for chat in conversation_memory[learner_id]:
        prompt += f"{chat['role']}: {chat['content']}\n"

    prompt += f"\n**Student Input:** {user_input}\n\n**Tutor Response:**"

    try:
        # Call Gemini model
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        # Extract text response
        response_text = response.text if response else "Sorry, I couldn't process that."

        # Update chat history
        conversation_memory[learner_id].append({"role": "Student", "content": user_input})
        conversation_memory[learner_id].append({"role": "Tutor", "content": response_text})

        # Limit chat history to last 10 exchanges
        # if len(conversation_memory[learner_id]) > 20:  # 10 exchanges = 20 messages
        #     conversation_memory[learner_id] = conversation_memory[learner_id][-20:]
        
        ChatHistory.objects.create(
            chat_id=chat_id,
            message=user_input,
            response=response_text,
        )

        return Response({
            'response': response_text,
            'chat_history': conversation_memory[learner_id]
        })

    except Exception as e:
        logger.error(f"Error in personalized chat: {str(e)}")
        return Response({
            'error': 'An error occurred while processing your request.'
        }, status=500)

    
    