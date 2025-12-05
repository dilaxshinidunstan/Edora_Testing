import React, { useState, useEffect } from 'react'
import { MdCheckCircle } from 'react-icons/md'

const SuccessMessage = ({ message, isPersistent=false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const duration = 5000;

  useEffect(() => {
    // Reset visibility when message changes
    setIsVisible(true)

    if (!isPersistent) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      // Cleanup timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [isPersistent, message]); // Added message as dependency to reset timer when message changes

  if (!isVisible) return null;

  return (
    <div className='bg-primary pt-1 rounded-lg fixed bottom-0 right-2 transform -translate-y-1/2 z-50'>
      <div className='flex items-center gap-2 right-2 p-4 bg-white text-xs sm:text-sm text-primary max-w-md text-center'>
        <MdCheckCircle size={24} />
        {message}
      </div>
    </div>
  )
}

export default SuccessMessage