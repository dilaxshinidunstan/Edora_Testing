import React, { useState, useEffect, useCallback } from 'react'
import Table from '../Table'
import axios from 'axios'
import ThinkingMessage from '../messages/thinkingMessage/ThinkingMessage'
import DeleteButton from '../buttons/DeleteButton'
import ReviewButton from '../buttons/ReviewButton'
import { useNavigate } from 'react-router-dom'
import Heading2 from '../Heading2'
import ErrorMessage from '../messages/ErrorMessage'
import SuccessMessage from '../messages/SuccessMessage'
import ConfimationModal from '../ConfimationModal'
import QuizNavbar from './QuizNavbar'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const QuizHistoryTable = () => {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [quizToDelete, setQuizToDelete] = useState(null)
    // const [quizId, setQuizId] = useState(null)

    const navigate = useNavigate()

    useEffect (() => {
        getQuizHistory()
    }, [])

    const getQuizHistory = async () => {
        setLoading(true)
        try{
            const response = await axios.get(`${apiBaseUrl}/quiz/get_quiz_history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            if (response.data) {
                setQuizzes(response.data)
            }
            else {
                console.log("Error fetching quiz history")
            }
        }
        catch (err) {
            setError('Failed to fetch quiz history')
            console.error(err)
        }
        finally {
            setLoading(false)
        }
    }

    const handleReview = (quizId, score) => {
        console.log(quizId)
        navigate(`/quiz/review/${quizId}`, { state: { score } })
    }

    const headers = ['ID','Title', 'Score', 'Edit']

    const data =  quizzes.map((quiz, index) => [
        index + 1,
        quiz.title,
        quiz.score !== null ? quiz.score: 'N/A',
        <div className='flex'>
            <ReviewButton onClick={() => handleReview(quiz.id, quiz.score)} />
            <DeleteButton onClick={() => handleDeleteButton(quiz.id)} />
        </div>
    ])

    const handleDeleteButton = async (quiz_id) => {
        setQuizToDelete(quiz_id)
        setShowDeleteConfirmation(true)
    }

    const softDeleteQuiz = useCallback (async (quizId) => {
        try {
            const response = await axios.delete(`${apiBaseUrl}/quiz/soft_delete_quiz/${quizId}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            })
            console.log(response.data.quiz_id)
            getQuizHistory()
            setSuccess('Successfully Deleted')
        }
        catch (error) {
            console.log('Error soft deleting quiz: ', error)
            setError('Something went wrong')
        }
    }, [getQuizHistory])

    const handleDeleteConfirm = async () => {
        try {
            if (quizToDelete) {
                await softDeleteQuiz(quizToDelete)
            }
            setQuizToDelete(null)
            setShowDeleteConfirmation(false)
        }
        catch (error) {
            console.error('Error deleting chat:', error);
        }
    }

  return (
    <div className='flex flex-col h-screen max-w-4xl p-2 mx-auto'>
        <QuizNavbar />
        <div className='pt-2'>
            {
                error && (
                    <ErrorMessage message={error} isPersistent={true} onReload={true} />
                )
            }
            {
                success && (
                    <SuccessMessage message={success} />
                )
            }
            <Heading2 text="Quiz History" />   
        </div>
        {
            loading && (
                <ThinkingMessage />
            )
        }
        <div className='px-4 h-[550px] overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white'>
            <Table headers={headers} data={data} />
        </div>
        {
            showDeleteConfirmation && (
                <ConfimationModal
                    isOpen={setShowDeleteConfirmation}
                    onClose = {() => setShowDeleteConfirmation(false)}
                    onConfirm = {handleDeleteConfirm}
                    message = "Are you sure you want to delete this chat session?"
                    confirmText = "yes"
                    cancelText = "No" 
                />
            )
        }

    </div>
  )
}

export default QuizHistoryTable