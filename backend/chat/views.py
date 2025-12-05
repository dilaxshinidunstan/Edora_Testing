from django.http import JsonResponse
import openai
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Chat, ChatHistory
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import re
import tiktoken
from learner.utils import check_and_update_quota
import logging
from django.shortcuts import get_object_or_404
from learner.models import Learner, LearnerProfile
from google import generativeai as genai
from typing import List, Dict

logger = logging.getLogger(__name__)

# Set your OpenAI API key
openai.api_key = settings.OPENAI_API_KEY

max_input_length = 200

def limit_input_length(user_input, max_length=max_input_length):
    if len(user_input) > max_length:
        user_input = user_input[:max_length] + "..."
        print(f"Input was too long. Truncated to {max_length} characters.")
    return user_input

# count tokens for a text
def count_tokens(text, model='gpt-4o-mini'):
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))

# Function to truncate conversation history based on token count
def truncate_conversation(history, max_tokens=3000):
    total_tokens = 0
    truncated_history = []

    # Iterate from the most recent to the oldest message
    for entry in reversed(history):
        message_tokens = count_tokens(entry['content'])
        if total_tokens + message_tokens > max_tokens:
            break  # Stop adding messages if the limit is exceeded
        total_tokens += message_tokens
        truncated_history.insert(0, entry)  # Insert in reverse order to preserve history

    return truncated_history

