import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { IoCloseOutline } from "react-icons/io5";
import SendButton from '../buttons/SendButton';
import VoiceButton from '../buttons/VoiceButton';
import InputBox from '../InputBox';
import BotMessage from '../messages/BotMessage';
import UserMessage from '../messages/UserMessage';
import ThinkingMessage from '../messages/thinkingMessage/ThinkingMessage';
import useFetchPremiumStatus from '../custom_hooks/useFetchPremiumStatus';
import { usePremium } from '../contexts/PremiumContext';
import { FaBolt } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const ToggleBot = ({ selected_year,selected_test, handleClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const { isPremium, setIsPremium } = usePremium();
    const chatContainerRef = useRef(null);
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [isloading, setIsLoading] = useState(false)

    const premiumStatus = useFetchPremiumStatus()

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    const navigate = useNavigate(setIsLoading)

    const handleTranscript = (transcript) => {
        setInput(transcript)
        sendMessage(transcript)
    }

    useEffect(() => {
        getChatHistory()
        const initializeChat = async () => {
            setIsLoading(true);
            try {
                setIsPremium(premiumStatus)
                if (!premiumStatus) {
                    await getLearnerQuota()
                }
            }
            catch (error) {
                console.error('Error initializing chat:', error)
            } 
            finally {
                setIsLoading(false)
            }
        }

        initializeChat()
    }, [])

    const getChatHistory = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/pastpaper/history/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            })

            if (response.data && Array.isArray(response.data)) {

                const previousMessages = response.data.map(entry => ([
                    { sender: 'user', text: entry.message, time: new Date(entry.timestamp) },
                    { sender: 'bot', text: entry.response, time: new Date(entry.timestamp) }
                ])).flat();
    
                const filteredMessages = previousMessages.filter(
                    msg => !messages.some(m => m.text === msg.text && m.time.getTime() === msg.time.getTime())
                );
    
                if (filteredMessages.length > 0) {
                    setMessages(prevMessages => [
                        ...filteredMessages
                    ]);
                }
            } else {
                console.error('Unexpected response format:', response.data)
            }
        
        }
        catch (error) {
            console.error('Error fetching chat history:', error)

        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }

    const sendMessage = async(message) => {
        if (message.trim()) {
            const newMessage = { sender: 'user', text: message, time: new Date() }
            setMessages(prevMessage => [...prevMessage, newMessage])
            setInput('')
            setIsThinking(true)

            try {
                const response = await axios.post(`${apiBaseUrl}/pastpaper/api/`, {
                    user_input: message,
                    selected_year: selected_year,
                    selected_test: selected_test
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                })

                if (response && response.data && response.data.response) {
                    const botResponse = response.data.response

                    const botMessage = { sender: 'bot', text: botResponse, time: new Date() }
                    setMessages(prevMessage => [...prevMessage, botMessage])

                    await getLearnerQuota()
                }
                else {
                    console.error('Invalid response format:', response)
                }
            }
            catch (error) {
                console.error("Error sending message: ", error)
            }
            finally {
                setIsThinking(false)
            }
        }
    }

    const handleSend = () => {
        sendMessage(input)
    };

    const getLearnerQuota = async () => {
        try {
            await resetQuota()
            const response = await axios.get(`${apiBaseUrl}/learner/get_learner_quota`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            const remaining = response.data.pastpaper_bot_quota
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
        <div className='flex flex-col pb-3 h-screen bg-secondary rounded-b-md'>
            <div className='flex flex-row justify-between mt-16 p-2'>
                {
                    !isPremium && remainingQuota !== null && (
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
                    )
                }
                <div>
                    <button onClick={handleClose} className='p-1 text-gray-500 rounded-full hover:bg-soft_cyan hover:text-primary duration-300'>
                    <IoCloseOutline size={20} />
                    </button>
                </div>
            </div>
            <div className='h-screen overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-secondary'> 
                <div className='mb-4 px-3 text-lg' ref={chatContainerRef}>
                    {messages.map((message, index) => (
                        message.sender === 'bot' ? (
                            <BotMessage key={index} text={message.text} time={message.time} className='!text-sm' />
                        ) : (
                            <UserMessage key={index} text={message.text} time={message.time} className='!text-sm' />
                        )
                    ))}
                    {isThinking && <ThinkingMessage />}
                </div>
            </div>

            {
                !isPremium && remainingQuota === 0 && (
                    <div className='mb-4 flex justify-center'>
                        <button onClick={handleUpgrade} className='flex items-center justify-center bg-gradient-to-r from-strong_cyan to-primary text-white text-sm shadow-lg py-2 px-4 rounded-full inline-block animate-bounce'>
                            <FaBolt className='mr-2 text-yellow-300' />
                            <span className='font-bold mr-2'>Upgrade to continue</span>

                        </button>

                    </div>
                )
            }

            <div className="flex flex-col sm:flex-row px-2 sm:px-3 items-center mt-auto mb=6">
                <div className="flex w-full items-center gap-2">
                    <VoiceButton onTranscript={handleTranscript} />
                    <InputBox 
                        input={input}
                        setInput={setInput}
                        handleSend={handleSend}
                        disabled={!isPremium && remainingQuota === 0}
                    />
                    <SendButton onClick={handleSend} disabled={!input.trim()} />
                </div>
            </div>
            <div className="text-center text-[11px] text-gray-500 mt-2 mb-4 px-4">
                <p>
                Edora aims for accuracy but may make mistakes. 
                It's for learning only, avoid sharing personal or sensitive information.
                </p>
            </div>
        </div>
    );
};

export default ToggleBot;
