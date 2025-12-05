import React, { useState } from 'react'
import GuestUserNavbar from '../../../components/guest user/GuestUserNavbar'
import GuestQuizIntro from '../../../components/guest user/Quiz/GuestQuizIntro'
import GuestSidebar from '../../../components/guest user/GuestSidebar'

const GuestQuizIntroPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleStartQuiz = () => {
    console.log('Start Quiz');
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='z-50'>
        <GuestUserNavbar />
      </div>

      <div className='flex-1 flex'>
        <GuestSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 h-screen ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'}`}>
          <GuestQuizIntro onStartQuiz={handleStartQuiz} />
        </div>   
      </div>
   </div>
  )
}

export default GuestQuizIntroPage