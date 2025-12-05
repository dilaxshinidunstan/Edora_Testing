import React, { useState } from 'react'
import GuestSidebar from '../../../components/guest user/GuestSidebar'
import GuestUserNavbar from '../../../components/guest user/GuestUserNavbar'
import QuizReview from '../../../components/quiz/QuizReview'
import { useLocation, useNavigate } from 'react-router-dom'

const GuestQuizResultPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get quiz data from navigation state
  const { questions, userAnswers, score } = location.state || {};

  // Redirect to intro if no quiz data
  React.useEffect(() => {
    if (!questions || !userAnswers || score === undefined) {
      navigate('/guest/quiz/intro', { replace: true });
    }
  }, [questions, userAnswers, score, navigate]);

  if (!questions || !userAnswers || score === undefined) {
    return null; // Will redirect
  }

  return (
    <div className='flex flex-col overflow-hidden h-screen'>
      <div className='z-50'>
        <GuestUserNavbar />
      </div>

      <div className='flex'>
        <GuestSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 mt-16 p-2 h-screen overflow-hidden ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'} duration-300`}>
          <GuestQuizReview 
            questions={questions} 
            userAnswers={userAnswers} 
            score={score} 
          />
        </div>   
      </div>
   </div>
  )
}

// Custom QuizReview component for guest users
const GuestQuizReview = ({ questions, userAnswers, score }) => {
  const navigate = useNavigate();

  const handleFinishReview = (e) => {
    e.preventDefault();
    navigate('/festival/start');
  };

  return (
    <div className='max-w-4xl h-screen p-2 mx-auto bg-white'>
      <div className='px-4 h-[550px] overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white'>
        <h2 className="text-2xl font-bold text-dark_gray mb-4">Quiz Review</h2>   
        {score !== undefined && <p className='text-dark_gray mb-4'>Score : <span className='text-primary'>{score}%</span></p>}
        
        {questions && questions.map((question, index) => (
          <div key={index} className={`flex flex-col gap-4 mb-4 p-4 rounded-lg ${userAnswers[question.id] !== question.answer ? 'bg-light_red' : 'bg-white border border-primary'} text-xs sm:text-sm`}>
            <h3 className='text-dark_gray'>{question.question}</h3>
            <div className='list-inside pl-5'>
              <ol className='list-decimal'>
                {question.options.map((option, idx) => (
                  <li key={idx} className={`${option === userAnswers[question.id] ? 'text-bright_blue' : 'text-dark_gray'}`}>{option}</li>
                ))}
              </ol>
            </div>
            <p className='text-primary'>Correct Answer : <span className='font-semibold'>{question.answer}</span></p>
            <p className='text-dark_gray italic'>Explanation: {question.explanation}</p>
          </div>
        ))}
      </div>
      <div className='flex justify-center'>
        <button 
          className='px-6 py-2 bg-primary text-light_gray rounded-full hover:bg-strong_cyan transition duration-300'
          onClick={handleFinishReview}
        >
          Finish Review
        </button>
      </div>    
    </div>
  );
};

export default GuestQuizResultPage
