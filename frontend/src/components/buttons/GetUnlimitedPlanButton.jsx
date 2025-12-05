import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiMiniBolt } from "react-icons/hi2";
import { usePremium } from '../contexts/PremiumContext';
import useFetchPremiumStatus from '../custom_hooks/useFetchPremiumStatus';
import ThinkingMessage from '../messages/thinkingMessage/ThinkingMessage';

const GetUnlimitedPlanButton = () => {
    const navigate = useNavigate()
    const { isPremium } = usePremium()
    const [ loading, setLoading ] = useState(true)

    useFetchPremiumStatus(setLoading)

    if (loading) {
      return (
        <div className='px-5 py-2.5'>
          <ThinkingMessage />
        </div>
      )
    }

    const handleOnclick = (e) => {
        e.preventDefault()
        navigate('/pricing')
    }
  return (
    <div>
        <button onClick={handleOnclick} type="button" className={`text-white hover:bg-white hover:text-primary font-medium rounded-3xl text-sm px-5 py-2.5 text-center inline-flex items-center me-2 ${isPremium ? 'hidden' : 'block'}`}>
            <HiMiniBolt className='mr-2 text-yellow-300' />
            Get Unlimited Plan
        </button>
        {
          isPremium && (
            <span className="block px-4 py-2 text-sm text-white font-semibold">
              Premium Learner
            </span>
          )
        }
    </div>
  )
}

export default GetUnlimitedPlanButton