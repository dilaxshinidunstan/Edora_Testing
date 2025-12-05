import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Bot from '../../assets/images/bot.png'; // Import the bot image
import ToggleBot from './ToggleBot'; // Import the chat toggle component
import './PdfViewer.css'; // Import styles
import TestNavbar from './TestNavbar'; // Import the navbar component
import PastpaperChat from '../../pages/PastpaperChat'; // Import the PastpaperChat component

const Paper = ({ isChatOpen, toggleChat, selected_year, selected_test, handleClose }) => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [testContent, setTestContent] = useState('');
    const [isScreenWide, setIsScreenWide] = useState(window.innerWidth > 768); // State to track screen width

    // List of tests (16 tests dynamically generated)
    const tests = Array.from({ length: 16 }, (_, i) => `Test ${i + 1}`);

    // Fetch the content of the selected test when `selected_test` or `selected_year` changes
    useEffect(() => {
        const fetchTestContent = async () => {
            try {
                const response = await fetch(`/pastpapers/${selected_year}/Test ${selected_test}.txt`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                setTestContent(text); // Update the state with fetched content
            } catch (error) {
                console.error('Error fetching the test content:', error);
                setTestContent('Error loading test content.'); // Show error message
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

    // Navigate to PastpaperChat if screen is narrow and chat is open
    useEffect(() => {
        if (!isScreenWide && isChatOpen) {
            navigate(`/togglebot/${selected_year}/${selected_test}`); // Navigate to PastpaperChat
        }
    }, [isScreenWide, isChatOpen, navigate, selected_year, selected_test]);

    return (
        <div className={`flex flex-col h-screen transition-all duration-300 ${isChatOpen ? 'mr-[500px]' : 'mr-0'} mx-auto`}>
            {/* Navbar at the top */}
            <div className="mt-16">
                <TestNavbar selectedTest={selected_test} />
            </div>

            {/* Main content area for the test */}
            <div className="flex h-screen">
                <div className="max-w-4xl h-[550px] p-4 items-center overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white mx-auto">
                    <div className="bg-light_gray border border-gray-300 rounded-3xl p-4 shadow-md"> {/* Tailwind styles */}
                        <pre className="whitespace-pre-wrap font-poppins leading-relaxed text-sm">
                            {testContent}
                        </pre>
                    </div>
                </div>

                {/* Right Section: Chat Box */}
                <div className="h-screen">
                    <button
                        className={`fixed bottom-8 right-6 p-1 cursor-pointer flex items-center gap-2 bg-dark_gray text-white hover:border hover:border-primary rounded-full shadow-2xl hover:bg-secondary hover:text-black ${isChatOpen ? 'hidden' : ''}`}
                        onClick={toggleChat}
                    >
                        <img src={Bot} alt="Bot" className="h-8 w-8 bg-white rounded-full p-0" />
                        <span className="font-medium pr-2">Ask Edora</span>
                    </button>
                    

                    {/* Chat Container */}
                    {isChatOpen && isScreenWide && ( // Only show the chat container if the screen width is greater than 768px
                        <div
                            className={`fixed right-0 top-0 h-screen w-[500px] transition-all duration-300 transform ${
                                isChatOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                        >
                            <ToggleBot
                                selected_year={selected_year}
                                selected_test={selected_test}
                                handleClose={handleClose}
                                className="h-full flex flex-col"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Paper;
