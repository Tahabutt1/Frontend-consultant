import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import Payments from './pages/Payments'
import SuccessStories from './pages/SuccessStories'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import { jwtDecode } from 'jwt-decode'

function isTokenValid(rawToken) {
  if (!rawToken) return false
  try {
    const decoded = jwtDecode(rawToken)
    return Date.now() < decoded.exp * 1000
  } catch {
    return false
  }
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token")
  if (!isTokenValid(token)) {
    localStorage.removeItem("access_token")
    return <Navigate to="/login" />
  }
  return children
}

function StudentProtectedRoute({ children }) {
  const token = localStorage.getItem("student_access_token")
  if (!isTokenValid(token)) {
    localStorage.removeItem("student_access_token")
    localStorage.removeItem("student_profile")
    return <Navigate to="/student/login" replace />
  }
  return children
}

function AppContent() {
  const location = useLocation()
  const allowedPaths = ['/', '/services', '/about', '/success-stories', '/contact', '/payments']
  const showChatbot = allowedPaths.includes(location.pathname)
  const isLogin = location.pathname === '/login'
  const isStudentLogin = location.pathname === '/student/login'
  const isStudentArea = location.pathname.startsWith('/student')
  const hideHeader = isLogin || isStudentLogin
  const hideFooter = isLogin || isStudentArea

  return (
    <>
      {!hideHeader && <Header currentPath={location.pathname} />}
      <main
        className={
          location.pathname === '/' || hideHeader
            ? 'pt-0'
            : isStudentArea
            ? 'pt-20'
            : 'pt-20'
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/dashboard"
            element={
              <StudentProtectedRoute>
                <StudentDashboard />
              </StudentProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      {showChatbot && <Chatbot />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
