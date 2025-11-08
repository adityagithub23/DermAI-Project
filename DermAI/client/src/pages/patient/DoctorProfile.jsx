import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import Chat from '../../components/Chat'

const DoctorProfile = () => {
  const { doctorId } = useParams()
  const [searchParams] = useSearchParams()
  const predictionId = searchParams.get('predictionId')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingForm, setRatingForm] = useState({ rating: 5, feedback: '' })
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    fetchDoctorDetails()
  }, [doctorId])

  const fetchDoctorDetails = async () => {
    try {
      const response = await axios.get(`/api/doctors/${doctorId}`)
      setDoctor(response.data.data)
      setRatings(response.data.data.recentRatings || [])
    } catch (error) {
      toast.error('Failed to load doctor details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleShareReport = async () => {
    if (!predictionId) {
      toast.error('No report selected')
      return
    }

    setSharing(true)
    try {
      const response = await axios.post(`/api/predictions/${predictionId}/share`, { doctorId })
      toast.success('Report shared successfully! Chat thread created.')
      
      // Open chat if chatId is returned
      if (response.data.data.chatId) {
        setSelectedChatId(response.data.data.chatId)
        setShowChat(true)
      } else {
        navigate('/patient/history')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share report')
    } finally {
      setSharing(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!ratingForm.rating || ratingForm.rating < 1 || ratingForm.rating > 5) {
      toast.error('Please select a rating between 1 and 5')
      return
    }

    try {
      await axios.post('/api/ratings', {
        doctorId,
        predictionId: predictionId || null,
        rating: ratingForm.rating,
        feedback: ratingForm.feedback
      })
      toast.success('Rating submitted successfully!')
      setShowRatingModal(false)
      setRatingForm({ rating: 5, feedback: '' })
      fetchDoctorDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Doctor not found</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Back
        </button>

        {/* Doctor Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              {doctor.profilePicture ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${doctor.profilePicture}`}
                  alt={doctor.firstName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 text-blue-600 text-5xl flex items-center justify-center">
                  👨‍⚕️
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              {doctor.specialization && (
                <p className="text-xl text-blue-600 mb-4">{doctor.specialization}</p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-2xl mr-3">
                  {'★'.repeat(Math.round(doctor.averageRating || 0))}
                  {'☆'.repeat(5 - Math.round(doctor.averageRating || 0))}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {doctor.averageRating || '0.0'}
                  </p>
                  <p className="text-sm text-gray-600">
                    ({doctor.totalRatings || 0} reviews)
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {doctor.yearsOfExperience > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{doctor.yearsOfExperience}</p>
                    <p className="text-xs text-gray-600">Years Experience</p>
                  </div>
                )}
                {doctor.patientsTreated > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{doctor.patientsTreated.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Patients Treated</p>
                  </div>
                )}
                {doctor.consultationFees > 0 && (
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">${doctor.consultationFees}</p>
                    <p className="text-xs text-gray-600">Consultation Fee</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-gray-600">
                {doctor.email && (
                  <p>📧 {doctor.email}</p>
                )}
                {doctor.phone && (
                  <p>📞 {doctor.phone}</p>
                )}
                {doctor.address && (
                  <p>📍 {doctor.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 mt-6 flex flex-wrap gap-4">
            {predictionId && (
              <button
                onClick={handleShareReport}
                disabled={sharing}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold disabled:opacity-50"
              >
                {sharing ? 'Sharing...' : '📤 Share Report with Doctor'}
              </button>
            )}
            <button
              onClick={() => setShowRatingModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              ⭐ Rate Doctor
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>
          {ratings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to rate this doctor!</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {rating.patientId?.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${rating.patientId.profilePicture}`}
                          alt="Patient"
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          👤
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rating.patientId?.firstName} {rating.patientId?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(rating.rating)}
                      {'☆'.repeat(5 - rating.rating)}
                    </div>
                  </div>
                  {rating.feedback && (
                    <p className="text-gray-700 ml-13">{rating.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Rate Doctor</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex text-4xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                    className="mr-1"
                  >
                    {star <= ratingForm.rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                rows="4"
                value={ratingForm.feedback}
                onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitRating}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false)
                  setRatingForm({ rating: 5, feedback: '' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfile

