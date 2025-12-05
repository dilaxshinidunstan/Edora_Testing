import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import LearnerNavbar from '../components/learner/NavBar'
import SideBar from '../components/SideBar'
import { useLocation } from 'react-router-dom'
import MCQGenerator from '../components/quiz/Quiz'
import { PremiumProvider } from '../components/contexts/PremiumContext'

const QuizContent = () => {
    const location = useLocation()

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { difficulty, category } = location.state || { difficulty: '', category: '' }
    return (
      <PremiumProvider>
        <div className='bg-white h-screen flex flex-col'>
          <div className='z-50'>
            {/* <NavBar /> */}
            <LearnerNavbar />
          </div>
          <div className='flex-1 flex overflow-hidden'>
            <SideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className={`flex-1 overflow-auto ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'} duration-300`}>
            <MCQGenerator difficulty={difficulty} category={category}  />
            </div>
          </div>
        </div>
      </PremiumProvider>
    )
}

export default QuizContent