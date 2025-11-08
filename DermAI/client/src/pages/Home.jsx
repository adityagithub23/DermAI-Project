import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🩺 DermAI</h1>
          <p className="text-2xl font-semibold mb-2 italic">Your Skin, Our AI – Diagnose with Confidence</p>
          <p className="text-xl mb-8 text-blue-100">AI-Powered Skin Disease Prediction System</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Get instant skin disease predictions using advanced machine learning technology. 
            Share reports with doctors and manage your medical history seamlessly.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/patient/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
              >
                Get Started as Patient
              </Link>
              <Link
                to="/doctor/signup"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
              >
                Register as Doctor
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/about"
            className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 hover:text-blue-600 font-medium"
          >
            About Us
          </Link>
          <Link
            to="/doctors"
            className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 hover:text-blue-600 font-medium"
          >
            Our Doctors
          </Link>
          <Link
            to="/help"
            className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 hover:text-blue-600 font-medium"
          >
            Help Center
          </Link>
          <Link
            to="/contact"
            className="bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition text-gray-700 hover:text-blue-600 font-medium"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold mb-2">AI Prediction</h3>
            <p className="text-gray-600">
              Upload skin lesion images and get instant predictions with confidence scores
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Medical History</h3>
            <p className="text-gray-600">
              Keep track of all your predictions and access them anytime
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Doctor Connect</h3>
            <p className="text-gray-600">
              Share reports with registered doctors and get professional consultation
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 DermAI. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">
            This AI analysis is for informational purposes only and should not replace professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home

