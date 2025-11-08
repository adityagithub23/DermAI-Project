import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const PredictionPage = () => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) {
      toast.error('Please select an image')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('symptoms', symptoms)

      const response = await axios.post('/api/predictions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setPrediction(response.data.data)
      toast.success('Prediction completed!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleShareWithDoctor = async (doctorId) => {
    try {
      const response = await axios.post(`/api/predictions/${prediction._id}/share`, { doctorId })
      toast.success('Report shared successfully! The doctor can now view it in their dashboard. 📤')
      
      // Refresh prediction to show updated shared list
      const updatedResponse = await axios.get(`/api/predictions/${prediction._id}`)
      setPrediction(updatedResponse.data.data)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to share report'
      toast.error(errorMessage)
    }
  }

  const handleDownloadPDF = () => {
    window.open(`/api/reports/${prediction._id}/pdf`, '_blank')
  }

  const resetForm = () => {
    setImage(null)
    setImagePreview(null)
    setSymptoms('')
    setPrediction(null)
  }

  if (prediction) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Prediction Results</h2>
                <p className="text-sm text-blue-600 italic mt-1">Your Skin, Our AI – Diagnose with Confidence</p>
              </div>
              <button
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-800"
              >
                New Prediction
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Uploaded"
                    className="w-full rounded-lg mb-4"
                  />
                )}
              </div>

              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {prediction.prediction.disease.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                  
                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Confidence Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {prediction.prediction.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      prediction.prediction.riskLevel === 'HIGH' ? 'bg-red-50' :
                      prediction.prediction.riskLevel === 'MODERATE' ? 'bg-yellow-50' :
                      'bg-green-50'
                    }`}>
                      <p className="text-xs text-gray-600 mb-1">Risk Level</p>
                      <p className={`text-lg font-semibold ${
                        prediction.prediction.riskLevel === 'HIGH' ? 'text-red-600' :
                        prediction.prediction.riskLevel === 'MODERATE' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {prediction.prediction.riskLevel.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* All Predictions */}
                  {prediction.allPredictions && prediction.allPredictions.length > 1 && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-sm mb-2 text-gray-700">Top Predictions:</p>
                      <div className="space-y-2">
                        {prediction.allPredictions.slice(0, 3).map((pred, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{idx + 1}. {pred.disease.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-800">{pred.percentage.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  {prediction.symptoms && (
                    <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-sm mb-2 text-gray-700">Reported Symptoms:</p>
                      <p className="text-sm text-gray-600">{prediction.symptoms}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {prediction.recommendation && (
                    <div className="mb-4 space-y-3">
                      {prediction.recommendation.riskMessage && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-yellow-800">⚠️ Risk Assessment:</p>
                          <p className="text-sm text-yellow-700">{prediction.recommendation.riskMessage}</p>
                        </div>
                      )}
                      {prediction.recommendation.diseaseInfo && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-blue-800">ℹ️ Condition Information:</p>
                          <p className="text-sm text-blue-700">{prediction.recommendation.diseaseInfo}</p>
                        </div>
                      )}
                      {prediction.recommendation.generalAdvice && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-green-800">💡 General Advice:</p>
                          <p className="text-sm text-green-700">{prediction.recommendation.generalAdvice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-4">
                    Analyzed on {new Date(prediction.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => navigate('/patient/history')}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>

            {/* Share with Doctor Section */}
            <div className="mt-6 pt-6 border-t">
              <ShareDoctorSection
                predictionId={prediction._id}
                onShare={handleShareWithDoctor}
                alreadyShared={prediction.sharedWithDoctors?.map(s => s.doctorId?._id || s.doctorId) || []}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Upload Skin Lesion Image</h2>
            <p className="text-blue-600 italic font-semibold">Your Skin, Our AI – Diagnose with Confidence</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-64 mx-auto mb-4 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null)
                        setImagePreview(null)
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer"
                    >
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms (Optional)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe any symptoms you're experiencing..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !image}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const ShareDoctorSection = ({ predictionId, onShare, alreadyShared = [] }) => {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true)
        const response = await axios.get('/api/doctors')
        setDoctors(response.data.data)
      } catch (error) {
        console.error('Failed to fetch doctors:', error)
        toast.error('Failed to load doctors list')
      } finally {
        setLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  const handleShare = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor')
      return
    }
    
    // Check if already shared
    const doctorId = selectedDoctor
    if (alreadyShared.includes(doctorId)) {
      toast.warning('This report is already shared with this doctor')
      return
    }
    
    setLoading(true)
    try {
      await onShare(doctorId)
      setSelectedDoctor('')
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false)
    }
  }

  const availableDoctors = doctors.filter(doctor => {
    const doctorId = doctor._id || doctor.id
    return !alreadyShared.includes(doctorId)
  })

  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-900">Share Report with Doctor</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select a doctor from the list to share this report. They will be able to view it in their dashboard.
      </p>
      
      {loadingDoctors ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading doctors...</p>
        </div>
      ) : availableDoctors.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">
            {doctors.length === 0 
              ? 'No doctors are currently registered. Check back later!' 
              : 'All available doctors have already been shared this report.'}
          </p>
          <Link to="/doctors" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
            Browse all doctors →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Select a doctor...</option>
            {availableDoctors.map((doctor) => (
              <option key={doctor._id || doctor.id || doctor.email} value={doctor._id || doctor.id || doctor.email}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General'}
                {doctor.consultationFees > 0 && ` ($${doctor.consultationFees})`}
              </option>
            ))}
          </select>
          <button
            onClick={handleShare}
            disabled={loading || !selectedDoctor}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sharing...
              </span>
            ) : (
              'Share Report'
            )}
          </button>
        </div>
      )}
      
      {alreadyShared.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-sm font-medium text-gray-700 mb-2">Already shared with:</p>
          <div className="flex flex-wrap gap-2">
            {doctors
              .filter(doctor => alreadyShared.includes(doctor._id || doctor.id))
              .map((doctor) => (
                <span key={doctor._id || doctor.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  ✓ Dr. {doctor.firstName} {doctor.lastName}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionPage

