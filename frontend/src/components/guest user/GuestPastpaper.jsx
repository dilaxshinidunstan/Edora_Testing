import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Bot from '../../assets/images/bot.png';
import TestNavbar from '../pastpaper/TestNavbar';
import GuestTestNavbar from './GuestTestNavbar';
import SignupPrompt from './SignupPrompt';
import '../pastpaper/PdfViewer.css';

const GuestPastpaper = ({ selected_year, selected_test }) => {
    const [testContent, setTestContent] = useState('');
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [isScreenWide, setIsScreenWide] = useState(window.innerWidth > 768);
    const navigate = useNavigate();

    // Check if the selected year is 2023
    useEffect(() => {
        if (selected_year !== '2023') {
            setShowSignupPrompt(true)
            navigate(`/guest/pastpaper/2023/${selected_test}`)
        }
    }, [selected_year, navigate]);

    // Fetch the content of the selected test
    useEffect(() => {
        const fetchTestContent = async () => {
            try {
                const response = await fetch(`/pastpapers/${selected_year}/Test ${selected_test}.txt`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                setTestContent(text);
            } catch (error) {
                console.error('Error fetching the test content:', error);
                setTestContent('Error loading test content.');
            }
        };

        fetchTestContent();
    }, [selected_test, selected_year]);

    // Effect to update screen width state on resize
    useEffect(() => {
        const handleResize = () => {
            setIsScreenWide(window.innerWidth > 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="flex flex-col transition-all duration-300 mr-0 mx-auto">
            {/* Navbar at the top */}
            <div className="mt-20">
                <GuestTestNavbar selectedTest={selected_test} />
            </div>

            {/* Main content area for the test */}
            <div className="flex">
                <div className="max-w-4xl h-[550px] p-4 items-center overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white mx-auto">
                    <div className="bg-light_gray border border-gray-300 rounded-3xl p-4 shadow-md">
                        <pre className="whitespace-pre-wrap font-poppins leading-relaxed text-sm">
                            {testContent}
                        </pre>
                    </div>
                </div>

                {/* Ask Edora Button */}
                <div>
                    <button
                        className="fixed bottom-8 right-6 p-1 cursor-pointer flex items-center gap-2 bg-dark_gray text-white hover:border hover:border-primary rounded-full shadow-2xl hover:bg-secondary hover:text-black"
                        onClick={() => setShowSignupPrompt(true)}
                    >
                        <img src={Bot} alt="Bot" className="h-8 w-8 bg-white rounded-full p-0" />
                        <span className="font-medium pr-2">Ask Edora</span>
                    </button>
                </div>
            </div>

            {/* Signup Prompt */}
            <SignupPrompt 
                show={showSignupPrompt} 
                onClose={() => setShowSignupPrompt(false)} 
            />
        </div>
    );
};

export default GuestPastpaper;