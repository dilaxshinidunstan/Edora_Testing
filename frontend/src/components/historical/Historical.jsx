import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useHistoricalChat } from './HistoricalChatContext'; // Import new context
import Kalaam from './kalaam.jpg'
import '../styles/custom.css';
import SendButton from '../buttons/SendButton';
import VoiceButton from '../buttons/VoiceButton';
import InputBox from '../InputBox';
import BotMessage from '../messages/BotMessage';
import UserMessage from '../messages/UserMessage';
import ThinkingMessage from '../messages/thinkingMessage/ThinkingMessage';
import HistoryButton from '../buttons/HistotyButton'
import { useParams, useNavigate } from 'react-router-dom';
import NewChatButton from '../buttons/NewChatButton';
import useFetchPremiumStatus from '../custom_hooks/useFetchPremiumStatus';
import { usePremium } from '../contexts/PremiumContext';
import { FaBolt } from 'react-icons/fa6';
import ErrorMessage from '../messages/ErrorMessage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const Historical = () => {
    const { messages, setMessages, chatId, setChatId } = useHistoricalChat(); // Use new context
    const [input, setInput] = React.useState('');
    const [showOptionalQuestions, setShowOptionalQuestions] = React.useState(false);
    const [error, setError] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    const [isloading, setIsLoading] = useState(false)
    const { isPremium, setIsPremium } = usePremium();

    const premiumStatus = useFetchPremiumStatus()

    const [remainingQuota, setRemainingQuota] = useState(null);
    
    const initialBotMessage = {
        sender: 'bot',
        text:`Hello! I am Dr. A.P.J. Abdul Kalam, 🌟 I'm here to offer you guidance and inspiration. Whether you have questions about science, motivation, or life, I'm here to help you on your journey! 💡🚀`,
        time: new Date()
    };

    const { chatId: urlChatId } = useParams();

    const navigate = useNavigate()

    const handleTranscript = (transcript) => {
        setInput(transcript)
        sendMessage(transcript)
    }

    useEffect(() => {
        // const storedChatId = localStorage.getItem('historical_chat_id');

        // if (storedChatId) {
        //     setChatId(storedChatId);  // Use the existing chat ID
        //     getChatHistory(storedChatId);  // Fetch and load chat history
        // } else {
        //     console.log('No chat ID found in localStorage');
        //     // Optionally: Inform the user that they need to start a chat
        // }
            
        const initializeChat = async () => {
            setIsLoading(true)
            try {
                setIsPremium(premiumStatus)
                if (!premiumStatus) {
                    await getLearnerQuota()
                }

                if (urlChatId) {
                    setChatId(urlChatId);
                    await getChatHistory(urlChatId);
                    setShowOptionalQuestions(false)
                } else {
                    const storedChatId = localStorage.getItem('historical_chat_id');
                    if (storedChatId) {
                        setChatId(storedChatId);
                        await getChatHistory(storedChatId);
                        setShowOptionalQuestions(false)
                    } else {
                        setMessages([initialBotMessage])
                        setShowOptionalQuestions(true)
                    }
                }
            } catch (error) {
                console.error('Error initializing chat:', error)
            } finally {
                setIsLoading(false)
            }
        }
        initializeChat()
    }, [urlChatId])


    const getChatHistory = async (existing_chat_id) => {
        try {
            const response = await axios.get(`${apiBaseUrl}/historical/history/?chat_id=${existing_chat_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
    
            if (response.data && Array.isArray(response.data.history) && response.data.history.length > 0) {
                const chatHistory = response.data.history;  // Access the history array from the first object in the response

                const previousMessages = chatHistory.flatMap(entry => ([
                    { sender: 'user', text: entry.message, time: new Date(entry.timestamp) },
                    { sender: 'bot', text: entry.response, time: new Date(entry.timestamp) }
                ]));
    
                const filteredMessages = previousMessages.filter(
                    msg => !messages.some(m => m.text === msg.text && m.time.getTime() === msg.time.getTime())
                );
    
                if (filteredMessages.length > 0) {
                    setMessages(prevMessages => [
                        ...filteredMessages
                    ]);
                }
                setShowOptionalQuestions(false);
            } else {
                console.error('Unexpected response format')
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }

    const optionalQuestions = [
        "What is the key to success in life?",
        "How can I stay motivated through challenges?",
        "What are some ways to set and achieve goals?",
        "How can I maintain a positive attitude?",
        "What is the importance of perseverance?"
    ]

    const chatContainerRef = useRef(null);

    const handleQuestionClick = (question) => {
        setShowOptionalQuestions(false)
        sendMessage(question);
        
    };

    useEffect(() => {
        const initialBotMessage = {
            sender: 'bot',
            text:`Hello! I am Dr. A.P.J. Abdul Kalam, 🌟 I'm here to offer you guidance and inspiration. Whether you have questions about science, motivation, or life, I'm here to help you on your journey! 💡🚀`,
            time: new Date()
        };
        if (messages.length === 0) {
            setMessages([initialBotMessage]);
            setShowOptionalQuestions(true);
        }
    }, [messages, setMessages]);

    const sendMessage = async (message) => {
        setError('')
        if (message.trim()) {
            const newMessage = { sender: 'user', text: message, time: new Date() };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setInput('');
            // Hide optional questions after user interacts
            setShowOptionalQuestions(false);
            setIsThinking(true)

            try {
                const response = await axios.post(`${apiBaseUrl}/historical/chat/`, {
                    user_input: message,
                    new_chat: chatId === null,
                    chat_id: chatId
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });

                if (response && response.data && response.data.response) {
                    const botResponse = response.data.response;

                    const botMessage = { sender: 'bot', text: botResponse, time: new Date() };
                    setMessages(prevMessages => [...prevMessages, botMessage]);

                    if (chatId === null) {
                        setChatId(response.data.chat_id);
                    }
                    setRemainingQuota(response.data.remaining_quota);
                    localStorage.setItem('historical_chat_id', response.data.chat_id)
                } else {
                    console.error('Invalid response format:', response);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                setError("An error occurred while sending your message. Please try again.");
            } finally {
                setIsThinking(false)
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const handleSend = () => {
        sendMessage(input);
    };

    const handleHistoryClick = (e) => {
        e.preventDefault()
        navigate('/idol/history')
    }

    const handleNewChat = (e) => {
        e.preventDefault()
        setChatId(null)
        setMessages([])
        setShowOptionalQuestions(true)
        localStorage.removeItem('historical_chat_id')
        navigate(`/legend`)
    }

    const getLearnerQuota = async () => {
        try {
            await resetQuota()
            const response = await axios.get(`${apiBaseUrl}/learner/get_learner_quota`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            const remaining = response.data.historical_bot_quota
            setRemainingQuota(remaining);
        } catch (error) {
            console.error('Error fetching learner quota:', error);
        }
    }

    const resetQuota = async () => {
        try {
            const access = localStorage.getItem('access')
            const response = await axios.post(`${apiBaseUrl}/learner/reset_quota/`, {}, {
                headers: {
                    'Authorization': `Bearer ${access}`
                }
            });
        } catch (error) {
            console.error('Error resetting quota:', error)
        }
    }

    const handleUpgrade = () => {
        navigate('/pricing')
    }

    return (
        <div className='flex flex-col h-screen p-4 max-w-4xl sm:mx-auto z-20'>
            {/* Heading Section */}
            {/* <div className='hidden sm:block'>
                <div className='text-center mt-3 sm:mt-16 mb-6 p-4'>
                    <h1 className='text-2xl font-bold text-primary'>Inspire Your Mind with Dr. Kalam</h1>
                    <p className='text-md text-dark_gray border-b pb-3 mt-2'>Engage in an enlightening conversation and discover wisdom that motivates and inspires.</p>
                </div>
            </div> */}
            {error && (
                // <div className="flex-grow flex justify-center mx-2">
                    <ErrorMessage message={error} isPersistent={false} />
                // </div>
            )}
            <div className='flex justify-end mt-16'>
                {!isPremium && remainingQuota !== null && (
                    <div className='flex items-center border border-primary text-sm mb-2 p-2 rounded-full mr-4 text-transparent bg-clip-text bg-gradient-to-r from-strong_cyan to-primary font-base'>
                        {remainingQuota === 0 ? (
                            <span className="font-semibold">Daily limit reached.</span>
                        ) : (
                            <>
                                <span className="font-base">{remainingQuota}</span>
                                <span className="ml-1">Chats Left!</span>
                            </>
                        )}
                    </div>
                )}
                <NewChatButton handleNewChat={handleNewChat} disabled={!isPremium && remainingQuota === 0} />
                <HistoryButton label="Chat History" onClick={handleHistoryClick} />
            </div>
            
            {/* Chat Container */}
            <div className='flex-grow overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white mb-4 px-3 pt-2 sm:pt-0' ref={chatContainerRef}>
                {messages.map((message, index) => (
                    message.sender === 'bot' ? (
                        <BotMessage key={index} text={message.text} time={message.time} speaker={Kalaam} />
                    ) : (
                        <UserMessage key={index} text={message.text} time={message.time} />
                    )
                ))}
                {isThinking && <ThinkingMessage />}
                {showOptionalQuestions && (
                    <div className='mt-4'>
                        <div className='justify-start flex flex-col gap-2 max-w-lg'>
                            {optionalQuestions.map((question, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handleQuestionClick(question)} 
                                    className='p-2 bg-white text-sm text-left text-primary border border-primary rounded-2xl hover:bg-secondary'
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {
                !isPremium && remainingQuota === 0 && (
                    <div className='mb-4 flex justify-center'>
                        <button onClick={handleUpgrade} className='flex items-center justify-center bg-gradient-to-r from-strong_cyan to-primary text-white shadow-lg py-2 px-4 rounded-full inline-block animate-bounce'>
                            <FaBolt className='mr-2 text-yellow-300' />
                            <span className='font-bold mr-2'>Upgrade to continue</span>

                        </button>

                    </div>
                )
            }
            <div className='flex flex-row justify-center w-full px-2 sm:px-3 items-center mt-auto'>
            {/* <div className='flex w-full mb-2'> */}
                <VoiceButton onTranscript={handleTranscript} />
                <InputBox 
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    disabled={!isPremium && remainingQuota === 0}
                />
                <SendButton onClick={handleSend} disabled={!input.trim()} />
            {/* </div> */}
            </div>
            <div className="text-center text-[11px] text-gray-500 mt-2 mb-4 px-4">
                <p>
                Edora aims for accuracy but may make mistakes. 
                Avoid sharing personal or sensitive information.
                </p>
            </div>
        </div>
    );
};

export default Historical;
