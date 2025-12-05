import React, { useState } from 'react'
import { HiMiniClipboardDocument, HiMiniClipboardDocumentCheck } from "react-icons/hi2";
import '../styles/sparkle.css'

const CopyButton = ({ label, text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className='relative group'>
        <button className='flex items-center text-primary p-2 hover:text-dark_gray' onClick={handleCopy}>
            {isCopied ? <HiMiniClipboardDocumentCheck size={20} /> : <HiMiniClipboardDocument size={20} />}
        </button>
        <span className="absolute top-full mt-2 w-max bg-gray-800 text-secondary text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {label}
        </span>
    </div>
  )
}

export default CopyButton