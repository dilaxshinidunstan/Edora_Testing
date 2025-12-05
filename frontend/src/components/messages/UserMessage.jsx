import React from 'react'

const UserMessage = ({ text, time, className }) => {
    const formatTime = (time) => {
        if (!(time instanceof Date)) return '';
        return time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      };
  return (
    <div className="flex justify-end mt-4 mb-6">
      <div className={`relative max-w-2xl p-3 rounded-2xl rounded-br-[10px] sm:text-sm text-sm leading-loose bg-primary text-white ${className}`}>
        <div className='whitespace-pre-line'>{text}</div>
        <div className="absolute bottom-0 right-1 h-2 w-5 bg-primary rotate-89 translate-x-2 translate-y-0 rounded-br-[16px]"></div>
        {/* <div className='mt-2'> */}
        {/* <p className="absolute bottom-1 right-2 text-[10px] text-gray-300">
          {formatTime(time)}
        </p> */}
        {/* </div> */}
      </div>
    </div>
  )
}

export default UserMessage