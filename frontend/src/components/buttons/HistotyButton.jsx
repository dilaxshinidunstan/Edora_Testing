import React from 'react'
import { HiMiniClock } from "react-icons/hi2";

const HistotyButton = ({ onClick, label }) => {
  return (
    <div className='relative group'>
        <button onClick={onClick} className='flex items-center text-primary hover:bg-secondary hover:rounded-full p-2 hover:text-primary'>
            <HiMiniClock size={20} />
        </button>
        <span className="absolute -left-12 top-full mt-2 w-max bg-gray-800 text-secondary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {label}
        </span>
    </div>
  )
}

export default HistotyButton