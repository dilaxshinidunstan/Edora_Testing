import React, { useState } from 'react'
import LearnerNavbar from '../../components/learner/NavBar'
import SideBar from '../../components/SideBar';
import { PremiumProvider } from '../../components/contexts/PremiumContext'
import PlayCard from '../../components/play/PlayCard'

const PlayCardPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
      <PremiumProvider>
        <div className='bg-white h-screen flex flex-col'>
          <div className='z-50'>
            <LearnerNavbar />
          </div>
          <div className='flex-1 flex overflow-hidden'>
            <SideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className={`flex-1 overflow-auto z-30 ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'} duration-300`}>
              <PlayCard />
            </div>  
          </div>  
        </div>
      </PremiumProvider>
      
    )
}

export default PlayCardPage