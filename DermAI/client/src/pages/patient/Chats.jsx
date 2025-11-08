import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import ChatWhatsApp from '../../components/ChatWhatsApp'

const Chats = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showChats, setShowChats] = useState(false)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats')
      const fetchedChats = response.data.data || []
      setChats(fetchedChats)
      
      // Check for chatId in URL params after fetching chats
      const params = new URLSearchParams(window.location.search)
      const chatId = params.get('chatId')
      
      // If there's a chatId in URL or we have chats, open the chat interface
      if (chatId || fetchedChats.length > 0) {
        setShowChats(true)
      }
    } catch (error) {
      toast.error('Failed to load chats')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Chats</h1>
            <p className="text-gray-600">Chat with doctors about your shared reports</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">No chats yet</h3>
            <p className="text-gray-600">
              Start a conversation by sharing a report with a doctor
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Only one return statement from here
  return (
    <>
      {showChats ? (
        <ChatWhatsApp 
          chats={chats}
          onClose={() => setShowChats(false)}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Chats</h1>
              <p className="text-gray-600">Chat with doctors about your shared reports</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">
                You have {chats.length} active chats
              </h3>
              <button
                onClick={() => setShowChats(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Open Chats
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chats
