import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import ChatWhatsApp from '../../components/ChatWhatsApp'

const SharedReports = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showChats, setShowChats] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    
    // Listen for notification click event to open chat
    const handleOpenChat = () => {
      setShowChats(true)
    }
    window.addEventListener('openDoctorChat', handleOpenChat)
    
    return () => {
      window.removeEventListener('openDoctorChat', handleOpenChat)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/doctors/dashboard')
      console.log('Dashboard API response:', response.data)
      if (response.data.success) {
        console.log('Dashboard data received:', response.data.data)
        console.log('Shared reports count:', response.data.data?.sharedReports?.length || 0)
        setDashboardData(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to load shared reports')
      }
    } catch (error) {
      console.error('Shared reports error:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to load shared reports')
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
  


  const handleViewReport = async (reportId) => {
    try {
      const response = await axios.get(`/api/predictions/${reportId}`)
      setSelectedReport(response.data.data)
    } catch (error) {
      toast.error('Failed to load report')
      console.error(error)
    }
  }

  const handleChatWithPatient = async (report) => {
    try {
      // Find or create chat
      const response = await axios.post('/api/chats', {
        doctorId: null, // Will be set from backend
        patientId: report.patientId._id || report.patientId,
        predictionId: report._id
      })
      
      // Open chat interface
      setShowChats(true)
    } catch (error) {
      toast.error('Failed to open chat')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
                  👨‍⚕️
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Shared Reports
                </h1>
                <p className="text-gray-600 italic">Your Skin, Our AI – Diagnose with Confidence</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {dashboardData?.chats && dashboardData.chats.length > 0 && (
                <button
                  onClick={() => setShowChats(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium relative"
                >
                  💬 Chats
                  {dashboardData.chats.some(c => (c.doctorUnreadCount || 0) > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {dashboardData.chats.reduce((sum, c) => sum + (c.doctorUnreadCount || 0), 0)}
                    </span>
                  )}
                </button>
              )}
              <Link
                to="/doctor/profile"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">
              {dashboardData?.totalReports || dashboardData?.sharedReports?.length || 0}
            </div>
            <div className="text-gray-600 mt-2">Total Reports Received</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-red-600">
              {dashboardData?.sharedReports?.filter(
                (r) => {
                  const riskLevel = r.prediction?.riskLevel || r.riskLevel;
                  return riskLevel === 'HIGH';
                }
              ).length || 0}
            </div>
            <div className="text-gray-600 mt-2">High Risk Cases</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {dashboardData?.sharedReports?.filter(
                (r) => {
                  const riskLevel = r.prediction?.riskLevel || r.riskLevel;
                  return riskLevel === 'MODERATE';
                }
              ).length || 0}
            </div>
            <div className="text-gray-600 mt-2">Moderate Risk Cases</div>
          </div>
        </div>

        {/* Shared Reports Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Reports Shared by Patients</h2>
          
          {!dashboardData?.sharedReports || dashboardData.sharedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No shared reports</h3>
              <p className="text-gray-600">Patients will share reports with you here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.sharedReports.map((report) => {
                const patient = report.patientId
                // The prediction data is in report.prediction object
                const prediction = report.prediction || {
                  disease: 'Unknown',
                  percentage: 0,
                  riskLevel: 'MODERATE'
                }
                
                console.log('Rendering report:', {
                  reportId: report._id,
                  patient: patient?.firstName,
                  prediction: prediction
                })
                
                return (
                  <div
                    key={report._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* Patient Info */}
                      <div className="flex-shrink-0 flex items-center space-x-3">
                        {patient?.profilePicture ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${patient.profilePicture}`}
                            alt="Patient Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                            👤
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {patient?.firstName} {patient?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Shared on: {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Report Summary */}
                      <div className="flex-1">
                        <p className="font-semibold">
                          Predicted Disease:{' '}
                          <span className="font-normal text-gray-700">
                            {prediction?.disease?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Confidence: {prediction?.percentage?.toFixed(1) || 'N/A'}%
                        </p>
                        {prediction?.riskLevel && (
                          <span
                            className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              prediction.riskLevel === 'HIGH'
                                ? 'bg-red-100 text-red-800'
                                : prediction.riskLevel === 'MODERATE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {prediction.riskLevel.replace('_', ' ')} RISK
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewReport(report._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleChatWithPatient(report)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          💬 Chat
                        </button>
                        {/* <a
                          href={`/api/reports/${report._id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium inline-block"
                        >
                          📄 PDF
                        </a> */}
                        <button
  onClick={() => handleDownloadPDF(report._id)}
  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
>
  📄 PDF
</button>

                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Report</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              {selectedReport.imageUrl && (
                <div>
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${selectedReport.imageUrl}`}
                    alt="Skin Lesion"
                    className="w-full rounded-lg mb-4"
                  />
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {selectedReport.prediction?.disease?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                  </h3>
                  
                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Confidence Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedReport.prediction?.percentage?.toFixed(1) || 'N/A'}%
                      </p>
                    </div>
                    {selectedReport.prediction?.riskLevel && (
                      <div className={`p-3 rounded-lg ${
                        selectedReport.prediction.riskLevel === 'HIGH' ? 'bg-red-50' :
                        selectedReport.prediction.riskLevel === 'MODERATE' ? 'bg-yellow-50' :
                        'bg-green-50'
                      }`}>
                        <p className="text-xs text-gray-600 mb-1">Risk Level</p>
                        <p className={`text-lg font-semibold ${
                          selectedReport.prediction.riskLevel === 'HIGH' ? 'text-red-600' :
                          selectedReport.prediction.riskLevel === 'MODERATE' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {selectedReport.prediction.riskLevel.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* All Predictions */}
                  {selectedReport.allPredictions && selectedReport.allPredictions.length > 1 && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-sm mb-2 text-gray-700">Top Predictions:</p>
                      <div className="space-y-2">
                        {selectedReport.allPredictions.slice(0, 3).map((pred, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{idx + 1}. {pred.disease.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-800">{pred.percentage.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  {selectedReport.symptoms && (
                    <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-sm mb-2 text-gray-700">Reported Symptoms:</p>
                      <p className="text-sm text-gray-600">{selectedReport.symptoms}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedReport.recommendation && (
                    <div className="mb-4 space-y-3">
                      {selectedReport.recommendation.riskMessage && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-yellow-800">⚠️ Risk Assessment:</p>
                          <p className="text-sm text-yellow-700">{selectedReport.recommendation.riskMessage}</p>
                        </div>
                      )}
                      {selectedReport.recommendation.diseaseInfo && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-blue-800">ℹ️ Condition Information:</p>
                          <p className="text-sm text-blue-700">{selectedReport.recommendation.diseaseInfo}</p>
                        </div>
                      )}
                      {selectedReport.recommendation.generalAdvice && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                          <p className="font-semibold text-sm mb-1 text-green-800">💡 General Advice:</p>
                          <p className="text-sm text-green-700">{selectedReport.recommendation.generalAdvice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-4">
                    Analyzed on {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDownloadPDF(selectedReport._id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      handleChatWithPatient(selectedReport);
                      setSelectedReport(null);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Chat with Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-like Chat Interface */}
      {showChats && (
        <ChatWhatsApp 
          chats={dashboardData?.chats || []} 
          onClose={() => setShowChats(false)} 
        />
      )}
    </div>
  )
}

export default SharedReports
