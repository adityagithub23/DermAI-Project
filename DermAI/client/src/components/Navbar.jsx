import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Notifications from './Notifications'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications')
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      // Silently fail
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">🩺 DermAI</span>
              <span className="ml-3 text-sm text-gray-600 italic">Your Skin, Our AI – Diagnose with Confidence</span>
            </Link>
            
            {user ? (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {user.role === 'patient' ? (
                  <>
                    <Link
                      to="/patient/dashboard"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/patient/predict"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      Predict
                    </Link>
                    <Link
                      to="/patient/history"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                    >
                      History
                    </Link>
                  </>
                ) : user.role === 'doctor' ? (
                  <Link
                    to="/doctor/shared-reports"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Shared Reports
                  </Link>
                ) : null}
                <Link
                  to="/doctors"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Doctors
                </Link>
              </div>
            ) : (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/about"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/doctors"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Doctors
                </Link>
                <Link
                  to="/help"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Help
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Bell */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Chat Link for Patients */}
                {user.role === 'patient' && (
                  <Link
                    to="/patient/chats"
                    className="text-gray-700 hover:text-blue-600 transition p-2"
                  >
                    <span className="text-2xl">💬</span>
                  </Link>
                )}

                <Link
                  to={user.role === 'patient' ? '/patient/profile' : '/doctor/profile'}
                  className="flex items-center space-x-2 hover:opacity-80 transition"
                >
                  {user.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${user.profilePicture}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                      {user.role === 'doctor' ? '👨‍⚕️' : '👤'}
                    </div>
                  )}
                  <span className="text-gray-700 text-sm font-medium hidden md:inline">
                    {user.firstName} {user.lastName}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/patient/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Patient Login
                </Link>
                <Link
                  to="/doctor/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Doctor Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <Notifications 
          onClose={() => setShowNotifications(false)}
          onOpenChat={() => {
            // This will be handled by the dashboard page
            setShowNotifications(false)
            // If on doctor dashboard, trigger chat opening
            if (window.location.pathname.includes('/doctor/shared-reports')) {
              // Dispatch custom event to open chat
              window.dispatchEvent(new CustomEvent('openDoctorChat'))
            }
          }}
        />
      )}
    </nav>
  )
}

export default Navbar

