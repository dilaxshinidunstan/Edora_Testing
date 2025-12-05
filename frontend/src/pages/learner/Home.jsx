import React from 'react'
import NavBar from '../../components/learner/NavBar'
import FeatureCard from '../../components/learner/FeatureCard'
import SubjectCard from '../../components/learner/SubjectCard'
import Footer from '../../components/landing page/Footer'

const Home = () => {
  return (
    <div className='h-screen flex flex-col'>
        <NavBar />
        <div className='flex flex-col mt-20 h-screen overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white'>
          <div>
            <FeatureCard />
          </div>
          <div className='flex bg-secondary items-center'>
            <SubjectCard />
          </div>
          <Footer />
        </div>
    </div>
  )
}

export default Home