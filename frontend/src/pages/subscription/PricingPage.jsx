import React from 'react'
import PricingCard from '../../components/pricing/PricingCard'
import NavBar from '../../components/learner/NavBar'
import Footer from '../../components/landing page/Footer'

const PricingPage = () => {
  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen p-4">
          <div className="flex-grow">
            <PricingCard />
          </div>
          
      </div>
      <Footer />
    </>
  )
}

export default PricingPage