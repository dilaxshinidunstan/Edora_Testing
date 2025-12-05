import React, { useState } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { IoCloseOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useChat } from '../components/chat/ChatContext';
import ErrorMessage from '../components/messages/ErrorMessage';
import SuccessMessage from '../components/messages/SuccessMessage';
import SubmitButton from '../components/buttons/SubmitButton';
import backgroundImage from '../assets/images/bg.jpeg'
import ELogoGreen from '../assets/images/logo/e_logo_green.png'


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const ForgotPasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/learner/forgot_password/`, { email });
      if (response.data.status === 'success') {
        setSuccess('Password reset link has been sent to your email.');
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          {success && <div className="mb-4 text-green-500 text-sm">{success}</div>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full p-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-primary rounded-full hover:bg-primary-dark disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Signin = () => {
    const { setMessages, setChatId } = useChat();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('')

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username_or_email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setEmail('')
        setSuccess('')
        
        try {
            const response = await axios.post(`${apiBaseUrl}/learner/login/`, formData);
            
            if (response.data.status === 'success') {
                login(response.data, response.data.user.username);
                setMessages([]);
                setChatId(null);

                setSuccess('Successfully signed in');
                setTimeout(() => {
                    navigate('/learner/home');
                }, 1500);
            }
        } catch (error) {
            if (error.response) {
                // Handle different types of errors
                if (error.response.data.errors) {
                    // Validation errors
                    setErrors(error.response.data.errors);
                } else if (error.response.data.error) {
                    // Single error message (like 'Please activate your account')
                    if (error.response.data.error.includes('activate')) {
                        setErrors({
                            activation: error.response.data.error
                        });
                    } else if (error.response.data.error.includes('password')) {
                        setErrors({
                            password: error.response.data.error
                        });
                    } else if (error.response.data.error.includes('account')) {
                        setErrors({
                            username_or_email: error.response.data.error
                        });
                    } else {
                        setErrors({
                            general: error.response.data.error
                        });
                    }
                } else {
                    setErrors({
                        general: 'An error occurred. Please try again.'
                    });
                }
            } else {
                setErrors({
                    general: 'Network error. Please check your connection.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    const handleClose = () => {
        navigate('/home');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-50 relative"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className='relative bg-white shadow-xl rounded-xl max-w-md w-full p-8 mx-4 sm:mx-0' style={{ zIndex: 10 }}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-primary">
                    <IoCloseOutline size={24} />
                </button>

                <div className="text-center mb-6">
                    <img src={ELogoGreen} alt="EDUTECH Logo" className="mx-auto mb-2" style={{ width: '120px' }} />
                    <h1 className="text-3xl font-bold text-gray-700">Edora</h1>
                    <p className="text-sm text-gray-700 font-medium">The Learning Partner</p>
                    {/* <p className="text-sm text-gray-500 mt-4">If you're already a member,</p>
                    <p className="text-sm text-gray-500 mt-1"> sign in to continue your studies!🎓</p> */}
                </div>

                {/* Error and Success Messages */}
                {errors.general && <ErrorMessage message={errors.general} />}
                {errors.activation && (
                    <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
                        {errors.activation}
                    </div>
                )}
                {success && <SuccessMessage message={success} />}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            name="username_or_email"
                            placeholder="Username / Email"
                            className={`p-2.5 pl-4 rounded-full w-full border ${
                                errors.username_or_email ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            value={formData.username_or_email}
                            onChange={handleChange}
                        />
                        {errors.username_or_email && (
                            <p className="text-red-500 text-sm mt-1 ml-4">{errors.username_or_email}</p>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            className={`p-2.5 pl-4 rounded-full w-full border ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
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
                    {errors.password && (
                            <p className="text-red-500 text-sm mt-1 ml-4">{errors.password}</p>
                        )}
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-primary text-sm mt-2 hover:underline text-right w-full"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <SubmitButton text={isLoading ? 'Signing In...' : 'Sign In'} disabled={isLoading} />
                </form>

                <div className="flex justify-center items-center mt-4">
                    <p className="text-sm text-gray-500">
                        Don't have an account?
                        <button onClick={handleSignup} className="text-primary text-sm ml-2 hover:underline">
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>

            {/* Mobile responsive styles */}
            <style>{`
                @media (max-width: 768px) {
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
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
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

            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />
        </div>
    );
};

export default Signin;
