import React from 'react'
import { HiMiniPencilSquare } from "react-icons/hi2"; 

const NewChatButton = ( {handleNewChat, disabled} ) => {
  return (
    <div className='relative group'>
        <button 
            onClick={handleNewChat} 
            className={`flex items-center p-2 ${
                disabled 
                    ? 'text-gray-400 cursor-not-allowed hover:bg-transparent' 
                    : 'text-primary hover:bg-secondary hover:rounded-full'
            }`}
            aria-label='New Chat'
            disabled={disabled}
        >
            <HiMiniPencilSquare size={20} />
        </button>
        <span className="absolute -left-4 top-full mt-2 w-max bg-gray-800 text-secondary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            New Chat
        </span>
    </div>
  )
}

export default NewChatButton