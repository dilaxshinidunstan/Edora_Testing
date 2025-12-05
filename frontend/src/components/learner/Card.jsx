import React from 'react'

const Card = ({ icon, heading, subHeading, description, href }) => {
  return (
    <div className='max-w-sm h-full rounded-lg pl-1 bg-primary'>   
      <div className="max-w-sm h-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-dark_gray mb-3">
          {icon}        
        </div>
        <a href={`${href}`}>
          <h5 className="mb-2 text-lg font-semibold tracking-tight text-dark_gray">{heading}</h5>
        </a>
        <p className='mb-2 text-md'>
          {subHeading}
        </p>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <a href={`${href}`} className="inline-flex font-medium items-center text-blue-600 hover:underline">
          Try now
          <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"/>
          </svg>
        </a>
      </div>
    </div>

  )
}

export default Card