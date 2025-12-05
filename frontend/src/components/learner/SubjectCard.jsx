import React from 'react'
import English from '../../assets/images/learner/english.webp'
import Heading from './Heading'

const SubjectCard = ({ className }) => {
  return (
    <div className='flex flex-col mb-2 p-4 lg:flex-row lg:justify-between lg:gap-6 justify-center items-center lg:max-w-4xl mx-auto'>
        <Heading id="subjects" heading="Subjects" />
        <div className={`max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg ${className} order-last lg:order-first`}>
            <a href="#">
                <img className="rounded-t-lg" src={English} alt="" />
            </a>
            <div className="p-5">
                <a href="#">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">English</h5>
                </a>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">English for grade 10 and O/L students</p>
                <a href="/generalchat" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-light_gray bg-primary rounded-full hover:bg-secondary hover:text-dark_gray">
                    Try now
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>


  )
}

export default SubjectCard