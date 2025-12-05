import React from 'react'

const Heading = ({ heading, id }) => {
  return (
    <div className='p-2 max-w-xl mb-8'>
      <h2 id={id} className='text-3xl text-dark_gray font-semibold my-4'>
       {heading} 
      </h2>
    </div>
      )
}

export default Heading