# Define the conversation state variables
conversation_history = {}
selected_year = {}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    try:
        data = json.loads(request.body)
        user_input = data.get('user_input', '')
        bot_type = 'general_bot'
        
        numberof_input_tokens = count_tokens(user_input)
        
        if numberof_input_tokens > max_input_length:
            return JsonResponse({
                'error': f"Input too long. Please limit your input to {max_input_length} characters."
            }, status=400)    
        
        user_input = limit_input_length(user_input)
        new_chat = data.get('new_chat', False)
        chat_id = data.get('chat_id')
        learner = request.user
        
        print(f"Received data: learner= {learner}, user_input= {user_input}, new_chat= {new_chat}, chat_id= {chat_id}")
        
        # Handle free and premium users
        can_chat, error_message, remaining_quota = check_and_update_quota(learner=learner, bot_type=bot_type)
        if not can_chat:
            return JsonResponse({'error': error_message, 'remaining_quota': remaining_quota}, status=403)

        # Initialize chat history
        chat_history = []
        if not new_chat and chat_id:
            try:
                chat = Chat.objects.get(chat_id=chat_id, learner=learner)
                chat_history_entries = ChatHistory.objects.filter(chat=chat).order_by('timestamp')
                
                for entry in chat_history_entries:
                    chat_history.append({"role": "Student", "content": entry.message})
                    chat_history.append({"role": "Tutor", "content": entry.response})
            except Chat.DoesNotExist:
                return JsonResponse({'error': 'Chat not found.'}, status=404)
        else:
            # Create a new chat
            new_chat = Chat.objects.create(
                learner=learner,
                chat_title=user_input[:30] + "..." if len(user_input) > 30 else user_input,
                chat_started_at=timezone.now()
            )
            chat_id = new_chat.chat_id

        # Get learner profile data
        try:
            learner_obj = Learner.objects.get(id=learner.id)
            learner_profile = LearnerProfile.objects.get(learner=learner)
            
            learner_name = learner_obj.username
            calling_name = learner_profile.calling_name
            grade = learner_profile.grade
            interests = learner_profile.interests
            progress = learner_profile.progress
            
        except (Learner.DoesNotExist, LearnerProfile.DoesNotExist):
            learner_name = learner.username
            calling_name = None
            grade = None
            interests = None
            progress = None

        # Configure Google AI
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)

        # Get response using the new function
        assistant_response = get_model_response(
            chat_history=chat_history,
            student_name=learner_name,
            calling_name=calling_name,
            grade=grade,
            user_input=user_input,
            interests=interests,
            progress=progress
        )

        # Format response and generate suggestions
        assistant_response = format_response(assistant_response)
        suggestions = generate_suggestions(assistant_response)

        # Save chat history to database
        ChatHistory.objects.create(
            chat_id=chat_id,
            message=user_input,
            response=assistant_response,
            input_tokens=len(user_input.split()),  # Simplified token counting
            output_tokens=len(assistant_response.split())
        )
        
        return JsonResponse({
            'response': assistant_response,
            'suggestions': suggestions, 
            'chat_id': chat_id, 
            'remaining_quota': remaining_quota
        }, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def format_response(response):
    # Convert Markdown headers to HTML
    response = re.sub(r'^####\s+(.*?)$', r'<h4>\1</h4>', response, flags=re.MULTILINE)
    response = re.sub(r'^###\s+(.*?)$', r'<h3>\1</h3>', response, flags=re.MULTILINE)
    response = re.sub(r'^##\s+(.*?)$', r'<h2>\1</h2>', response, flags=re.MULTILINE)
    response = re.sub(r'^#\s+(.*?)$', r'<h1>\1</h1>', response, flags=re.MULTILINE)

    # Bold text
    response = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', response)
    
    # Bullet points
    response = re.sub(r'\n- (.*?)(?=\n|$)', r'<li>\1</li>', response)
    response = re.sub(r'<li>(.*?)</li>(?=<li>)', r'</ul>\n<li>\1</li>', response)
    response = re.sub(r'<li>(.*?)</li>', r'<ul>\n<li>\1</li></ul>', response)
    
    # Links with styling
    response = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" style="color: #007bff; text-decoration: none;">\1</a>', response)

    # Numbered lists
    # response = re.sub(r'\n\d+\. (.*?)(?=\n|$)', r'<li>\1</li>', response)
    # response = re.sub(r'<li>(.*?)</li>(?=<li>)', r'</ol>\n<li>\1</li>', response, flags=re.DOTALL)
    # response = re.sub(r'<li>(.*?)</li>', r'<ol>\n<li>\1</li></ol>', response, flags=re.DOTALL)
    
    # Remove extra spaces and newlines
    response = re.sub(r'\s*<li>', '<li>', response)
    response = re.sub(r'</li>\s*', '</li>', response)
    response = re.sub(r'\s*</?[uo]l>\s*', lambda m: m.group().strip(), response)
    # response = re.sub(r'\n+', '\n', response).strip()
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_conversation(request):
    try:
        learner = request.user

        # Clear conversation state for the learner
        selected_year.pop(learner.id, None)
        conversation_history.pop(learner.id, None)

        return JsonResponse({'success': 'Chat ended successfully.'})

    except Exception as e:
        print("Error in end_conversation:", str(e))
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    learner = request.user
    chat_id = request.GET.get('chat_id')  # Retrieve chat_id from query parameters

    if chat_id:
        try:
            # Fetch the specific chat and its history
            chat = Chat.objects.get(learner=learner, chat_id=chat_id)
            history = ChatHistory.objects.filter(chat=chat).order_by('timestamp')
            
            chat_data = {
                'chat_id': chat.chat_id,
                'chat_title': chat.chat_title,
                'chat_started_at': chat.chat_started_at,
                'chat_ended_at': chat.chat_ended_at,
                'history': [
                    {'message': entry.message, 'response': entry.response, 'timestamp': entry.timestamp}
                    for entry in history
                ]
            }
            
            return JsonResponse(chat_data, safe=False)
        
        except Chat.DoesNotExist:
            return JsonResponse({'error': 'Chat not found.'}, status=404)
    else:
        # Handle the case when chat_id is not provided
        return JsonResponse({'error': 'chat_id parameter is required.'}, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_sessions(request):
    learner = request.user
    
    chats = Chat.objects.filter(learner=learner, is_deleted=False).order_by('-last_message_at')
    
    chat_sessions = []
    for chat in chats:
        chat_history = ChatHistory.objects.filter(chat=chat).order_by('timestamp')
        
        conversation = [
            {
                'message': entry.message,
                'response': entry.response,
                'timestamp': entry.timestamp.isoformat()
            }
            for entry in chat_history
        ]
        
        chat_sessions.append({
            'chat_id': chat.chat_id,
            'chat_title': chat.chat_title,
            'chat_started_at': chat.chat_started_at.isoformat(),
            'chat_ended_at': chat.chat_ended_at.isoformat() if chat.chat_ended_at else None,
            'conversation': conversation
        })
        
    return JsonResponse(chat_sessions, safe=False)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def rename_chat_session(request, chat_id):
    try:
        chat = get_object_or_404(Chat, chat_id=chat_id, learner=request.user)
        new_title = request.data.get('new_title')
        
        if not new_title:
            return JsonResponse({'error': 'New title is required.'}, status=400)
        
        chat.chat_title = new_title
        chat.save()
        
        return JsonResponse({'success': 'Chat session renamed successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat_session(request, chat_id):
    try:
        chat = get_object_or_404(Chat, chat_id=chat_id, learner=request.user)
        chat.delete()
        
        return JsonResponse({'success': 'Chat session deleted successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def soft_delete_chat_session(request, chat_id):
    try:
        chat = get_object_or_404(Chat, chat_id=chat_id, learner=request.user)
        chat.is_deleted = True
        chat.save()
        
        return JsonResponse({'success': 'Chat session marked as deleted successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_chat(request):
#     try:
#         user_input = request.data.get('chat_titley', 'New Chat')  # Default title if not provided
#         learner = request.user
        
#         # Create a new chat
#         new_chat = Chat.objects.create(
#             learner=learner,
#             chat_title=user_input[:30] + "..." if len(user_input) > 30 else user_input,
#             chat_started_at=timezone.now()
#         )
        
#         return JsonResponse({'success': 'Chat created successfully.', 'chat_id': new_chat.chat_id}, status=201)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

def generate_suggestions(user_prompt):
    messages = [
        {"role": "user", "content": user_prompt},
        {"role": "system", "content": (
            "Please respond with a JSON array containing exactly three suggestions."
            "\nEach suggestion should:"
            "\n1. Start with action words (Practice, Tell me, Help me, Show me)"
            "\n2. Be 4-5 words maximum"
            "\n3. Relate to English learning"
            "\n4. Match the conversation context"
            "\nYour response must be in this exact JSON format:"
            '\n{"suggestions": ['
            '\n    "Tell me a story",'
            '\n    "Practice past tense verbs",'
            '\n    "Help with pronunciation"'
            '\n]}'
            "\nDo not include any other text or formatting."
        )}
    ]
    
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=messages,
        n=1
    )
    
    suggestions_text = response['choices'][0]['message']['content'].strip()
    
    try:
        # Try to parse the response as JSON
        parsed_response = json.loads(suggestions_text)
        suggestions = parsed_response.get('suggestions', [])
    except json.JSONDecodeError:
        # Fallback cleaning if JSON parsing fails
        cleaned_text = (suggestions_text
                       .replace('[', '')
                       .replace(']', '')
                       .replace("'", '')
                       .replace('"', '')
                       .replace('\\n', '')
                       .replace('\\', ''))
        
        suggestions = [s.strip() for s in cleaned_text.split(',') if s.strip() and s.strip() not in ['[', ']']]
    
    # Ensure we have exactly 3 suggestions
    while len(suggestions) < 3:
        suggestions.append("Tell me more")
    
    return suggestions[:3]  # Return only first 3 suggestions

def get_learning_stage(grade):
    """Maps Sri Lankan grade levels to learning stages."""
    if grade == "Below grade 6":
        return "Primary English Foundation"
    elif grade in ["6", "7", "8", "9"]:
        return "Lower Secondary English"
    elif grade in ["10", "O/L"]:
        return "O-Level Preparation"
    elif grade in ["A/L"]:
        return "A-Level Advanced English"
    elif grade == "Above A/L":
        return "Advanced English Communication"
    return "General English Learning"

def get_expected_proficiency(grade):
    """Maps Sri Lankan grade levels to expected English proficiency."""
    if grade == "Below grade 6":
        return "Basic communication and simple sentences"
    elif grade in ["6", "7", "8", "9"]:
        return "Intermediate grammar and expanded vocabulary"
    elif grade in ["10", "O/L"]:
        return "Strong grammar foundation and academic writing skills"
    elif grade in ["A/L"]:
        return "Advanced academic English and literature analysis"
    elif grade == "Above A/L":
        return "Professional and academic English mastery"
    return "General English proficiency"

def get_curriculum_focus(grade):
    """Returns specific curriculum focus based on grade level."""
    focus = {
        "below grade 6": [
            "Basic vocabulary and simple sentences",
            "Elementary grammar rules",
            "Simple reading comprehension",
            "Basic conversation skills"
        ],
        "6": [
            "Fundamental grammar structures",
            "Reading comprehension",
            "Basic writing skills",
            "Essential vocabulary"
        ],
        "7": [
            "Intermediate grammar",
            "Paragraph writing",
            "Reading comprehension",
            "Vocabulary building"
        ],
        "8": [
            "Advanced grammar concepts",
            "Essay writing introduction",
            "Critical reading skills",
            "Vocabulary expansion"
        ],
        "9": [
            "Complex grammar structures",
            "Essay writing development",
            "Comprehensive reading analysis",
            "Advanced vocabulary"
        ],
        "10": [
            "O-Level exam preparation",
            "Advanced writing skills",
            "Literature comprehension",
            "Exam-specific vocabulary"
        ],
        "O/L": [
            "O-Level past paper practice",
            "Advanced grammar mastery",
            "Literature analysis",
            "Exam techniques"
        ],
        "A/L": [
            "Advanced academic writing",
            "Literature appreciation",
            "Critical analysis",
            "Research writing skills"
        ],
        "above A/L": [
            "Professional writing",
            "Academic research",
            "Advanced communication",
            "Specialized vocabulary"
        ]
    }
    return focus.get(str(grade), ["General English skills", "Grammar", "Vocabulary", "Communication"])

def get_model_response(
    chat_history: List[Dict[str, str]],
    student_name: str,
    calling_name: str,
    grade: str,
    user_input: str,
    interests: List[str] = None,
    progress: Dict[str, int] = None
):
    """
    Generates a personalized English learning response for Sri Lankan students using Gemini AI.
    """
    # Get specific curriculum focus for the grade
    curriculum_focus = get_curriculum_focus(grade)
    
    # System prompt defining the AI tutor's role and personality
    system_prompt = """
    You are Edora, a friendly and encouraging AI-powered English tutor specializing in helping students in Sri Lanka. 
    
    Important Guidelines:
    - Use ONLY English in all interactions
    - Never use Sinhala or Tamil words or greetings (e.g., 'Ayubowan' or 'Vanakkam') unless the student explicitly mentions them first
    - Remember English is the second language for these students
    - Keep language simple and clear
    - Focus on building confidence in English communication
    - Avoid adding country flags
    - Do NOT use repetitive greetings in every response
    - Respond naturally based on the context
    
    Response Formatting:
    1. Use ### for main headings
    2. Use bullet points for lists
    3. Number steps in processes
    4. Use **bold** for important points
    5. Use appropriate emojis to make responses friendly
    6. Use tables for comparisons when needed
    
    Special Features Handling:
    1. ONLY when students specifically ask about past papers:
       - Provide the link: [Practice Past Papers](pastpapercard)
       - Offer guidance on effective practice methods
    
    2. ONLY when students specifically ask about Abdul Kalam:
       - Provide the link: [Chat with Abdul Kalam](idol/card)
       - Mention the learning benefits
    
    3. Off-Topic Conversations:
       - Politely redirect to English learning
       - Suggest engaging alternatives
    
    4. Emotional Support:
       - Show empathy and understanding
       - Redirect to engaging learning activities
       - Provide encouragement and motivation
       - Break tasks into manageable steps

    When explaining grammar:
    1. Start with a clear, simple rule
    2. Provide relatable examples
    3. Include practice exercises
    4. Use this format:
       ### Grammar Topic
       **Rule:** [Simple explanation]
       **Examples:**
       - Correct: `example`
       - Incorrect: `example`
       **Practice:**
       [Simple exercise]
    
    Important: 
    - Do NOT use "Hello {student_name}! 👋" in every response
    - Vary your greetings and responses naturally based on the conversation context
    """

    # Student profile analysis
    profile_prompt = f"""
    **Student Profile Analysis:**
    - Name: {student_name}
    - Calling Name: {calling_name}
    - Grade: {grade}
    - Current Learning Stage: {get_learning_stage(grade)}
    - Expected English Proficiency: {get_expected_proficiency(grade)}
    
    **Current Curriculum Focus:**
    {chr(10).join(f"- {focus}" for focus in curriculum_focus)}
    """

    # Add interests if available
    if interests:
        profile_prompt += f"""
    **Personal Interests:**
    - Interests: {', '.join(interests)}
    """

    # Add progress if available
    if progress:
        profile_prompt += f"""
    **Skills Progress:**
    Current Progress:
    - Grammar: {progress.get('grammar', 'N/A')}%
    - Vocabulary: {progress.get('vocabulary', 'N/A')}%
    - Conversation: {progress.get('conversation', 'N/A')}%
    """

    # Guidelines for assistance
    guidelines_prompt = f"""
    **Guidelines for Assistance:**
    1. **Grammar Assistance:**
    - Provide simple explanations of grammar rules using examples, stories, or easy-to-understand language.
    - Encourage {student_name} to identify and correct their own mistakes by giving hints, not direct answers.
    - Offer practice exercises like fill-in-the-blank, matching, and sentence-building activities.

    2. **Conversational Skills:**
    - Teach basic English conversations for everyday situations, such as greetings, asking for help, talking about school or family, etc.
    - Provide feedback on vocabulary, sentence structure, and pronunciation.
    - Encourage speaking practice through role-playing and simple sentence exercises.

    3. **Interactive Learning:**
    - Create quizzes, word games, riddles, and simple puzzles to reinforce grammar and vocabulary.
    - Relate learning to Sri Lankan school life, family, and cultural events to make it more engaging and relevant.
    """

    if interests:
        guidelines_prompt += f"    - Use {student_name}'s interests ({', '.join(interests)}) to create engaging exercises.\n"

    guidelines_prompt += """
    - Offer activities such as 'find the mistake' games and matching exercises.

    4. **Supportive Guidance:**
    - Always offer encouragement and positive feedback, using friendly language and emojis.
    - Provide hints and reasoning for correct answers to help students think independently.

    5. **Self-Study Support:**
    - Be available to assist with any questions about grammar, vocabulary, or conversational practice.
    - Provide helpful notes and summary guides for self-study and review.

    6. **Motivating Students:**
    - Use positive reinforcement to motivate and celebrate small successes.
    - Offer encouragement when students feel discouraged, helping them understand that learning English opens up opportunities.
    """

    if progress:
        guidelines_prompt += f"""
    **Progress-Based Adjustments:**
    - Tailor difficulty based on current progress levels
    - Focus on vocabulary ({progress.get('vocabulary', 'N/A')}%) with advanced words
    - Emphasize conversation practice ({progress.get('conversation', 'N/A')}%) with extra speaking exercises
    """

    # Conversation history formatting
    history_prompt = "\n**Previous Conversation:**\n"
    for msg in chat_history[-5:]:  # Only include last 5 messages for context
        history_prompt += f"{msg['role']}: {msg['content']}\n"

    # Combine all prompts
    final_prompt = f"""
    {system_prompt}
    
    {profile_prompt}
    
    {guidelines_prompt}
    
    {history_prompt}
    
    Student: {user_input}
    
    Tutor (Remember to be encouraging, clear, and culturally relevant. Use emojis and friendly language):
    """

    # Call Gemini model
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(final_prompt)

    # Extract and return response text
    response_text = response.text if response else "I apologize, but I couldn't process that request. Could you please try again? 🤔"
    
    return response_text

