import React from 'react'
import { HiMiniSquaresPlus } from "react-icons/hi2"; 

const StartQuizButton = ( {handleStartQuiz} ) => {
  return (
    <div className='relative group'>
        <button onClick={handleStartQuiz} className='flex items-center text-primary hover:bg-secondary hover:rounded-full p-2' aria-label='New Chat'>
            <HiMiniSquaresPlus size={20} />
        </button>
        <span className="absolute -left-4 top-full mt-2 w-max bg-gray-800 text-secondary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Start Quiz
        </span>
    </div>
  )
}

export default StartQuizButton