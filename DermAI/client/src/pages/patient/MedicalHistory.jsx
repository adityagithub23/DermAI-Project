import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const MedicalHistory = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/patients/history')
      setPredictions(response.data.data)
    } catch (error) {
      toast.error('Failed to load medical history')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // const handleDownloadPDF = (predictionId) => {
  //   window.open(`/api/reports/${predictionId}/pdf`, '_blank')
  // }

  const handleDownloadPDF = async (predictionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You are not logged in!');
        return;
      }
  
      const response = await axios.get(`/api/reports/${predictionId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // required to receive file data
      });
  
      // Create blob and trigger file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DermAI_Report_${predictionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      toast.error('Failed to download report. Check console for details.');
    }
  };
  

  const handleShareWithDoctor = (predictionId) => {
    navigate(`/patient/doctors?predictionId=${predictionId}`)
  }

  const handleChatWithDoctor = async (report) => {
    try {
      if (!report.sharedWithDoctors || report.sharedWithDoctors.length === 0) {
        toast.error('Please share the report with a doctor first')
        return
      }
      
      // Get first shared doctor
      const doctorId = report.sharedWithDoctors[0].doctorId?._id || report.sharedWithDoctors[0].doctorId
      
      // Find or create chat
      const response = await axios.post('/api/chats', {
        doctorId: doctorId,
        patientId: null, // Will be set from backend
        predictionId: report._id
      })
      
      navigate(`/patient/chats?chatId=${response.data.data._id}`)
    } catch (error) {
      toast.error('Failed to open chat')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical History</h1>
          <p className="text-gray-600">View all your past skin disease predictions</p>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No predictions yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading a skin lesion image for analysis</p>
            <button
              onClick={() => navigate('/patient/predict')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Upload Image
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {predictions.map((prediction) => (
              <div
                key={prediction._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${prediction.imageUrl}`}
                      alt="Skin lesion"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>

                  {/* Prediction Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {prediction.prediction.disease.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center">
                            <span className="text-gray-600 text-sm mr-2">Confidence:</span>
                            <span className="font-bold text-blue-600">
                              {prediction.prediction.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            prediction.prediction.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                            prediction.prediction.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {prediction.prediction.riskLevel.replace('_', ' ')} RISK
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(prediction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Symptoms if available */}
                    {prediction.symptoms && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Symptoms: </span>
                          {prediction.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Shared with doctors */}
                    {prediction.sharedWithDoctors?.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-700">Shared with:</span>
                        {prediction.sharedWithDoctors.map((share, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            ✓ Dr. {share.doctorId?.firstName} {share.doctorId?.lastName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => handleDownloadPDF(prediction._id)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                      >
                        📄 Download PDF
                      </button>
                      {prediction.sharedWithDoctors?.length > 0 ? (
                        <button
                          onClick={() => handleChatWithDoctor(prediction)}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                        >
                          💬 Chat with Doctor
                        </button>
                      ) : (
                        <button
                          onClick={() => handleShareWithDoctor(prediction._id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                        >
                          📤 Share with Doctor
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/patient/predict?view=${prediction._id}`)}
                        className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition font-medium text-sm"
                      >
                        👁️ Re-Examine
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalHistory
