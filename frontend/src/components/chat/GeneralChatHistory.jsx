import React, { useEffect, useState } from 'react'
import Table from '../Table'
import Heading2 from '../Heading2'
import { useChat } from './ChatContext'
import SuccessMessage from '../messages/SuccessMessage'
import DeleteButton from '../buttons/DeleteButton'
import RenameButton from '../buttons/RenameButton'
import ReviewButton from '../buttons/ReviewButton'
import ConfimationModal from '../ConfimationModal'
import { useNavigate } from 'react-router-dom'

const GeneralChatHistory = () => {
    const { chatSession, updateChatSessions, renameChatSession, softDeleteChatSession } = useChat();
    const [editChatSession, setEditChatSession] = useState(null);
    const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [success, setSuccess] = useState('')

    const navigate = useNavigate()

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

    useEffect(() => {
        updateChatSessions();
    }, [updateChatSessions]);

    const handleReviewClick = (chatId) => {
        navigate(`/generalchat/${chatId}`);
    };

    const handleDeleteClick = async (e, chatId) => {
        e.stopPropagation();
        setChatToDelete(chatId);
        setIsDeleteChatModalOpen(true);
    }

    const handleDeleteConfirm = async () => {
        setSuccess('')
        try {
            if (chatToDelete) {
                await softDeleteChatSession(chatToDelete);
                updateChatSessions();
            }
            setChatToDelete(null);
            setIsDeleteChatModalOpen(false);
            setSuccess("Chat session deleted successfully")
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const handleRenameChatSession = (e, chatId) => {
        e.stopPropagation();
        setEditChatSession(chatId);
    };

    const handleRename = async (chatId, newTitle) => {
        setSuccess('')
        if (newTitle.trim() !== '') {
            try {
                await renameChatSession(chatId, newTitle);
                setSuccess('Successfully renamed')
                setEditChatSession(null);
                updateChatSessions();
            } catch (error) {
                console.error('Error renaming chat:', error);
            }
        } else {
            console.log('New title is empty, not renaming');
        }
    };


    const headers = ['ID', 'Date & Time', 'Title', 'Edit']

    const data = chatSession.map((session, index) => [
        index + 1,
        formatDateTime(session.chat_started_at),
        editChatSession === session.chat_id ? (
            <input
                type="text"
                defaultValue={session.chat_title}
                onBlur={(e) => handleRename(session.chat_id, e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleRename(session.chat_id, e.target.value);
                    }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
            />
        ) : (
            session.chat_title
        ),
        <div className='flex'>
            <ReviewButton onClick={() => handleReviewClick(session.chat_id)} />
            <RenameButton onClick={(e) => handleRenameChatSession(e, session.chat_id)} />
            <DeleteButton onClick={(e) => handleDeleteClick(e, session.chat_id)} />
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
            {
                isDeleteChatModalOpen && (
                <ConfimationModal
                    isOpen={isDeleteChatModalOpen}
                    onClose = {() => setIsDeleteChatModalOpen(false)}
                    onConfirm = {handleDeleteConfirm}
                    message = "Are you sure you want to delete this chat session?"
                    confirmText = "yes"
                    cancelText = "No"
                />
                )
            }
            </div>
        </div>
    </div>
  )
}

export default GeneralChatHistory