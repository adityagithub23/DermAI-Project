import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PatientDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {user?.profilePicture ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${user.profilePicture}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 italic">Your Skin, Our AI – Diagnose with Confidence</p>
              </div>
            </div>
            <Link
              to="/patient/profile"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/patient/predict"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold mb-2">New Prediction</h3>
            <p className="text-gray-600">
              Upload a skin lesion image for AI analysis
            </p>
          </Link>

          <Link
            to="/patient/history"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Medical History</h3>
            <p className="text-gray-600">
              View all your past predictions and reports
            </p>
          </Link>

          <Link
            to="/patient/doctors"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Find Doctors</h3>
            <p className="text-gray-600">
              Browse registered dermatologists
            </p>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/patient/chats"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">My Chats</h3>
            <p className="text-gray-600">
              Chat with doctors about your reports
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              to="/patient/predict"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Start New Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
