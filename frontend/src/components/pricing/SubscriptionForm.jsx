import React, { useState } from 'react';
import axios from 'axios';
import BotLogo from '../../assets/images/bot.png'
import SubmitButton from '../buttons/SubmitButton'
import ErrorMessage from '../messages/ErrorMessage';
import SuccessMessage from '../messages/SuccessMessage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const SubscriptionForm = () => {
  // const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [subscriptionType, setSubscriptionType] = useState(''); // New state for subscription type
  const [paymentSlip, setPaymentSlip] = useState(''); // New state for payment slip
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');

    try {
      const response = await axios.post(`${apiBaseUrl}/sms/save-phone-number/`, 
          { phone_number: phoneNumber },
          {
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('access')}`,
                  'Content-Type': 'application/json'
              }
          }
      );
      setSuccessMessage(response.data.message);
      console.log(response.data.message)
    } catch (err) {
      if (err.response) {
          setError(err.response.data.message);
          console.log(err)
      } else {
          setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className='flex flex-col gap-4 max-w-4xl p-4 bg-white rounded-lg shadow-md'>
        <h2 className="text-xl font-semibold text-[#00A693] text-center">
          Subscribe to Edora Premium
        </h2>
        
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">Username</label>
          <input 
            onChange={(e) => setUsername(e.target.value)} 
            type="text" 
            id="username" 
            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-md block w-full p-2 focus:outline-none focus:ring-1 focus:ring-[#00A693] focus:border-[#00A693] transition-all" 
            placeholder="Enter your username"
          />

          <label htmlFor="subscriptionType" className="block mb-1 text-sm font-medium text-gray-700">Subscription Type</label>
          <select 
            onChange={(e) => setSubscriptionType(e.target.value)} 
            id="subscriptionType" 
            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-md block w-full p-2 focus:outline-none focus:ring-1 focus:ring-[#00A693] focus:border-[#00A693] transition-all"
          >
            <option value="">Select subscription type</option>
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>

          <label htmlFor="paymentSlip" className="block mb-1 text-sm font-medium text-gray-700">Payment Slip</label>
          <input 
            onChange={(e) => setPaymentSlip(e.target.value)} 
            type="file" 
            id="paymentSlip" 
            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-md block w-full p-2 focus:outline-none focus:ring-1 focus:ring-[#00A693] focus:border-[#00A693] transition-all" 
          />

          <p className="mt-1 text-xs text-gray-500">
            We'll never share your details. Read our 
            <a href="#" className="font-medium text-[#00A693] hover:text-[#008575] ml-1">
              Privacy Policy
            </a>
          </p>
          
          <button 
            type="submit" 
            className="mt-3 bg-[#00A693] text-white text-sm rounded-md p-2 hover:bg-[#008575] transition-all duration-200 ease-in-out"
          >
            Subscribe Now
          </button>
        </form>

        {
          successMessage && (
            <SuccessMessage message={successMessage} />
          )
        }
        {
          error && (
            <ErrorMessage message={error} isPersistent={false} onReload={true} />
          )
        }
    </div>
  )
}

export default SubscriptionForm