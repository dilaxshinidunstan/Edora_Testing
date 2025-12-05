import React, { useState } from 'react'
import { GrResources } from "react-icons/gr";
import { MdOutlineQuiz, MdOutlineChatBubbleOutline } from "react-icons/md";
import { FaUserAstronaut, FaLock } from "react-icons/fa";
import { IoGameControllerOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { TbLayoutSidebarFilled } from "react-icons/tb";
import SignupPrompt from './SignupPrompt';


const GuestSidebar = ({ open, setOpen }) => {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const menus = [
    { name: "General English", key: 'chatbot', icon: MdOutlineChatBubbleOutline, path: '/guest/generalchat' },
    { name: "Past Papers", key: 'pastpapers', icon: GrResources, path: '/guest/pastpaper/card' },
    { name: "Quiz", key: 'quiz', icon: MdOutlineQuiz, path: '/guest/quiz/intro' },
    { name: "Play", key: 'play', icon: IoGameControllerOutline, path: '/guest/game/card' },
    { name: "Idol Talks", key: 'historicalCharacter', icon: FaUserAstronaut, restricted: true },
  ]

  const navigate = useNavigate()

  const handleSidebarClick = () => {
    setOpen(!open)
  }

  const handleMenuClick = (menu) => {
    if (menu.restricted) {
      setShowSignupPrompt(true);
      return;
    }        
    navigate(menu.path);
    setSelectedMenu(menu.key);
  }

  return (
    <div>
      {/* Menu Button - Always Visible */}
      <div className='fixed top-[64px] left-0 py-2 px-2 z-40 '>
      <div className={`py-2 px-2 hover:text-primary text-dark_gray`}>
          <TbLayoutSidebarFilled 
              size={24} 
              className='cursor-pointer block' 
              onClick={handleSidebarClick} 
          />
      </div>
      </div>

      {/* Desktop Sidebar */}
      <div className='fixed h-full top-[61.2px] left-0 z-40 hidden sm:block'>
          <div className={`bg-secondary h-full ${open ? "w-80" : "w-16"} duration-500 text-dark_gray px-4 absolute top-0 left-0 ${
                  open ? 'shadow-lg' : ''
              }`}>
              <div className='py-5 flex justify-end'>
                  <TbLayoutSidebarFilled 
                      size={24} 
                      className='cursor-pointer block' 
                      onClick={handleSidebarClick} 
                  />
              </div>
              <div className='mt-4 flex flex-col gap-4 relative z-40'>
                {
                  menus.map((menu, i) => (
                    <div key={i}>
                      <div
                        onClick={() => handleMenuClick(menu)}
                        className={`group flex items-center gap-3.5 text-sm p-2 hover:bg-soft_cyan rounded-md cursor-pointer ${selectedMenu === menu.key ? 'bg-soft_cyan' : ''}`}
                      >           
                        <div className='font-semibold'>
                            {React.createElement(menu.icon, { size: '18' })}
                            {menu.restricted && !open && <FaLock size={10} className="text-yellow-400 ml-2" />}
                        </div>
                        <h2 className={`font-semibold whitespace-pre flex items-center gap-2 ${!open && 'opacity-0 overflow-hidden'}`}>
                          {menu.name}
                          
                          {menu.restricted && open && <FaLock size={10} className="text-yellow-400" />}
                        </h2>
                        <h2
                            className={`${open && 'hidden'} absolute whitespace-pre left-48 bg-gray-800 text-xs text-secondary rounded-md px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit z-60`}
                        >
                          {menu.name}
                        </h2>
                      </div>
                    </div>
                  ))
                }
              </div>
          </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 sm:hidden ${open ? 'block' : 'hidden'}`}>
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 max-w-80 overflow-y-auto overflow-x-hidden w-full bg-secondary h-full shadow-lg transform transition-transform duration-300">
              <div className='p-4 flex justify-end items-center border-b border-gray-200'>
                  <TbLayoutSidebarFilled 
                      size={24} 
                      className='cursor-pointer' 
                      onClick={() => setOpen(false)} 
                  />
              </div>
              <div className='mt-4 flex flex-col gap-4 p-4'>
                  {menus.map((menu, i) => (
                      <div key={i}>
                          <div
                              onClick={() => handleMenuClick(menu)}
                              className={`group flex items-center gap-3.5 text-sm p-2 hover:bg-soft_cyan rounded-md cursor-pointer ${selectedMenu === menu.key ? 'bg-soft_cyan' : ''}`}
                          >
                              <div className='font-semibold'>
                                  {React.createElement(menu.icon, { size: '18' })}
                              </div>
                              <h2 className={`font-semibold whitespace-pre ${!open && 'opacity-0 overflow-hidden'}`}>{menu.name}</h2>
                              <h2
                                  className={`${open && 'hidden'} absolute whitespace-pre left-48 bg-gray-800 text-xs text-secondary rounded-md px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit z-60`}
                              >
                                  {menu.name}
                                  
                              </h2>
                              {menu.restricted && open && <FaLock size={10} className="text-yellow-400" />}
                          </div>
                      </div>
                  ))}
              </div>
          </div> 
      </div>

      <SignupPrompt show={showSignupPrompt} onClose={() => setShowSignupPrompt(false)} />
    </div>
  )
}

export default GuestSidebar