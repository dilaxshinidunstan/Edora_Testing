import React from 'react'
import BotLogo from '../../assets/images/bot.png'
import ReadAloudButton from '../buttons/ReadAloudButton';
import CopyButton from '../buttons/CopyButton';

const BotMessage = ({ text, time, speaker, className }) => {
    const formatTime = (time) => {
        if (!(time instanceof Date)) return '';
        return time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      };
  return (
    <div className="flex flex-col  justify-start mt-4 mb-6">
      <div className={`relative max-w-2xl p-4 rounded-2xl  sm:text-sm text-sm leading-loose border bg-white text-dark_gray ${className}`}>
        <img src={speaker || BotLogo} alt="speaker" className="absolute left-0 rounded-full -top-4 h-7 w-7" />
        <div className='whitespace-pre-line space-y-4' dangerouslySetInnerHTML={{ __html: text }} />
          {/* <p className="absolute bottom-1 right-2 text-[10px] text-gray-500">
            {formatTime(time)}
          </p> */}
      </div>
      <div className='flex'>
        <ReadAloudButton label="Read Aloud" text={text} />
        <CopyButton label="Copy" text={text} />
      </div>
    </div>
   
  )
}

export default BotMessage