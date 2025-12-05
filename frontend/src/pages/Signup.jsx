import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import axios from 'axios';
import { IoCloseOutline } from "react-icons/io5";
import ErrorMessage from '../components/messages/ErrorMessage';
import SuccessMessage from '../components/messages/SuccessMessage';
import SubmitButton from '../components/buttons/SubmitButton';
import backgroundImage from '../assets/images/bg.jpeg'
import ELogoGreen from '../assets/images/logo/e_logo_green.png'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    grade: '',
    mobile_no: '', // Added mobile number
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'password') {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('')
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/learner/register/`, formData);
      
      if (response.data.status === 'success') {
        setSuccess('Registration successful! Please check your email to activate your account.');
        // Clear form
        setFormData({
          email: '',
          username: '',
          password: '',
          grade: '',
          mobile_no: '', // Reset mobile number
        });
        // Redirect after 3 seconds
        // setTimeout(() => {
        //   navigate('/signin');
        // }, 3000);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: 'An error occurred during registration. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = () => navigate('/signin');
  const handleClose = () => navigate('/home');
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='relative bg-white rounded-xl max-w-md w-full p-8 mx-4 sm:mx-0' style={{ zIndex: 10 }}>
        <button onClick={handleClose} className='absolute top-4 right-4 text-gray-500 hover:text-primary'>
          <IoCloseOutline size={24} />
        </button>
        
        <div className='text-center mb-6'>
          {/* <img src={ELogoGreen} alt="EDUTECH Logo" className="mx-auto mb-2" style={{ width: '120px' }} /> */}
          <h2 className='text-2xl font-semibold text-gray-700'>Create your Account</h2>
          <p className='text-sm text-gray-500 mt-2'>Sign up today to master your subjects with Edora! 🚀</p>
          {/* <p className='text-sm text-gray-500 mt-1'>with AI-powered learning! 🚀</p> */}
        </div>

        {/* Success Message */}
        {success && <SuccessMessage message={success} />}
        
        {/* General Error Message */}
        {errors.general && <ErrorMessage message={errors.general} />}

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div>
            <input
              type='email'
              name='email'
              placeholder='Email'
              className={`w-full p-2.5 pl-4 rounded-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-primary transition`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.email}</p>}
          </div>

          <div>
            <input
              type='text'
              name='username'
              placeholder='Username'
              className={`w-full p-2.5 pl-4 rounded-full border ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-primary transition`}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.username}</p>}
          </div>

          <div>
            <input
              type='text'
              name='mobile_no'
              placeholder='Mobile Number'
              className={`w-full p-2.5 pl-4 rounded-full border ${errors.mobile_no ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-primary transition`}
              value={formData.mobile_no}
              onChange={handleChange}
            />
            {errors.mobile_no && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.mobile_no}</p>}
          </div>

          <div>
            <div className="relative">
              <select
                name='grade'
                className={`w-full p-2 pl-4 rounded-full border appearance-none text-gray-500
                  ${errors.grade ? 'border-red-500' : 'border-gray-300'} 
                  focus:outline-none focus:border-primary transition
                  [&:not([size])]:pr-8 [&::-webkit-select-placeholder]:text-gray-500
                  [-webkit-tap-highlight-color:transparent]`}
                value={formData.grade}
                onChange={handleChange}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" className="text-gray-500">Select Grade</option>
                {['Below grade 6', '6', '7', '8', '9', '10', 'O/L', 'Above A/L'].map(grade => (
                  <option key={grade} value={grade} className="text-gray-700">{grade}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                <svg className="h-3 w-3 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {errors.grade && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.grade}</p>}
          </div>

          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Password'
              className={`w-full p-2.5 pl-4 rounded-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-primary transition`}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <IoEyeOutline size={20} className="text-gray-400" />
              ) : (
                <IoEyeOffOutline size={20} className="text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className='text-red-500 text-sm mt-1 ml-4'>{errors.password}</p>}

          <div className="text-sm text-gray-600 mt-2">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="space-y-1">
              <li className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                <span>{passwordChecks.length ? '✓' : '○'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span>{passwordChecks.uppercase ? '✓' : '○'}</span>
                One uppercase letter (A-Z)
              </li>
              <li className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span>{passwordChecks.lowercase ? '✓' : '○'}</span>
                One lowercase letter (a-z)
              </li>
              <li className={`flex items-center gap-2 ${passwordChecks.number ? 'text-green-600' : 'text-gray-500'}`}>
                <span>{passwordChecks.number ? '✓' : '○'}</span>
                One number (0-9)
              </li>
              <li className={`flex items-center gap-2 ${passwordChecks.special ? 'text-green-600' : 'text-gray-500'}`}>
                <span>{passwordChecks.special ? '✓' : '○'}</span>
                One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
              </li>
            </ul>
          </div>

          <SubmitButton 
            text={isLoading ? 'Signing Up...' : 'Sign Up'} 
            disabled={isLoading}
          />
        </form>

        <div className='text-center'>
          <p className='text-sm text-gray-500'>
            Already have an account?
            <button onClick={handleSignin} className='ml-2 text-primary hover:underline'>
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .min-h-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9;
          }
          .bg-white {
            height: 100vh;
            margin: 0;
            border-radius: 0;
            overflow-y: auto;
          }
        }
      `}</style>

      <style>
          {`
              /* Hide default password toggle in Edge */
              input::-ms-reveal,
              input::-ms-clear {
                  display: none;
              }

              /* Hide default password toggle in Chrome */
              input[type="password"]::-webkit-contacts-auto-fill-button,
              input[type="password"]::-webkit-credentials-auto-fill-button {
                  visibility: hidden;
                  display: none !important;
                  pointer-events: none;
                  position: absolute;
                  right: 0;
              }
          `}
      </style>
    </div>
  );
};

export default Signup;
