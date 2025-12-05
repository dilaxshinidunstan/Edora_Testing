import React, {useState, useEffect, useRef} from 'react'
import NavBar from '../components/NavBar'
import LearnerNavbar from '../components/learner/NavBar'
import SideBar from '../components/SideBar'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { IoArrowBackCircle } from "react-icons/io5";
import axios from 'axios'
import { PremiumProvider } from '../components/contexts/PremiumContext'
import SendButton from '../components/buttons/SendButton';
import VoiceButton from '../components/buttons/VoiceButton';
import InputBox from '../components/InputBox'
import BotMessage from '../components/messages/BotMessage'
import UserMessage from '../components/messages/UserMessage'
import ThinkingMessage from '../components/messages/thinkingMessage/ThinkingMessage';
import useFetchPremiumStatus from '../components/custom_hooks/useFetchPremiumStatus'
import { usePremium } from '../components/contexts/PremiumContext' 
import { FaBolt } from 'react-icons/fa6';


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const PastpaperChat = () => {
    const location = useLocation()

    const navigate = useNavigate()

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { year } = useParams();  // Get the year parameter from the URL
    const { test } = useParams()

//   const selected_year = location.state || { year: '' }
//   const selected_test = location.state || { test: '' }

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatContainerRef = useRef(null);
    const { isPremium, setIsPremium } = usePremium()
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [isloading, setIsLoading] = useState(false)
    
    const premiumStatus = useFetchPremiumStatus(setIsLoading)

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

            // console.log(response.data[0])

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
                    selected_year: year,
                    selected_test: test
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

    const handleBack = () => {
      navigate(`/pastpaper/${year}/${test}`)
    }

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
    <PremiumProvider>
    <div className='bg-white h-screen flex flex-col'>
        <div className='z-50'>
            {/* <NavBar /> */}
            <LearnerNavbar />
        </div>
        
        <div>
            <SideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className={`flex h-screen overflow-hidden ${sidebarOpen ? 'sm:ml-80' : 'sm:ml-16'} duration-300`}>
                <div className='flex flex-col h-screen max-w-5xl mx-auto'>
                    <div className='flex flex-row justify-between mt-16 py-2 px-4'>
                        <button onClick={handleBack} className='ml-8 w-10 h-10 items-center text-dark_gray rounded-full hover:text-primary duration-300'>
                            <IoArrowBackCircle size={25} />
                        </button>
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
                        
                    </div>
                    <div className='h-screen overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white'>
                        <div className='mb-4 px-3' ref={chatContainerRef}>
                            {messages.map((message, index) => (
                                message.sender === 'bot' ? (
                                    <BotMessage key={index} text={message.text} time={message.time} />
                                ) : (
                                    <UserMessage key={index} text={message.text} time={message.time} />
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
                    <div className='flex flex-col sm:flex-row px-2 sm:px-3 items-end mt-auto'>
                        <div className='flex w-full items-center gap-2'>
                            <VoiceButton onTranscript={handleTranscript} />
                            <InputBox
                                input={input}
                                setInput={setInput}
                                handleSend={handleSend}
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
            
          </div>
        </div>
    </div>
    </PremiumProvider>
  )
}

export default PastpaperChat