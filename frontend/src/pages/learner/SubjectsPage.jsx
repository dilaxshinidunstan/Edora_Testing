import React from 'react'
import NavBar from '../../components/learner/NavBar'
import SubjectCard from '../../components/learner/SubjectCard'


const SubjectsPage = () => {
  return (
    <div>
        <NavBar />
        <div className='mt-16 flex bg-secondary lg:h-screen items-center'>
          <SubjectCard />
        </div>
        
    </div>
  )
}

export default SubjectsPage