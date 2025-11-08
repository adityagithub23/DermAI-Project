import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorSelection = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [searchParams] = useSearchParams()
  const predictionId = searchParams.get('predictionId')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors')
      setDoctors(response.data.data)
    } catch (error) {
      toast.error('Failed to load doctors')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSpecialization = 
      !filterSpecialization || 
      (doctor.specialization && doctor.specialization.toLowerCase().includes(filterSpecialization.toLowerCase()))

    return matchesSearch && matchesSpecialization
  })

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Doctor</h1>
          <p className="text-gray-600">
            {predictionId ? 'Choose a doctor to share your report with' : 'Browse and select a doctor for consultation'}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Doctors
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Search by name or specialization..."
              />
            </div>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Specialization
              </label>
              <select
                id="specialization"
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">No doctors found</h3>
            <p className="text-gray-600">
              {searchTerm || filterSpecialization 
                ? 'Try adjusting your search or filter criteria'
                : 'No doctors are currently registered'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id || doctor.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    {doctor.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${doctor.profilePicture}`}
                        alt={doctor.firstName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl flex items-center justify-center mr-4">
                        👨‍⚕️
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {doctor.yearsOfExperience > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📅</span>
                        <span>{doctor.yearsOfExperience} years of experience</span>
                      </div>
                    )}
                    {doctor.patientsTreated > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">👥</span>
                        <span>{doctor.patientsTreated.toLocaleString()} patients treated</span>
                      </div>
                    )}
                    {doctor.consultationFees > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">💰</span>
                        <span>${doctor.consultationFees} consultation fee</span>
                      </div>
                    )}
                    {/* Rating */}
                    <div className="flex items-center text-sm">
                      <div className="flex text-yellow-400 mr-2">
                        {'★'.repeat(Math.round(doctor.averageRating || 0))}
                        {'☆'.repeat(5 - Math.round(doctor.averageRating || 0))}
                      </div>
                      <span className="text-gray-600">
                        {doctor.averageRating || '0.0'} ({doctor.totalRatings || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/patient/doctors/${doctor._id || doctor.id}${predictionId ? `?predictionId=${predictionId}` : ''}`)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      View Profile
                    </button>
                    {predictionId && (
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(`/api/predictions/${predictionId}/share`, {
                              doctorId: doctor._id || doctor.id
                            })
                            toast.success('Report shared successfully!')
                            navigate('/patient/history')
                          } catch (error) {
                            toast.error(error.response?.data?.message || 'Failed to share report')
                          }
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                      >
                        Share Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DoctorSelection

