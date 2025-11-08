import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import ChatWhatsApp from '../../components/ChatWhatsApp'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
      console.log('Dashboard data:', response.data)
      if (response.data.success) {
        setDashboardData(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error(error.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = (predictionId) => {
    window.open(`/api/reports/${predictionId}/pdf`, '_blank')
  }

  const handleViewReport = async (reportId) => {
    try {
      const response = await axios.get(`/api/predictions/${reportId}`)
      setSelectedReport(response.data.data)
    } catch (error) {
      toast.error('Failed to load report')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

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
                  👨‍⚕️
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, Dr. {user?.firstName} {user?.lastName}!
                </h1>
                <p className="text-gray-600 italic">Your Skin, Our AI – Diagnose with Confidence</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowChats(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium relative"
              >
                💬 Chats
                {dashboardData?.chats && dashboardData.chats.some(c => (c.doctorUnreadCount || 0) > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {dashboardData.chats.reduce((sum, c) => sum + (c.doctorUnreadCount || 0), 0)}
                  </span>
                )}
              </button>
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
              {dashboardData?.totalReports || 0}
            </div>
            <div className="text-gray-600 mt-2">Total Reports Received</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">
              {dashboardData?.sharedReports?.filter(
                (r) => r.prediction?.riskLevel === 'HIGH'
              ).length || 0}
            </div>
            <div className="text-gray-600 mt-2">High Risk Cases</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600">
              {dashboardData?.sharedReports?.filter(
                (r) => r.prediction?.riskLevel === 'MODERATE'
              ).length || 0}
            </div>
            <div className="text-gray-600 mt-2">Moderate Risk Cases</div>
          </div>
        </div>

        {/* Reports Shared by Patients Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Reports Shared by Patients</h2>
          
          {!dashboardData?.sharedReports || dashboardData.sharedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No shared reports</h3>
              <p className="text-gray-600">Patients will share reports with you here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.sharedReports.map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-3">
                      {report.patientId?.profilePicture ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${report.patientId.profilePicture}`}
                          alt="Patient"
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                          👤
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.patientId?.firstName} {report.patientId?.lastName}
                        </h3>
                        {report.patientId?.email && (
                          <p className="text-sm text-gray-600">{report.patientId.email}</p>
                        )}
                        {report.patientId?.phone && (
                          <p className="text-sm text-gray-600">{report.patientId.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Report Info */}
                    <div className="flex-1">
                      <div className="mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {report.prediction?.disease?.replace(/_/g, ' ').toUpperCase() || 'Unknown Disease'}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Confidence: <span className="font-bold text-blue-600">
                              {report.prediction?.percentage?.toFixed(1) || 'N/A'}%
                            </span>
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.prediction?.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                            report.prediction?.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.prediction?.riskLevel?.replace('_', ' ') || 'UNKNOWN'} RISK
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Shared on {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {report.symptoms && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Symptoms: </span>
                            {report.symptoms}
                          </p>
                        </div>
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
                      <a
                        href={`/api/reports/${report._id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium inline-block"
                      >
                        📄 PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-semibold">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  {selectedReport.prediction.disease.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Confidence Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedReport.prediction.percentage.toFixed(1)}%
                    </p>
                  </div>
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
                </div>
              </div>

              {selectedReport.imageUrl && (
                <div className="mb-6">
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${selectedReport.imageUrl}`}
                    alt="Skin lesion"
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {selectedReport.symptoms && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-sm mb-2">Symptoms:</p>
                  <p className="text-sm text-gray-700">{selectedReport.symptoms}</p>
                </div>
              )}

              {selectedReport.recommendation && (
                <div className="space-y-3">
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

export default DoctorDashboard
