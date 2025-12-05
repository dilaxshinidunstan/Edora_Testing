import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useChat } from './ChatContext';
import SendButton from '../buttons/SendButton';
import VoiceButton from '../buttons/VoiceButton';
import '../styles/custom.css'
import BotLogo from '../../assets/images/bot.png'
import { usePremium } from '../contexts/PremiumContext';
import { FaBolt } from 'react-icons/fa6';
import { useParams, useNavigate } from 'react-router-dom';
import InputBox from '../InputBox'
import NewChatButton from '../buttons/NewChatButton';
import ErrorMessage from '../messages/ErrorMessage';
import BotMessage from '../messages/BotMessage';
import UserMessage from '../messages/UserMessage';
import ThinkingMessage from '../messages/thinkingMessage/ThinkingMessage';
import HistoryButton from '../buttons/HistotyButton'
import PersonalizedLearningButton from '../buttons/PersonalizedLearningButton';
import PersonalizationModal from './PersonalizationModal';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL


const Chat = () => {
    const { isPremium, setIsPremium } = usePremium();

    const [isLoading, setIsLoading] = useState(false)

    const { chatId: urlChatId } = useParams();

    const [isThinking, setIsThinking] = useState(false)

    const { messages, setMessages, chatId, setChatId, updateChatSessions } = useChat();
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = React.useState('');
    const [showOptionalQuestions, setShowOptionalQuestions] = React.useState(false);
    
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [showUpgradeButton, setShowUpgradeButton] = useState(false);

    const [suggestions, setSuggestions] = useState([])

    const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);

    const initialBotMessage = {
        sender: 'bot', 
        text: `Hey ${localStorage.getItem('username')}! 😊🌟\n\n👋 What can I help you learn or improve in English today? 📝 \n\n`,
        time: new Date()
    }

    const navigate = useNavigate();

    const handleTranscript = (transcript) => {
        setInput(transcript)
        sendMessage(transcript)
    }

    const checkPremiumStatus = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/learner/check_premium`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            setIsPremium(response.data.is_premium)
            return response.data.is_premium
        } catch (error) {
            console.error('Error checking premium status:', error)
        }
    }

    useEffect(() => {
        const initializeChat = async () => {
            setIsLoading(true)
            try {
                const isPremiumLearner = await checkPremiumStatus()
                setIsPremium(isPremiumLearner)
                if (!isPremiumLearner) {
                    await getLearnerQuota()
                }

                if (urlChatId) {
                    setChatId(urlChatId);
                    await getChatHistory(urlChatId);
                    setShowOptionalQuestions(false)
                } else {
                    const storedChatId = localStorage.getItem('chat_id');
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

    const [error, setError] = useState('')

    const optionalQuestions = [
        "How do I write a good introduction for an essay?",
        "What’s the best way to practice writing formal and informal letters?",
        "How do I use linking words to make my writing flow better?",
    ]

    const chatContainerRef = useRef(null);

    const handleQuestionClick = (question) => {
        setShowOptionalQuestions(false)
        sendMessage(question);
        
    };

    const getChatHistory = async (existing_chat_id) => {
        try {
            const response = await axios.get(`${apiBaseUrl}/chat/history/?chat_id=${existing_chat_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
    
            if (response.data && Array.isArray(response.data.history)) {
                const previousMessages = response.data.history.flatMap(entry => ([
                    { sender: 'user', text: entry.message, time: new Date(entry.timestamp) },
                    { sender: 'bot', text: entry.response, time: new Date(entry.timestamp) }
                ]));

                const currentMessagesText = messages.map(msg => msg.text);
                const filteredMessages = previousMessages.filter(
                    msg => !messages.some(m => m.text === msg.text && m.time.getTime() === msg.time.getTime())
                );

                if (filteredMessages.length > 0) {
                    setMessages(prevMessages => [
                        // ...prevMessages,
                        ...filteredMessages
                    ]);
                }
                setShowOptionalQuestions(false)
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }

    const sendMessage = async (message) => {
        setError('')
        if (message.trim()) {
            const newMessage = { sender: 'user', text: message, time: new Date() };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setInput('');
            setShowOptionalQuestions(false)

            // Add thinking message
            setIsThinking(true);

            try {
                const response = await axios.post(`${apiBaseUrl}/chat/`, {
                    user_input: message,
                    new_chat: chatId === null,
                    chat_id: chatId
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });

                if (response.data.error) {
                    setError(response.data.error);
                    if (response.data.remaining_quota === 0) {
                        setShowUpgradeButton(true);
                    }
                } else {
                    const botResponse = response.data.response;
                    setMessages(prevMessages => prevMessages.filter(msg => !msg.isThinking));
                    const botMessage = { sender: 'bot', text: botResponse, time: new Date() };
                    setMessages(prevMessages => [...prevMessages, botMessage]);

                    if (chatId === null) {
                        setChatId(response.data.chat_id);
                        updateChatSessions()
                    }
                    setError('');
                    setShowOptionalQuestions(false);
                    
                    // Update remaining quota
                    setRemainingQuota(response.data.remaining_quota);
                }
                localStorage.setItem('chat_id', response.data.chat_id);
            } catch (error) {
                console.error('Error sending message:', error);
                setError("An error occurred while sending your message. Please try again.");
            }finally{
                setIsThinking(false);
            }
        }
    };

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }

    const handleSend = () => {
        sendMessage(input)
    }

    const handleUpgrade = () => {
        navigate('/pricing')
    }

    const getLearnerQuota = async () => {
        try {
            await resetQuota()
            const response = await axios.get(`${apiBaseUrl}/learner/get_learner_quota`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });
            const remaining = response.data.general_bot_quota
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
    
    const handleNewChat = (e) => {
        e.preventDefault()
        setChatId(null)
        setMessages([])
        setShowOptionalQuestions(true)
        localStorage.removeItem('chat_id')
        navigate(`/generalchat`)
    }

    const handleChatHistoryClick = (e) => {
        e.preventDefault()
        navigate('/generalchat/history')
    }
    
    return (
        <div className='flex flex-col h-screen p-4 max-w-4xl sm:mx-auto'>
            <div className='flex justify-end mt-16 sm:mt-16 pt-2 items-center mb-4'>    
                {error && (
                    // <div className="flex-grow flex justify-center mx-2">
                        <ErrorMessage message={error} isPersistent={false} />
                    // </div>
                )}
                {!isPremium && remainingQuota !== null && (
                    <div className='flex items-center text-transparent border border-primary rounded-full p-2 mr-4 sm:text-sm text-sm  bg-clip-text bg-gradient-to-r from-strong_cyan to-primary'>
                        {remainingQuota === 0 ? (
                            <span>Daily limit reached.</span>
                        ) : (
                            <>
                                <span>{remainingQuota}</span>
                                <span className="ml-1">Chats Left!</span>
                            </>
                        )}
                    </div>
                )}
                <PersonalizedLearningButton label="Personalized Learning" onClick={() => setShowPersonalizationModal(true)} />
                <NewChatButton handleNewChat={handleNewChat} disabled={!isPremium && remainingQuota === 0} />
                <HistoryButton label="Chat History" onClick={handleChatHistoryClick} />
            </div>

            {/* Add Modal */}
            <PersonalizationModal 
                isOpen={showPersonalizationModal}
                onClose={() => setShowPersonalizationModal(false)}
            />

            
            <div className='h-screen p-2 overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white'>
                <div ref={chatContainerRef}>
                    {messages.map((message, index) => (
                        message.sender === 'bot' ? (
                            <BotMessage key={index} text={message.text} time={message.time} speaker={BotLogo} />
                    ) : (
                        <UserMessage key={index} text={message.text} time={message.time} />
                    )
                ))}
                {isThinking && <ThinkingMessage />}
                {showOptionalQuestions && (!(!isPremium && remainingQuota === 0)) && (
                    <div className='mt-4'>
                        <div className='justify-start flex flex-col gap-2 max-w-lg'>
                            {optionalQuestions.map((question, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handleQuestionClick(question)} 
                                    className='p-2 bg-white text-left sm:text-sm text-xs text-primary border border-primary rounded-3xl hover:bg-secondary'
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                </div>
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
            <div className='flex flex-row justify-center w-full px-2 sm:px-3 items-center mt-auto sm:mb-0'>
                <VoiceButton onTranscript={handleTranscript} disabled={!isPremium && remainingQuota === 0} />
                <InputBox 
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    disabled={!isPremium && remainingQuota === 0}
                />
                <SendButton onClick={handleSend} disabled={!isPremium && remainingQuota === 0} />
            </div>
            <div className="text-center text-[11px] text-gray-500 mt-2 mb-4 px-4">
                <p>
                Edora aims for accuracy but may make mistakes. 
                It's for learning only, avoid sharing personal or sensitive information.
                </p>
            </div>
        </div>
    )
}

export default Chat