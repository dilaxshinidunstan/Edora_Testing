import React from 'react'
import Quiz from '../../quiz/Quiz'

const GuestQuiz = ({ difficulty, category }) => {
  return (
    <div>
        <Quiz difficulty={difficulty} category={category} isGuest={true} />
    </div>
  )
}

export default GuestQuiz