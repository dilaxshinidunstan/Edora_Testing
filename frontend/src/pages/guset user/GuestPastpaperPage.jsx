import React, {useState} from 'react'
import GuestSidebar from '../../components/guest user/GuestSidebar'
import GuestUserNavbar from '../../components/guest user/GuestUserNavbar'
import GuestPastpaper from '../../components/guest user/GuestPastpaper'
import { useParams } from 'react-router-dom'

const GuestPastpaperPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { year } = useParams();
  const { test } = useParams();

  return (
    <div className='flex flex-col'>
      <GuestUserNavbar />
      <div className='flex'>
        <GuestSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 h-screen ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'}`}>
          <GuestPastpaper selected_year={year} selected_test={test} />
        </div>
      </div>
    </div>
  )
}

export default GuestPastpaperPage