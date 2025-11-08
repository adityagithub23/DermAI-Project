import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

// Auth Pages
import PatientLogin from './pages/auth/PatientLogin'
import PatientSignup from './pages/auth/PatientSignup'
import DoctorLogin from './pages/auth/DoctorLogin'
import DoctorSignup from './pages/auth/DoctorSignup'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import PredictionPage from './pages/patient/Prediction'
import MedicalHistory from './pages/patient/MedicalHistory'
import PatientProfileEdit from './pages/patient/ProfileEdit'
import Chats from './pages/patient/Chats'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import SharedReports from './pages/doctor/SharedReports'
import DoctorProfileEdit from './pages/doctor/ProfileEdit'

// Common Pages
import DoctorSelection from './pages/patient/DoctorSelection'
import DoctorProfile from './pages/patient/DoctorProfile'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Doctors from './pages/Doctors'
import Help from './pages/Help'
import Footer from './components/Footer'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/help" element={<Help />} />
            
            {/* Auth Routes */}
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/patient/signup" element={<PatientSignup />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/doctor/signup" element={<DoctorSignup />} />
            
            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <PrivateRoute role="patient">
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/predict"
              element={
                <PrivateRoute role="patient">
                  <PredictionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/history"
              element={
                <PrivateRoute role="patient">
                  <MedicalHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <PrivateRoute role="patient">
                  <PatientProfileEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/doctors"
              element={
                <PrivateRoute role="patient">
                  <DoctorSelection />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/doctors/:doctorId"
              element={
                <PrivateRoute role="patient">
                  <DoctorProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/chats"
              element={
                <PrivateRoute role="patient">
                  <Chats />
                </PrivateRoute>
              }
            />
            
            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <PrivateRoute role="doctor">
                  <DoctorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/shared-reports"
              element={
                <PrivateRoute role="doctor">
                  <SharedReports />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <PrivateRoute role="doctor">
                  <DoctorProfileEdit />
                </PrivateRoute>
              }
            />
            
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

