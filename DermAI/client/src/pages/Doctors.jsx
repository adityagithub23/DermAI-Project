import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const Doctors = () => {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🩺 DermAI</h1>
          <p className="text-2xl font-semibold mb-2 italic">Your Skin, Our AI – Diagnose with Confidence</p>
          <p className="text-xl text-blue-100">Our Doctors</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 text-3xl mb-3">
                      👨‍⚕️
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {doctor.specialization && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Specialization</p>
                        <p className="text-gray-900">{doctor.specialization}</p>
                      </div>
                    )}

                    {doctor.yearsOfExperience > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Experience</p>
                        <p className="text-gray-900">{doctor.yearsOfExperience} years</p>
                      </div>
                    )}

                    {doctor.consultationFees > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Consultation Fee</p>
                        <p className="text-gray-900">${doctor.consultationFees}</p>
                      </div>
                    )}

                    {doctor.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact</p>
                        <p className="text-gray-900">{doctor.phone}</p>
                      </div>
                    )}

                    {/* Rating Placeholder */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Rating</p>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">(Coming Soon)</span>
                      </div>
                    </div>
                  </div>

                  {user && user.role === 'patient' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        You can share your reports with this doctor from your prediction results
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Doctors

