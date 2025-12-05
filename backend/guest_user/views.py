from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import openai
import json
import re
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from quiz.models import Quiz, Questions
from quiz.serializers import QuizSerializer, QuestionsSerializer
from learner.models import Learner
from django.shortcuts import get_object_or_404

# Set the OpenAI API key
openai.api_key = settings.OPENAI_API_KEY

@api_view(['POST'])
def general_chat_view(request):
    try:
        data = json.loads(request.body)
        user_input = data.get('user_input', '')
        
        # Build the message history to provide context
        messages = [
            {"role": "system", "content": (
                "You are Edora, an AI-powered English tutor designed to help G.C.E. O/L students in Sri Lanka improve their grammar and conversational English. Your tasks include:\n\n"
                "1. Grammar Assistance:\n"
                "   - Explain grammar concepts step-by-step, breaking down each rule into manageable parts.\n"
                "   - Provide examples for practice and guide students to correct their errors without directly giving answers.\n"
                "   - Use precise linking words that best fit the context of a sentence.\n\n"
                "2. Conversational Skills:\n"
                "   - Engage in real-world dialogues to help students practice spoken English and build confidence.\n"
                "   - Offer feedback on sentence structure, vocabulary, and pronunciation.\n\n"
                "3. Interactive Learning:\n"
                "   - Provide quizzes, 'find the odd one out,' and fill-in-the-blank exercises.\n"
                "   - Use contexts familiar to Sri Lankan students.\n\n"
                "4. Supportive Guidance:\n"
                "   - Begin with relevant theory or context for questions.\n"
                "   - Offer small hints to encourage independent thinking.\n"
                "   - Provide exact answers with explanations when needed.\n\n"
                "5. Self-Study Support:\n"
                "   - Guide students through grammar, vocabulary, and conversation practice.\n"
                "   - Break down complex concepts into simpler parts.\n\n"
                "6. Additional Features:\n"
                "   - Past Paper Practice: When students ask about past papers, respond with:\n"
                "     'Practice past paper questions easily here: [Practice Past Papers](https://edora.lk/guest/pastpaper/card) 😊'\n"
                "   - Abdul Kalam Chat: When students want to chat with Abdul Kalam, respond with:\n"
                "     'Chat with Abdul Kalam here: [Chat with Abdul Kalam](https://edora.lk/idol/card) 😊'\n\n"
                "7. Conversation Management:\n"
                "   - For off-topic discussions: Politely redirect to English learning while acknowledging the topic.\n"
                "   - For sensitive issues: Show empathy while guiding back to learning activities.\n"
                "   - For demotivation: Offer encouragement and highlight the benefits of learning English.\n\n"
                "Remember to:\n"
                "- Use simple, clear language suitable for O/L students\n"
                "- Highlight important points\n"
                "- Provide specific, actionable feedback\n"
                "- Use examples relevant to Sri Lankan culture\n"
                "- Include appropriate emojis 😊✨\n"
                "- Maintain a friendly, patient tone\n"
                "- Never engage in political discussions or sensitive personal issues\n\n"
                "Example Responses:\n"
                "1. Off-topic: 'That's an interesting topic, but let's focus on improving your English! How about we practice [relevant topic]? 😊'\n"
                "2. Sensitive issues: 'I understand this is important to you. Learning English can help you express yourself better. Shall we try some exercises? 💙'\n"
                "3. Demotivation: 'Learning takes time, but you're making progress! Let's break this down into smaller, manageable steps. 🌟'\n\n"
                "Example for linking word exercises:\n"
                "Fill in the blanks with appropriate linking words:\n\n"
                "I studied for the test. _____, I still didn't get a good grade.\n"
                "Many festivals are celebrated in Sri Lanka, _____ Sinhala and Tamil New Year.\n\n"
                "Many tourists visit Sri Lanka, _____ the beautiful beaches and rich culture."
                "Response Style:\n"
                "If the student answers, first provide feedback on their answers, explaining why each linking word is correct or incorrect. Encourage them to think about the context and the relationship between ideas.\n"
                "If needed, provide alternative linking words to show variety in sentence structure.\n"
                "Always include a brief explanation of the corrected sentences to help the student understand why each linking word is the most appropriate for the context.\n"
                "Offer a final reattempt of the exercise with the corrected linking words to reinforce learning.\n\n"
                "For Example:\n\n"
                "User answers: but, but, such as\n\n"
                "System's feedback:\n\n"
                "Nice try! Let's take a look at your answers one by one and see how we can improve them! 😊\n\n"
                "I studied for the test. _____, I still didn't get a good grade.\n"
                "Your answer: but\n"
                "Explanation: This works because it shows contrast, but for a smoother flow, 'however' or 'yet' would be even better.\n"
                "Corrected: I studied for the test; however, I still didn't get a good grade.\n\n"
                "Many festivals are celebrated in Sri Lanka, _____ Sinhala and Tamil New Year.\n"
                "Your answer: but\n"
                "Explanation: In this case, we need to give an example of the festivals. 'Such as' or 'for example' fits better.\n"
                "Corrected: Many festivals are celebrated in Sri Lanka, such as Sinhala and Tamil New Year.\n\n"
                "Many tourists visit Sri Lanka, _____ the beautiful beaches and rich culture."
                "Your answer: such as\n"
                "Explanation: 'Such as' is used to give examples, but in this case, you're trying to explain why tourists visit Sri Lanka, not providing examples of what they visit. So, 'because of' or 'due to' would be more appropriate in this sentence to show the reason.\n"
                "Corrected: Many tourists visit Sri Lanka, because of the beautiful beaches and rich culture."
                "Would you like to try these sentences again with the corrected linking words? Keep practicing! Every mistake is a step towards improvement! 🌟\n"
            )},
        ]
        
        messages.append({"role": "user", "content": user_input})
        
        # Use OpenAI API to get assistant's response
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
        )
        
        assistant_response = response['choices'][0]['message']['content'].strip()
        
        # Add highlights and emojis to the response
        assistant_response = format_response(assistant_response)
        
        return JsonResponse({
            'response': assistant_response 
        }, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def format_response(response):
    # Convert Markdown headers to HTML
    response = re.sub(r'^###\s+(.*?)$', r'<h3>\1</h3>', response, flags=re.MULTILINE)
    response = re.sub(r'^##\s+(.*?)$', r'<h2>\1</h2>', response, flags=re.MULTILINE)
    response = re.sub(r'^#\s+(.*?)$', r'<h1>\1</h1>', response, flags=re.MULTILINE)

    # Bold text
    response = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', response)
    
    # Links with styling
    response = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" style="color: #007bff; text-decoration: none;">\1</a>', response)
    
    # Bullet points
    response = re.sub(r'\n- (.*?)(?=\n|$)', r'<li>\1</li>', response)
    response = re.sub(r'<li>(.*?)</li>(?=<li>)', r'</ul>\n<li>\1</li>', response)
    response = re.sub(r'<li>(.*?)</li>', r'<ul>\n<li>\1</li></ul>', response)

    # Remove extra spaces and newlines
    response = re.sub(r'\s*<li>', '<li>', response)
    response = re.sub(r'</li>\s*', '</li>', response)
    response = re.sub(r'\s*</?[uo]l>\s*', lambda m: m.group().strip(), response)
    
    return response

@api_view(['POST'])
def generate_quiz_view(request):
    category = request.data.get('category', '')
    difficulty = request.data.get('difficulty', '')
    
    prompt = (
        f"Generate 5 multiple-choice English grammar questions for Grade 11 Sri Lankan students. The category is '{category}', and the difficulty is '{difficulty}'. "
        f"Each question should test grammar, usage, or vocabulary suitable for intermediate learners. Provide exactly 4 answer options for each question, "
        f"with one of the options being the correct answer, "
        f"and ensure that the correct answer is one of the provided options. "
        f"The correct answer must follow proper English grammar rules. Specifically, for articles, ensure 'an' is used before words starting with vowel sounds (e.g., 'engineer', 'apple'), and 'a' before consonant sounds. "
        f"The correct answer must follow proper English grammar rules, and the explanation must accurately explain why the selected answer is correct. "
        f"Format the output as a JSON array where each object has the fields: "
        f"'question' (the question as a string), 'options' (an array of 4 strings, each representing an answer choice), 'answer' (the correct option as a string), "
        f"and 'explanation' (a clear and concise explanation of the correct answer). "
        f"Double-check the consistency between the correct answer and its explanation, ensuring no contradictions."     
    )
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            # response_format={
            #     "type": "json",
            # },
            # max_tokens=800,
            n=1,
            stop=None,
        )
        
        # Check if the response is valid
        if not response.choices:
            return Response({"error": "No choices returned from OpenAI."}, status=status.HTTP_400_BAD_REQUEST)
        
        response_text = response.choices[0].message['content'].strip()  # Access the content correctly
        
        response_text = response_text.replace('```', '').replace('json', '').strip()
        
        print("response_text: ", response_text)

        try:
            questions = json.loads(response_text)
            # Ensure options are correctly formatted as lists of strings
            for question in questions:
                question['options'] = [option.strip() for option in question['options']]
            print(questions)
        except json.JSONDecodeError:
            return Response({"error": "Failed to parse questions. Invalid JSON format."}, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse({
            'quiz': response_text
        }, safe=False)

    except (json.JSONDecodeError, KeyError) as e:
        return Response({"error": "Failed to generate or parse questions."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def guest_generate_quiz(request):
    category = request.data.get('category', '')
    difficulty = request.data.get('difficulty', '')

    if not getattr(settings, 'OPENAI_API_KEY', None):
        return Response({"error": "OPENAI_API_KEY is not configured on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    prompt = (
        f"Generate 5 multiple-choice English grammar questions for Grade 11 Sri Lankan students. The category is '{category}', and the difficulty is '{difficulty}'. "
        f"Each question should test grammar, usage, or vocabulary suitable for intermediate learners. "
        
        # f"For tense-related questions, strictly follow these rules:\n"
        # f"1. Past Perfect: Use 'had + past participle' for actions completed before another past action.\n"
        # f"   Example: 'They had never seen such a beautiful sunrise before their trip.'\n"
        
        # f"2. Present Simple: Use the base form of the verb (add 's' or 'es' for third person singular).\n"
        # f"   Example: 'She goes to school every day.' (Third person singular: 'goes')\n"
        
        # f"3. Present Perfect: Use 'has/have + past participle' for actions that occurred in the past but have relevance to the present.\n"
        # f"   Example: 'He has seen that movie before.'\n"
        
        # f"4. Past Simple: Use the past form of the verb for actions completed in the past.\n"
        # f"   Example: 'She watched the movie yesterday.'\n"
        
        # f"5. Future Simple: Use 'will + base form' for predictions or actions that will happen in the future.\n"
        # f"   Example: 'They will arrive tomorrow.'\n"
        
        # f"6. Present Continuous: Use 'is/are/am + present participle' for actions that are happening right now or around the present time.\n"
        # f"   Example: 'She is eating dinner right now.'\n"
        # f"   Example: 'We are flying to Paris next week.' (for planned events)\n"
        
        # f"Important:\n"
        # f"Present Continuous is used for arranged or scheduled events in the near future, while Simple Future (will + base form) is used for general predictions, decisions, or actions that aren't yet arranged. Be careful to distinguish between these uses.\n"

        f"For each question:\n"
        f"1. Ensure exactly 4 answer options\n"
        f"2. Only ONE option must be grammatically correct in the given context\n"
        f"3. Other options must be clearly incorrect based on tense rules\n"
        f"4. The explanation must cite the specific grammar rule being tested and reference the example pattern\n"
        
        f"Format the output as a JSON array where each object has:\n"
        f"'question': the question string\n"
        f"'options': array of 4 strings (answer choices)\n"
        f"'answer': the correct option string\n"
        f"'explanation': explanation citing the specific grammar rule used\n"
        
        f"Before finalizing each question:\n"
        f"1. Verify that only one option follows the correct tense rule\n"
        f"2. Confirm that other options violate the tense rules\n"
        f"3. Check that the explanation matches the grammar rule being tested\n"
        f"4. Ensure the question context clearly indicates which tense should be used"
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            n=1,
            stop=None,
        )

        if not response.choices:
            return Response({"error": "No choices returned from OpenAI."}, status=status.HTTP_400_BAD_REQUEST)

        response_text = response.choices[0].message['content'].strip()
        response_text = response_text.replace('```', '').replace('json', '').strip()

        try:
            questions = json.loads(response_text)
            for question in questions:
                question['options'] = [option.strip() for option in question['options']]
                # Add a unique ID for frontend tracking
                question['id'] = f"guest_{len(questions)}_{hash(question['question'])}"
        except json.JSONDecodeError:
            return Response({"error": "Failed to parse questions. Invalid JSON format."}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": f"Generation error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Return questions directly without storing in database
    return Response({
        'questions': questions
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def guest_submit_quiz(request):
    # Get questions and answers from request
    questions_data = request.data.get('questions', [])
    answers_data = request.data.get('answers', [])
    
    if not questions_data or not answers_data:
        return Response({"error": "Missing questions or answers data."}, status=status.HTTP_400_BAD_REQUEST)

    correct_answers = 0
    total_questions = len(questions_data)
    
    # Calculate score by comparing answers
    for answer_data in answers_data:
        question_id = answer_data.get('question_id')
        user_answer = answer_data.get('user_answer')
        
        # Find the corresponding question
        question = next((q for q in questions_data if q['id'] == question_id), None)
        if question and user_answer and question.get('answer'):
            if user_answer.lower() == question['answer'].lower():
                correct_answers += 1

    # Calculate percentage score
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

    return Response({
        'score': round(score, 2),
        'correct_answers': correct_answers,
        'total_questions': total_questions,
        'message': 'Quiz completed successfully'
    }, status=status.HTTP_200_OK)
