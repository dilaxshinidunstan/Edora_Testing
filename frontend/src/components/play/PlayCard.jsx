import React from 'react'
import Wordbuzz from '../../assets/images/games/wordbuzz.webp'
import Heading2 from '../Heading2'

const PlayCard = ({ className, isGuest=false }) => {
  return (
    <div className='flex flex-col sm:mt-16 mt-24 mb-2 p-4 lg:justify-between lg:gap-6 justify-center items-center lg:max-w-4xl mx-auto'>
        <Heading2 text="Games" />
        <div className={`max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
            <a href="#">
                <img className="rounded-t-lg" src={Wordbuzz} alt="" />
            </a>
            <div className="flex justify-between p-5">
                <a href="#">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Word Buzz</h5>
                </a>
                {/* <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">English for grade 10 and O/L students</p> */}
                <a href={isGuest ? "/guest/game" : "/wordbuzz"} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-light_gray bg-primary rounded-full hover:bg-secondary hover:text-dark_gray">
                    Play now
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>


  )
}

export default PlayCard