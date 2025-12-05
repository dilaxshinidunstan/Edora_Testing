import React, { useState } from 'react'
import GuestSidebar from '../../components/guest user/GuestSidebar'
import GuestGeneralChat from '../../components/guest user/GuestGeneralChat' 
import GuestUserNavbar from '../../components/guest user/GuestUserNavbar'

const GuestGeneralchatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className='flex flex-col'>
      <GuestUserNavbar />

      <div className='flex-1 flex'>
        <GuestSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 h-screen ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'}`}>
          <GuestGeneralChat />
        </div>   
      </div>
    </div>

  )
}

export default GuestGeneralchatPage