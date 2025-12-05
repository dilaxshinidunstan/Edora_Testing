import React, { useState } from 'react'
import GuestGame from '../../components/guest user/GuestGame'
import GuestSidebar from '../../components/guest user/GuestSidebar'
import GuestUserNavbar from '../../components/guest user/GuestUserNavbar'

const GuestGamePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex flex-col'>
      <GuestUserNavbar />

      <div className='flex-1 flex'>
        <GuestSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 h-screen ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'}`}>
          <GuestGame />
        </div>   
      </div>
    </div>
  )
}

export default GuestGamePage