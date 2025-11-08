import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const Chat = ({ chatId, onClose }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    // Prevent multiple socket connections
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected, reusing connection')
      socketRef.current.emit('join_chat', chatId)
      fetchMessages()
      return
    }

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
      forceNew: false // Reuse existing connection if available
    })

    socketRef.current = newSocket
    let isConnected = false

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server')
      isConnected = true
      if (chatId) {
        newSocket.emit('join_chat', chatId)
      }
      fetchMessages()
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from chat server:', reason)
      isConnected = false
      // Only log unexpected disconnects
      if (reason !== 'io client disconnect' && reason !== 'transport close') {
        console.log('Unexpected disconnect, will attempt reconnection')
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected to chat server (attempt', attemptNumber + ')')
      if (chatId) {
        newSocket.emit('join_chat', chatId)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('new_message', (data) => {
      if (data.chatId === chatId || data.chatId === chatId.toString()) {
        setMessages(prev => {
          // Prevent duplicate messages
          const exists = prev.some(msg => msg._id === data.message._id)
          if (exists) return prev
          return [...prev, data.message]
        })
        scrollToBottom()
      }
    })

    newSocket.on('user_typing', (data) => {
      if (data.chatId === chatId && data.userId !== user.id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName]
          }
          return prev
        })
      }
    })

    newSocket.on('user_stopped_typing', (data) => {
      if (data.chatId === chatId) {
        setTypingUsers(prev => prev.filter(name => name !== data.userName))
      }
    })

    newSocket.on('messages_read', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => prev.map(msg => {
          const senderIdStr = msg.senderId._id?.toString() || msg.senderId?.toString() || msg.senderId
          if (!msg.read && data.userId !== senderIdStr && data.userId !== user.id) {
            return { ...msg, read: true, readAt: new Date() }
          }
          return msg
        }))
      }
    })

    setSocket(newSocket)

    // Cleanup only on unmount or when chatId changes significantly
    return () => {
      // Don't disconnect if we're just changing chats - only on unmount
      if (chatId) {
        newSocket.emit('leave_chat', chatId)
      }
      // Don't disconnect the socket here - let it stay connected
      // Only disconnect when component is actually unmounting
    }
  }, [chatId]) // Only depend on chatId, not user object

  useEffect(() => {
    if (chatId && socket && socket.connected) {
      socket.emit('join_chat', chatId)
      fetchMessages()
    }
  }, [chatId, socket?.connected]) // Rejoin when chat changes

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!chatId) return
    try {
      const response = await axios.get(`/api/chats/${chatId}`)
      setMessages(response.data.data.messages || [])
      scrollToBottom()
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTyping = () => {
    if (!isTyping && socket && chatId) {
      setIsTyping(true)
      socket.emit('typing', { chatId })
    }

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (socket && chatId) {
        socket.emit('stop_typing', { chatId })
      }
    }, 1000)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !chatId) return

    const messageText = newMessage.trim()
    setNewMessage('')
    
    setIsTyping(false)
    if (socket) {
      socket.emit('stop_typing', { chatId })
    }

    try {
      await axios.post(`/api/chats/${chatId}/messages`, {
        message: messageText
      })
      // Message will be received via socket event
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageText) // Restore message on error
      toast.error('Failed to send message. Please try again.')
    }
  }

  const handleMarkRead = () => {
    if (socket && chatId) {
      socket.emit('mark_read', { chatId })
    }
  }

  useEffect(() => {
    if (socket && chatId && messages.length > 0) {
      // Debounce mark as read to avoid too many calls
      const timer = setTimeout(() => {
        handleMarkRead()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [messages.length, socket, chatId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current && socketRef.current.connected) {
        console.log('Component unmounting, disconnecting socket')
        if (chatId) {
          socketRef.current.emit('leave_chat', chatId)
        }
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold">Chat</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => {
            const isOwn = message.senderId._id?.toString() === user.id || 
                         message.senderId.toString() === user.id ||
                         (message.senderId && message.senderId.toString && message.senderId.toString() === user.id)
            const senderName = message.senderId.firstName 
              ? `${message.senderId.firstName} ${message.senderId.lastName || ''}`.trim()
              : 'Unknown User'

            return (
              <div
                key={message._id || idx}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwn && message.senderId.profilePicture && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${message.senderId.profilePicture}`}
                      alt={senderName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className={`px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1">{senderName}</p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center justify-end mt-1 space-x-2">
                      <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && (
                        <span className={`text-xs ${message.read ? 'text-blue-100' : 'text-gray-300'}`}>
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat
