import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import ErrorMessage from '../components/messages/ErrorMessage';
import SuccessMessage from '../components/messages/SuccessMessage';
import ThinkingMessage from '../components/messages/thinkingMessage/ThinkingMessage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const AccountActivation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const activateAccount = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/learner/activate/${token}/`);
                
                if (response.data.status === 'success') {
                    setStatus('success');
                    setMessage('Account activated successfully!');
                    localStorage.setItem('access', response.data.access);
                    
                    // Automatically log the user in
                    login(response.data, response.data.user.username);
                    
                    // Redirect after 2 seconds
                    setTimeout(() => {
                        navigate('/generalchat');
                    }, 2000);
                } else {
                    setStatus('info');
                    setMessage(response.data.message);
                    // Redirect to signin after 2 seconds
                    setTimeout(() => {
                        navigate('/signin');
                    }, 2000);
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Activation failed. Please try again.');
                // Redirect to signin after 2 seconds
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            } finally {
                setIsLoading(false);
            }
        };

        activateAccount();
    }, [token, navigate, login]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary-50">
                <ThinkingMessage message="Activating your account..." />
            </div>
        );
    }

    return (
        <div>
            <div>
                {status === 'success' && <SuccessMessage message={message} />}
                {status === 'error' && <ErrorMessage message={message} />}
                {/* {status === 'info' && (
                    <div className="text-center text-gray-600">
                        <p>{message}</p>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default AccountActivation;