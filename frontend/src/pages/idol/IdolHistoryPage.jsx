import React, { useState } from 'react'
import IdolHistory from '../../components/historical/IdolHistory'
import LearnerNavbar from '../../components/learner/NavBar'
import SideBar from '../../components/SideBar'
import { PremiumProvider } from '../../components/contexts/PremiumContext'

const IdolHistoryPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <PremiumProvider>
        <div className='bg-white h-screen flex flex-col'>
            <div className='z-50'> {/* Added z-50 for Navbar */}
                {/* <NavBar /> */}
                <LearnerNavbar />
            </div>
            <div className='flex-1 flex'>
                <SideBar open={sidebarOpen} setOpen={setSidebarOpen} />
                <div className={`flex-1 h-screen overflow-hidden ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'} duration-300`}>
                    <IdolHistory />
                </div>
            </div>
        </div>
    </PremiumProvider>
  )
}

export default IdolHistoryPage