from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import QuizSerializer, QuestionsSerializer
from rest_framework.permissions import IsAuthenticated
import openai
from django.conf import settings
import json
from .models import Quiz, Questions
from django.shortcuts import get_object_or_404


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_quiz(request):
    category = request.data.get('category', '')
    difficulty = request.data.get('difficulty', '')
    learner = request.user
    
    if learner.is_anonymous:
        return Response({"error": "User must be authenticated"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate questions using OpenAI API 
    openai.api_key = settings.OPENAI_API_KEY
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


        input_tokens = response['usage']['prompt_tokens']
        output_tokens = response['usage']['completion_tokens']
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

        
    except (json.JSONDecodeError, KeyError) as e:
        return Response({"error": "Failed to generate or parse questions."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save the quiz data
    quiz_data = {
        'learner': learner.id,
        'title': f"{category}-{difficulty}",
        'input_tokens': input_tokens,
        'output_tokens': output_tokens
    }
    quiz_serializer = QuizSerializer(data=quiz_data)
    
    if quiz_serializer.is_valid():
        quiz = quiz_serializer.save()
        
        questions_data = []
        
        # Save each question
        for index, question_data in enumerate(questions):
            print(f"Processing Question {index + 1}: {question_data}")
            question_serializer = QuestionsSerializer(data={
                'quiz': quiz.id,
                'question': question_data['question'],
                'options': question_data['options'],
                'correct_answer': question_data['answer'],
                'explanation': question_data['explanation']
            })
            
            if question_serializer.is_valid():
                question_serializer.save()
                # Append the serialized question data
                questions_data.append(question_serializer.data)
            else:
                quiz.delete()  # Rollback the quiz if any question is invalid
                return Response(question_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        response_data = {
            'quiz': quiz_serializer.data,
            'questions': questions_data
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    else:
        return Response(quiz_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    learner = request.user
    
    if learner.is_anonymous:
        return Response({"error": "User must be authenticated"}, status=status.HTTP_400_BAD_REQUEST)
    
    quiz = get_object_or_404(Quiz, id=quiz_id, learner=learner)
    
    # Get user answers from the request
    user_answers_data = request.data.get('answers', [])
    
    correct_answers = 0
    
    response_data = []
    
    for answer_data in user_answers_data:
        question_id = answer_data.get('question_id')
        user_answer = answer_data.get('user_answer')
        
        # Get the corresponding question
        question = get_object_or_404(Questions, id=question_id, quiz=quiz)
        
        # Update the question with the user's answer
        question.user_answer = user_answer
        question.save()
        
        # Compare user answer with the correct answer
        if user_answer.lower() == question.correct_answer.lower():
            correct_answers += 1
            
        response_data.append({
            'question': question.question,
            'user_answer': user_answer,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
            'options': question.options
        })
        
    # Calculate the score
    total_questions = quiz.questions.count()
    score = (correct_answers / total_questions) * 100
    
    # Update the score with the score
    quiz.score = score
    quiz.save()
    
    quiz_serializer = QuizSerializer(quiz)
    
    return Response({
        'quiz': quiz_serializer.data,
        'questions': response_data,
        'message': 'Quiz submitted successfully'
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])    
def get_quiz_history(request):
    learner = request.user
    
    if learner.is_anonymous:
        return Response({ "error": "User must be authenticated" }, status=status.HTTP_400_BAD_REQUEST)
    
    quizzes = Quiz.objects.filter(learner=learner, is_deleted=False).order_by('-id')
    
    serializer = QuizSerializer(quizzes, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_questions(request, quiz_id):
    learner = request.user
    
    if learner.is_anonymous:
        return Response({ "error": "User must be authenticated" }, status=status.HTTP_400_BAD_REQUEST)
    
    quiz = get_object_or_404(Quiz, id=quiz_id, learner=learner)
    
    questions = quiz.questions.all()
    
    serializer = QuestionsSerializer(questions, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def soft_delete_quiz(request, quiz_id):
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id, learner=request.user)
        quiz.is_deleted = True
        quiz.save()
        
        return Response({'success': 'Quiz marked as deleted successfully.', 'quiz_id': quiz.id}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
