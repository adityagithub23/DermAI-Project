import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🩺 DermAI</h1>
          <p className="text-2xl font-semibold mb-2 italic">Your Skin, Our AI – Diagnose with Confidence</p>
          <p className="text-xl text-blue-100">About Us</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            DermAI is dedicated to making skin disease diagnosis more accessible through the power of artificial intelligence. 
            We believe that everyone deserves access to preliminary health assessments, especially for conditions that can be 
            detected early through visual analysis.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our platform combines state-of-the-art machine learning technology with a user-friendly interface, enabling patients 
            to get instant preliminary assessments of skin lesions and seamlessly connect with qualified dermatologists for 
            professional consultation.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                  🔬
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Upload images of skin lesions and receive instant AI-powered predictions with confidence scores, 
                  helping you understand potential conditions before consulting a doctor.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                  📋
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Medical History Tracking</h3>
                <p className="text-gray-600">
                  Keep a comprehensive record of all your skin analysis reports, making it easy to track changes 
                  over time and share with healthcare providers.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                  👨‍⚕️
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Network</h3>
                <p className="text-gray-600">
                  Connect with registered dermatologists, share your reports securely, and receive professional 
                  medical opinions and recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                  📄
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                <p className="text-gray-600">
                  Generate and download comprehensive PDF reports with disease predictions, confidence scores, 
                  risk assessments, and medical recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Important Disclaimer</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-gray-800 font-semibold mb-2">⚠️ Medical Disclaimer</p>
            <p className="text-gray-700">
              DermAI's AI analysis is for informational and educational purposes only. It is not a substitute for 
              professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare 
              provider with any questions you may have regarding a medical condition. Never disregard professional 
              medical advice or delay in seeking it because of something you have read or seen on this platform.
            </p>
          </div>
          <p className="text-gray-700">
            Our AI predictions should be used as a preliminary screening tool to help guide your decision to consult 
            with a medical professional. The accuracy of predictions depends on image quality, lighting, and the 
            complexity of the condition.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology</h2>
          <p className="text-lg text-gray-700 mb-4">
            DermAI utilizes advanced deep learning models trained on thousands of skin lesion images to provide 
            accurate predictions. Our system continuously learns and improves, ensuring the highest possible accuracy 
            in disease identification.
          </p>
          <p className="text-lg text-gray-700">
            We are committed to maintaining the highest standards of data privacy and security. All your medical 
            information is encrypted and stored securely, and is only accessible to you and the doctors you choose 
            to share it with.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}

export default About

