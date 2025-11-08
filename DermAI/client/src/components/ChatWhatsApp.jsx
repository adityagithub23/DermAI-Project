import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const ChatWhatsApp = ({ chats, onClose }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const socketRef = useRef(null)

  // Initialize socket connection once and keep it stable
  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Prevent multiple socket connections
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected, reusing connection')
      if (chats && chats.length > 0) {
        chats.forEach(chat => {
          if (chat._id) {
            socketRef.current.emit('join_chat', chat._id)
          }
        })
      }
      if (selectedChat?._id) {
        socketRef.current.emit('join_chat', selectedChat._id)
      }
      setSocket(socketRef.current)
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
      // Join all chat rooms when connected
      if (chats && chats.length > 0) {
        chats.forEach(chat => {
          if (chat._id) {
            newSocket.emit('join_chat', chat._id)
          }
        })
      }
      if (selectedChat?._id) {
        newSocket.emit('join_chat', selectedChat._id)
      }
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
      if (chats && chats.length > 0) {
        chats.forEach(chat => {
          if (chat._id) {
            newSocket.emit('join_chat', chat._id)
          }
        })
      }
      if (selectedChat?._id) {
        newSocket.emit('join_chat', selectedChat._id)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('new_message', (data) => {
      if (data.chatId === selectedChat?._id) {
        setMessages(prev => {
          // Prevent duplicate messages
          const exists = prev.some(msg => msg._id === data.message._id)
          if (exists) return prev
          return [...prev, data.message]
        })
        scrollToBottom()
      }
      // Update chat list last message (if we were tracking that)
    })

    newSocket.on('user_typing', (data) => {
      if (data.chatId === selectedChat?._id && data.userId !== user.id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName]
          }
          return prev
        })
      }
    })

    newSocket.on('user_stopped_typing', (data) => {
      if (data.chatId === selectedChat?._id) {
        setTypingUsers(prev => prev.filter(name => name !== data.userName))
      }
    })

    newSocket.on('messages_read', (data) => {
      if (data.chatId === selectedChat?._id) {
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

    // Cleanup only on unmount
    return () => {
      // Don't disconnect on every re-render - only on actual unmount
      // The socket will stay connected for better UX
    }
  }, [user?.id]) // Only depend on user.id, not entire user object or chats to avoid reconnection

  // Join chat rooms when chats are loaded or selectedChat changes
  useEffect(() => {
    if (socket && socket.connected && chats && chats.length > 0) {
      chats.forEach(chat => {
        if (chat._id) {
          socket.emit('join_chat', chat._id)
        }
      })
    }
  }, [socket, chats]) // Join rooms when chats load

  useEffect(() => {
    if (selectedChat?._id && socket && socket.connected) {
      socket.emit('join_chat', selectedChat._id)
      fetchMessages()
      // Mark messages as read when opening chat
      const timer = setTimeout(() => {
        if (socket && socket.connected) {
          socket.emit('mark_read', { chatId: selectedChat._id })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [selectedChat?._id, socket?.connected]) // Only when chat changes or socket reconnects

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!selectedChat) return
    try {
      const response = await axios.get(`/api/chats/${selectedChat._id}`)
      setMessages(response.data.data.messages || [])
      scrollToBottom()
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTyping = () => {
    if (!isTyping && socket && selectedChat) {
      setIsTyping(true)
      socket.emit('typing', { chatId: selectedChat._id })
    }

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (socket && selectedChat) {
        socket.emit('stop_typing', { chatId: selectedChat._id })
      }
    }, 1000)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !selectedChat) return

    const messageText = newMessage.trim()
    setNewMessage('')
    
    setIsTyping(false)
    if (socket) {
      socket.emit('stop_typing', { chatId: selectedChat._id })
    }

    try {
      await axios.post(`/api/chats/${selectedChat._id}/messages`, {
        message: messageText
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageText) // Restore message on error
    }
  }

  const handleMarkRead = () => {
    if (socket && selectedChat) {
      socket.emit('mark_read', { chatId: selectedChat._id })
    }
  }

  useEffect(() => {
    if (socket && selectedChat && messages.length > 0) {
      // Debounce mark as read to avoid too many calls
      const timer = setTimeout(() => {
        handleMarkRead()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [messages.length, socket, selectedChat?._id]) // Only trigger on message count change

  if (!chats || chats.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
            <h2 className="text-xl font-semibold">Chats</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600">No chats available</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Chat List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col overflow-hidden bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900">Patient Chats</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => {
                const otherUser = user.role === 'doctor' ? chat.patientId : chat.doctorId
                const unreadCount = chat.doctorUnreadCount || 0
                const isSelected = selectedChat?._id === chat._id

                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {otherUser?.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${otherUser.profilePicture}`}
                          alt={otherUser.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                          👤
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 truncate">
                            {otherUser?.firstName} {otherUser?.lastName}
                          </p>
                          {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        )}
                        {chat.lastMessageAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Panel - Active Chat */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="bg-gray-200 p-4 flex items-center space-x-3 border-b border-gray-300">
                  {selectedChat.patientId?.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${selectedChat.patientId.profilePicture}`}
                      alt={selectedChat.patientId.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      👤
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedChat.patientId?.firstName} {selectedChat.patientId?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isOwn && (
                            <p className="text-xs text-gray-500 mb-1">{senderName}</p>
                          )}
                          <div className={`px-4 py-2 rounded-lg ${
                            isOwn 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              <span className={`text-xs ${message.read ? 'text-blue-600' : 'text-gray-400'}`}>
                                {message.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                        <p className="text-sm text-gray-600 italic">
                          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-300 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping()
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-600">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWhatsApp


