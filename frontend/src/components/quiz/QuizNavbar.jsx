import React from 'react'
import HistotyButton from '../buttons/HistotyButton'
import StartQuizButton from '../buttons/StartQuizButton'
import { useNavigate } from 'react-router-dom'

const QuizNavbar = () => {

    const navigate = useNavigate()

    const handleHistory = (e) => {
        e.preventDefault()
        navigate('/quiz/history/table')
    }

    const handleStartQuiz = (e) => {
        e.preventDefault()
        navigate('/quiz/start')
    }
  return (
    <div className='flex justify-end mt-16'>
        <StartQuizButton handleStartQuiz={handleStartQuiz} />
        <HistotyButton onClick={handleHistory} label="Quiz History" />
    </div>
  )
}

export default QuizNavbar