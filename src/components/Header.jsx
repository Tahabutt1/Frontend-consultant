
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { Sparkles, Menu, GraduationCap, ShieldCheck } from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setToken] = useState(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [studentToken, setStudentToken] = useState(null)
  const [studentLabel, setStudentLabel] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: '/', label: 'Home' },
    { id: '/services', label: 'Services' },
    { id: '/about', label: 'About' },
    { id: '/success-stories', label: 'Success stories' },
    { id: '/payments', label: 'Payments' },
    { id: '/contact', label: 'Contact' },
  ]

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token")
    setToken(null)
    setAdminEmail('')
    navigate('/login')
  }, [navigate])

  const handleStudentLogout = useCallback(() => {
    localStorage.removeItem("student_access_token")
    localStorage.removeItem("student_profile")
    setStudentToken(null)
    setStudentLabel('')
    navigate('/student/login')
  }, [navigate])

  useEffect(() => {
    const saved = localStorage.getItem("access_token")
    if (saved) {
      try {
        const decoded = jwtDecode(saved)
        if (Date.now() >= decoded.exp * 1000) {
          handleLogout()
        } else {
          setToken(saved)
          setAdminEmail('Admin')
        }
      } catch {
        handleLogout()
      }
    } else {
      setToken(null)
    }

    const studentSaved = localStorage.getItem("student_access_token")
    if (studentSaved) {
      try {
        const decoded = jwtDecode(studentSaved)
        if (Date.now() >= decoded.exp * 1000) {
          localStorage.removeItem("student_access_token")
          localStorage.removeItem("student_profile")
          setStudentToken(null)
          setStudentLabel('')
        } else {
          setStudentToken(studentSaved)
          try {
            const prof = JSON.parse(localStorage.getItem("student_profile") || '{}')
            setStudentLabel(prof.student_id || prof.email || 'Student')
          } catch {
            setStudentLabel('Student')
          }
        }
      } catch {
        localStorage.removeItem("student_access_token")
        localStorage.removeItem("student_profile")
        setStudentToken(null)
      }
    } else {
      setStudentToken(null)
    }
  }, [location.pathname, handleLogout])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-sb-deep/90 shadow-sb-card backdrop-blur-xl'
          : 'border-b border-transparent bg-sb-deep/70 backdrop-blur-md'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 text-left transition hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sb-accent to-cyan-500 shadow-sb-glow md:h-11 md:w-11">
            <Sparkles className="h-5 w-5 text-white md:h-6 md:w-6" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white md:text-lg">MRTK StudyBridge</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sb-muted md:text-xs">Germany</p>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`relative rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                location.pathname === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-sb-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
              {location.pathname === item.id && (
                <span className="absolute bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-sb-accent to-cyan-400" />
              )}
            </button>
          ))}

          <div className="ml-3 flex items-center gap-2">
            {studentToken ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavClick('/student/dashboard')}
                  className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
                  title={`Open student portal · ${studentLabel}`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden xl:inline">My portal</span>
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono tracking-tight text-white">{studentLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={handleStudentLogout}
                  className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200 ring-1 ring-red-400/20 transition hover:bg-red-500/25"
                  title="Logout student"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/student/login')}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 px-4 py-2 text-sm font-semibold text-white shadow-sb-glow transition hover:brightness-110"
              >
                <GraduationCap className="h-4 w-4" />
                Student Portal
              </button>
            )}

            {token && location.pathname === '/admin' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-sb-glow" />
                  {adminEmail}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-200 ring-1 ring-red-400/30 transition hover:bg-red-500/30"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/login')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sb-glow transition hover:brightness-110"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Login
              </button>
            )}
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-white/5 bg-sb-deep/95 backdrop-blur-xl transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[44rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 px-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${
                location.pathname === item.id ? 'bg-white/10 text-white' : 'text-sb-muted hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="space-y-2 border-t border-white/10 pt-3">
            {studentToken ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('/student/dashboard')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 py-3 text-sm font-semibold text-emerald-100"
                >
                  <GraduationCap className="h-4 w-4" /> Open my portal · {studentLabel}
                </button>
                <button
                  type="button"
                  onClick={handleStudentLogout}
                  className="w-full rounded-xl bg-red-500/15 py-3 text-sm font-semibold text-red-200"
                >
                  Logout student
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/student/login')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white"
              >
                <GraduationCap className="h-4 w-4" /> Student Portal
              </button>
            )}

            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-red-500/20 py-3 text-sm font-semibold text-red-200"
              >
                Logout admin
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/login')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 py-3 text-sm font-semibold text-white"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
