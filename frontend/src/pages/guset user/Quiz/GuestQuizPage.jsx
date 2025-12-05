import React, { useEffect, useState } from 'react'
import GuestSidebar from '../../../components/guest user/GuestSidebar'
import GuestUserNavbar from '../../../components/guest user/GuestUserNavbar'
import GuestQuiz from '../../../components/guest user/Quiz/GuestQuiz'
import { useLocation, useNavigate } from 'react-router-dom'

const GuestQuizPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const difficulty = location.state?.difficulty;
  const category = location.state?.category;

  useEffect(() => {
    if (!difficulty || !category) {
      navigate('/guest/quiz/intro', { replace: true });
    }
  }, [difficulty, category, navigate]);

  return (
    <div className='flex flex-col'>
      <GuestUserNavbar />

      <div className='flex-1 flex'>
        <GuestSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 h-screen ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'}`}>
          {difficulty && category && (
            <GuestQuiz difficulty={difficulty} category={category} />
          )}
        </div>   
      </div>
   </div>
  )
}

export default GuestQuizPage