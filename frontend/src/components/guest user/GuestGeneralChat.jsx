import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import SendButton from '../buttons/SendButton'
import VoiceButton from '../buttons/VoiceButton'
import BotLogo from '../../assets/images/bot.png'
import { useNavigate } from 'react-router-dom'
import InputBox from '../InputBox'
import ErrorMessage from '../messages/ErrorMessage'
import BotMessage from '../messages/BotMessage'
import UserMessage from '../messages/UserMessage'
import ThinkingMessage from '../messages/thinkingMessage/ThinkingMessage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const GuestGeneralChat = () => {
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [chatCount, setChatCount] = useState(() => {
    return parseInt(localStorage.getItem('guestChatCount') || 0)
  })
  const [showOptionalQuestions, setShowOptionalQuestions] = useState(true)
  
  const navigate = useNavigate()
  const chatContainerRef = useRef(null)

  const initialBotMessage = {
    sender: 'bot',
    text: chatCount < 2 
      ? `Hey! 😊🌟\n\n👋 What can I help you learn or improve in English today?` 
      : `Sign up now to continue chatting and unlock all features! 🌟`,
    time: new Date()
  }

  const optionalQuestions = [
    "How do I write a good introduction for an essay?",
    "What’s the best way to practice writing formal and informal letters?",
    "How do I use linking words to make my writing flow better?",
  ]

  // Initialize messages with the bot's greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialBotMessage])
    }
  }, [chatCount]) // Depend on chatCount to update the message

  // Update localStorage whenever chatCount changes
  useEffect(() => {
    localStorage.setItem('guestChatCount', chatCount.toString())
    if (chatCount >= 2) {
      setShowOptionalQuestions(false)
    }
  }, [chatCount])

  const showSignupPrompt = () => {
    const botMessage = {
      sender: 'bot',
      text: "Sign up now to continue chatting and unlock all features! 🌟",
      time: new Date()
    }
    setMessages(prevMessages => [...prevMessages, botMessage])
  }

  const handleQuestionClick = (question) => {
    if (chatCount >= 2) {
      showSignupPrompt()
      return
    }
    sendMessage(question)
  }

  const sendMessage = async (message) => {
    setError('')
    if (message.trim()) {
      if (chatCount >= 2) {
        showSignupPrompt()
        return
      }

      const newMessage = { sender: 'user', text: message, time: new Date() }
      setMessages(prevMessages => [...prevMessages, newMessage])
      setInput('')
      setShowOptionalQuestions(false)

      setIsThinking(true)

      try {
        const response = await axios.post(`${apiBaseUrl}/guest-user/general-chat/`, {
          user_input: message,
        })

        if (response.data.error) {
          setError(response.data.error)
        } else {
          const botResponse = response.data.response
          setMessages(prevMessages => prevMessages.filter(msg => !msg.isThinking))
          const botMessage = { sender: 'bot', text: botResponse, time: new Date() }
          setMessages(prevMessages => [...prevMessages, botMessage])

          setChatCount(prev => prev + 1)

          if (chatCount === 1) {
            setTimeout(() => {
              showSignupPrompt()
            }, 1000)
          }
        }
      } catch (error) {
        console.error('Error sending message:', error)
        setError("An error occurred while sending your message. Please try again.")
      } finally {
        setIsThinking(false)
      }
    }
  }

  const handleTranscript = (transcript) => {
    setInput(transcript)
    sendMessage(transcript)
  }

  const handleSend = () => {
    sendMessage(input)
  }

  return (
    <div className='flex flex-col h-screen p-4 max-w-4xl sm:mx-auto'>
      <div className='flex justify-end mt-16 sm:mt-16 pt-2 items-center mb-4'>    
        {error && (
          <ErrorMessage message={error} isPersistent={false} />
        )}
      </div>
      
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
          
          {/* Optional Questions */}
          {showOptionalQuestions && chatCount < 2 && (
            <div className='mt-4'>
              <div className='justify-start flex flex-col gap-2 max-w-lg'>
                {optionalQuestions.map((question, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleQuestionClick(question)} 
                    className='p-2 bg-white text-left sm:text-sm text-xs text-primary border border-primary rounded-2xl hover:bg-secondary'
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-row justify-center w-full px-2 sm:px-3 items-center mt-auto sm:mb-0'>
        <VoiceButton 
          onTranscript={handleTranscript} 
          disabled={chatCount >= 2}
        />
        <InputBox 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          disabled={chatCount >= 2}
          placeholder={chatCount >= 2 ? "Sign up to continue chatting!" : "Type your message..."}
        />
        <SendButton 
          onClick={handleSend} 
          disabled={chatCount >= 2}
        />
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

export default GuestGeneralChat