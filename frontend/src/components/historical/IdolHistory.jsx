import React, { useState, useEffect } from 'react'
import Table from '../Table'
import Heading2 from '../Heading2'
import ReviewButton from '../buttons/ReviewButton'
import DeleteButton from '../buttons/DeleteButton'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SuccessMessage from '../messages/SuccessMessage'
import ConfimationModal from '../ConfimationModal'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const IdolHistory = () => {

    const [titles, setTitles] = useState([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState("")
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [chatToDelete, setChatToDelete] = useState(null)

    const navigate = useNavigate()
  
    const headers = ['ID', 'Date & Time', 'Title', 'Edit']

    useEffect (() => {
      getChatTitles()
    }, [])

    const getChatTitles = async () => {
      setLoading(true)

      try {
        const response = await axios.get(`${apiBaseUrl}/historical/get_chat_titles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            })
        
            if (response.data) {
              setTitles(response.data)
            } else {
              console.log("Error fetching chat history")
            }
      }
      catch (err) {
        console.error(err)
      }
      finally {
        setLoading(false)
      }
    }

    const formatDateTime = (datetime) => {
      const date = new Date(datetime)

      const options = {
        timeZone: 'Asia/Colombo', // Sri Lanka's time zone
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Use 24-hour format
      };

      return date.toLocaleDateString('en-SL', options)
    }

    const handleReview = (chat_id) => {
      console.log(chat_id)
      navigate(`/legend/${chat_id}`)

    }

    const softDeleteChatSession = async (chat_id) => {
      setSuccess('')
      try {
        const response = await axios.delete(`${apiBaseUrl}/historical/soft_delete_chat/${chat_id}/`, {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        })
        setSuccess("Chat session is deleted successfully")
        getChatTitles()
      }
      catch (error) {
        console.error('Error deleting chat session:', error);
      }
      
    }

    const handleDeleteButton = async (chat_id) => {
      setChatToDelete(chat_id)
      setShowDeleteConfirmation(true)
    }

    const handleDeleteConfirm = async () => {
      try{
        if (chatToDelete) {
          await softDeleteChatSession(chatToDelete)
        }
        setChatToDelete(null)
        setShowDeleteConfirmation(false)
      }
      catch (error) {
        console.error('Error deleting chat:', error);
      }
    }

    const data = titles.map((title, index) => [
      index + 1,
      formatDateTime(title.chat_started_at),
      title.chat_title,
      <div className='flex'>
        <ReviewButton onClick={() => handleReview(title.chat_id)} />
        <DeleteButton onClick={() => handleDeleteButton(title.chat_id)} />
      </div>
    ])

  return (
    <div className='flex flex-col h-screen max-w-4xl mx-auto'>
    
      {
        success && (
          <SuccessMessage message={success} />
        )
      }

      <div className='sm:mt-16 mt-24'>
          <Heading2 text="Chat History" />
          <div className='h-[550px] px-4 py-2 overflow-y-auto scrollbar scrollbar-thumb-gray-400 scrollbar-track-white'>
            <Table headers={headers} data={data} />
          </div>
      </div>

      {
        showDeleteConfirmation && (
          <ConfimationModal
            isOpen={setShowDeleteConfirmation}
            onClose = {() => setShowDeleteConfirmation(false)}
            onConfirm = {handleDeleteConfirm}
            message = "Are you sure you want to delete this chat session?"
            confirmText = "yes"
            cancelText = "No" 
          />
        )
      }

    </div>
  )
}

export default IdolHistory