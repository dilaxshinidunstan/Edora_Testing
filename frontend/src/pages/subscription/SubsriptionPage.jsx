import React, { useState } from 'react'
import { FaRegCopy, FaCheck, FaWhatsapp } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import axios from 'axios'
import NavBar from '../../components/learner/NavBar'
import Footer from '../../components/landing page/Footer'
import SuccessMessage from '../../components/messages/SuccessMessage'
import ErrorMessage from '../../components/messages/ErrorMessage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const SubscriptionPage = () => {
  const [copiedField, setCopiedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    subscriptionType: '',
    paymentSlip: null
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bankDetails = [
    { label: 'Account Name', value: 'V.Krishnakishore' },
    { label: 'Account Number', value: '86182082' },
    { label: 'Bank Name', value: 'Bank of Ceylon' },
    { label: 'Branch Code', value: '053 (Chunnakam)' },
  ];

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    setCopiedField(value);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'paymentSlip' && files && files[0]) {
      // Validate file type
      const file = files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(prev => ({
          ...prev,
          paymentSlip: 'File must be JPG, PNG, or PDF'
        }));
        return;
      }
      
      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage(prev => ({
          ...prev,
          paymentSlip: 'File size must be less than 5MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file  // Store the File object directly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing/selecting
    setErrorMessage(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    let tempErrors = {
      username: '',
      subscriptionType: '',
      paymentSlip: ''
    };
    let isValid = true;

    // Username validation
    if (!formData.username.trim()) {
      tempErrors.username = 'Username is required';
      isValid = false;
    }

    // Subscription type validation
    if (!formData.subscriptionType) {
      tempErrors.subscriptionType = 'Subscription type is required';
      isValid = false;
    }

    // Payment slip validation
    if (!formData.paymentSlip) {
      tempErrors.paymentSlip = 'Payment slip is required';
      isValid = false;
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(formData.paymentSlip.type)) {
        tempErrors.paymentSlip = 'File must be JPG, PNG, or PDF';
        isValid = false;
      } else if (formData.paymentSlip.size > maxSize) {
        tempErrors.paymentSlip = 'File size must be less than 5MB';
        isValid = false;
      }
    }

    setErrorMessage(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setShowError(false);

    try {
      // Create a new FormData instance
      const formDataToSend = new FormData();
      
      // Ensure file is a Blob/File object before appending
      if (formData.paymentSlip instanceof Blob) {
        formDataToSend.append('paymentSlip', formData.paymentSlip, formData.paymentSlip.name);
      } else {
        throw new Error('Invalid file format');
      }
      
      formDataToSend.append('subscriptionType', formData.subscriptionType);
      formDataToSend.append('username', formData.username);

      const token = localStorage.getItem('access');

      const response = await axios.post(
        `${apiBaseUrl}/subscription/request/`, 
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',  // Important!
          }
        }
      );

      if (response.status === 200) {
        setShowSuccess(true);
        // Reset form
        setFormData({
          username: '',
          subscriptionType: '',
          paymentSlip: null
        });
        e.target.reset();
      } else {
        throw new Error('Unexpected response status');
      }

    } catch (error) {
      // Handle specific error messages from backend
      const errorMsg = error.response?.data?.message || 'Failed to submit subscription request';
      setErrorMessage(errorMsg);
      setShowError(true);

      // If user not found, redirect to signup
      // if (error.response?.status === 404) {
      //   setTimeout(() => {
      //     window.location.href = '/signup';
      //   }, 3000);
      // }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className='min-h-screen bg-white flex items-center justify-center p-4 md:p-8 mt-16'>
        <div className='flex flex-col md:flex-row gap-8 max-w-7xl w-full'>
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Subscribe to Edora Premium
            </h2>
            
            <div className="bg-secondary rounded-3xl p-4 space-y-3">
              <h3 className="font-semibold text-dark_gray">Pricing Plans</h3>
              <div className="space-y-2 px-4 md:px-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Monthly</span>
                  <span className="font-bold text-primary text-xl"><span className='font-base text-sm'>LKR </span>499</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Yearly</span>
                  <span className="font-bold text-primary text-xl"><span className='font-base text-sm'>LKR </span>9999</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-3xl p-4">
              <h3 className="font-medium text-dark_gray">Account Details</h3>
              {bankDetails.map(({ label, value }) => (
                <div key={label} className="flex items-center text-sm justify-between group">
                  <div className="text-gray-700 px-4 md:px-8">
                    <span className="">{label} : </span>
                    <span className='font-bold text-dark_gray pl-3'>{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(value)}
                    className="text-dark_gray p-2 rounded-full md:opacity-0 group-hover:opacity-100 hover:bg-[#00A693]/10 transition-all duration-200"
                  >
                    {copiedField === value ? <FaCheck /> : <FaRegCopy />}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-secondary rounded-3xl p-4 space-y-3">
              <h3 className="font-semibold text-dark_gray">How to Subscribe</h3>
              <ol className="text-gray-700 text-sm space-y-2 px-4 md:px-8 list-decimal">
                <li>Choose your subscription plan (Monthly/Yearly)</li>
                <li>Make the payment to the bank account provided above</li>
                <li>Upload the payment slip</li>
                <li>Submit the form</li>
                
              </ol>
              <p className='text-gray-700 text-sm'>
                <span className='font-semibold'>Or </span>simply WhatsApp us with your username, subscription type, and payment slip at 
                <a href="https://wa.me/94779363665" className="text-primary font-semibold"> +94779363665</a>.
              </p>
              <div className="flex gap-4 justify-center mt-4">
                <a 
                  href="https://wa.me/94779363665" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-dark_gray text-sm font-semibold hover:text-primary transition-colors duration-200"
                >
                  <FaWhatsapp size={20} className="text-[#25D366]" /> 
                  Support
                </a>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=edora.toinfo@gmail.com"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-dark_gray text-sm font-semibold hover:text-primary transition-colors duration-200"
                >
                  <MdEmail size={20} className="text-[#EA4335]" /> 
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className='w-full md:w-1/2'>
            <div className='bg-dark_gray rounded-3xl p-6 md:p-12 h-full'>
              <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Username</label>
                    <input 
                      type="text"
                      name="username"
                      placeholder='Username'
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#00A693]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Subscription Type</label>
                    <select 
                      name="subscriptionType"
                      value={formData.subscriptionType}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#00A693]/20"
                      required
                    >
                      <option value="">Select subscription type</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <hr className="border-gray-700" />

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Payment Slip</label>
                    <input 
                      type="file"
                      name="paymentSlip"
                      onChange={handleInputChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full p-2 text-sm text-white border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#00A693]/20"
                      required
                    />
                    <p className="text-xs text-gray-300 mt-1">Accepted formats: JPG, PNG, PDF</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-2 font-semibold rounded-3xl hover:bg-white hover:text-primary transition-all duration-200 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {showSuccess && (
        <SuccessMessage
          key={"Subscription request submitted successfully! Please check your email." || Date.now()} 
          message="Subscription request submitted successfully! Please check your email."
          isPersistent={false} 
        />
      )}
      {showError && (
        <ErrorMessage 
          message={errorMessage} 
        />
      )}
    </>
  )
}

export default SubscriptionPage