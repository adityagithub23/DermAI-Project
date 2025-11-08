import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={role === 'patient' ? '/patient/login' : '/doctor/login'} replace />
  }

  if (user.role !== role) {
    return <Navigate to={role === 'patient' ? '/patient/dashboard' : '/doctor/shared-reports'} replace />
  }

  return children
}

export default PrivateRoute

