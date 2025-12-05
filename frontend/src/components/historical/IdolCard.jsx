import React from 'react'
import Heading2 from '../Heading2'
import Kalam from '../../assets/images/idols/kalam.jpeg'
import { useNavigate } from 'react-router-dom'
import { useHistoricalChat } from './HistoricalChatContext'; // Import new context

const IdolCard = () => {
  const navigate = useNavigate()
  const { messages, setMessages, chatId, setChatId } = useHistoricalChat()

  const handleChat = (e) => {
    e.preventDefault()
    localStorage.removeItem('historical_chat_id')
    setChatId(null)
    setMessages([])
    navigate('/legend')
  }
  
  return (
    <div className='flex flex-col items-center h-screen p-2 max-w-4xl mx-auto'>
      <div className='sm:mt-16 mt-24'>
        <Heading2 text="History’s Greatest Minds" />
      </div>
      
      <div className="max-w-sm bg-white border rounded-lg shadow-lg">
        <img className="rounded-t-lg" src={Kalam} alt="" />
         <div className="p-5">
              
              <h5 className="mb-2 text-lg font-semibold tracking-tight text-dark_gary">Dr.A.P.J.Abdul Kalam</h5>
              
              {/* <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p> */}
              <button onClick={handleChat} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-primary rounded-full hover:bg-secondary hover:text-dark_gray">
                  Let's chat
                  <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
              </button>
          </div>
      </div>
  
    </div>
  )
}

export default IdolCard