import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  GraduationCap,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
} from 'lucide-react'

import { StudentApi, setStudentSession, PROGRAM_TYPES } from '../config/studentApi'

const benefits = [
  'Track your full Germany journey from sign-up to visa approval.',
  'Upload documents securely — admin sees them instantly for review.',
  'See real-time status, remarks, and what to do next at every stage.',
  'Smart guidance tailored to FSc/A-Level or Bachelor-to-Master tracks.',
]

const StudentLogin = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Allow deep-links like `/student/login?mode=signup` so the chatbot's
  // "Create student account" CTA can open the form already in signup mode.
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState(initialMode)
  const [step, setStep] = useState('credentials') // credentials | verify
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    program_type: 'inter',
  })
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((value || '').trim())

  const submitCredentials = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (mode === 'signup' && (!form.full_name || form.full_name.trim().length < 2)) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      let data
      if (mode === 'signup') {
        data = await StudentApi.signup({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          program_type: form.program_type,
        })
      } else {
        data = await StudentApi.login({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        })
      }

      setStudentSession({ token: data.access_token, student: data.student })

      if (mode === 'signup' && data.email_verification_required) {
        setStep('verify')
        setInfo(
          data.otp_sent
            ? 'We sent a 6-digit verification code to your email. Enter it below.'
            : data.otp_error
            ? `Account created. Email verification skipped: ${data.otp_error}. You can verify later from the dashboard.`
            : 'Account created. You can verify your email later from the dashboard.',
        )
        if (!data.otp_sent) {
          setTimeout(() => navigate('/student/dashboard', { replace: true }), 1200)
        }
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Could not complete the request.')
    } finally {
      setLoading(false)
    }
  }

  const submitVerify = async () => {
    setError('')
    setVerifyLoading(true)
    try {
      const data = await StudentApi.verifyEmail(code)
      setStudentSession({ student: data.student })
      setInfo('Email verified. Opening your dashboard...')
      setTimeout(() => navigate('/student/dashboard', { replace: true }), 800)
    } catch (err) {
      setError(err.message || 'Could not verify code.')
    } finally {
      setVerifyLoading(false)
    }
  }

  const resendCode = async () => {
    setError('')
    setInfo('')
    try {
      await StudentApi.requestEmailCode()
      setInfo('A new code has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not resend code.')
    }
  }

  const skipVerification = () => {
    navigate('/student/dashboard', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-sb-navy">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(30px,-30px) rotate(90deg)}50%{transform:translate(-20px,30px) rotate(180deg)}75%{transform:translate(40px,20px) rotate(270deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-40px,20px) rotate(-90deg)}50%{transform:translate(30px,-20px) rotate(-180deg)}75%{transform:translate(-30px,-40px) rotate(-270deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.25;filter:blur(72px);transform:scale(1)}50%{opacity:0.55;filter:blur(88px);transform:scale(1.08)} }
        .float-orb-1{animation:float1 22s ease-in-out infinite}
        .float-orb-2{animation:float2 28s ease-in-out infinite}
        .pulse-glow{animation:pulse-glow 7s ease-in-out infinite}
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-sb-hero opacity-90" />
      <div className="float-orb-1 absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 pulse-glow" />
      <div className="float-orb-2 absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-sb-accent/25 pulse-glow" />
      <div className="absolute inset-0 bg-gradient-to-t from-sb-navy via-transparent to-sb-deep/90" />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left brand pane */}
        <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between border-r border-white/5 bg-gradient-to-br from-sb-deep/80 to-sb-navy/80 px-12 py-14 backdrop-blur-sm">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-sb-frost transition hover:bg-white/10"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to website
            </button>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sb-glow">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-white">Student Portal</p>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sb-muted">MRTK StudyBridge · Germany</p>
              </div>
            </div>
            <h1 className="mt-12 text-4xl font-extrabold leading-tight text-white">
              Your Germany journey,
              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-sb-glow bg-clip-text text-transparent">
                orchestrated.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-sb-muted">
              Sign up with your email or Google, upload your documents and we will guide you
              through every step from APS to visa approval inside one premium dashboard.
            </p>

            <ul className="mt-10 space-y-4">
              {benefits.map((line, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-sb-frost">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-400/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                  </span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sb-muted">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Bank-grade encryption
            </div>
            <p className="mt-2 text-sm text-sb-frost">
              All passwords are bcrypt-hashed, sessions use signed JWT tokens, and your documents
              stay private — only visible to authorised consultants assigned to your application.
            </p>
          </div>
        </div>

        {/* Right form pane */}
        <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-8 lg:px-16">
          <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-sb-card backdrop-blur-2xl md:p-10">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />

            <div className="relative flex flex-col items-center space-y-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sb-glow">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {step === 'verify'
                  ? 'Verify your email'
                  : mode === 'signup'
                  ? 'Create your student account'
                  : 'Welcome back, student'}
              </h2>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-sb-muted">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                {step === 'verify'
                  ? 'One last step'
                  : mode === 'signup'
                  ? 'Free · 60 seconds'
                  : 'Sign in to continue'}
              </p>
            </div>

            {error && (
              <div className="relative flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                <span>{error}</span>
              </div>
            )}
            {info && !error && (
              <div className="relative flex items-start gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                <span>{info}</span>
              </div>
            )}

            {step === 'credentials' && (
              <>
                <div className="relative flex rounded-xl border border-white/10 bg-black/20 p-1 text-xs font-semibold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setInfo('')
                    }}
                    className={`flex-1 rounded-lg py-2 transition ${
                      mode === 'login' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sb-glow' : 'text-sb-muted hover:text-white'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setError('')
                      setInfo('')
                    }}
                    className={`flex-1 rounded-lg py-2 transition ${
                      mode === 'signup' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sb-glow' : 'text-sb-muted hover:text-white'
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                <form onSubmit={submitCredentials} className="relative space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sb-muted">
                        Full name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="As it appears on your passport"
                        className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sb-muted">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sb-muted" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="you@gmail.com"
                        className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 pl-10 text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sb-muted">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sb-muted" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        placeholder={mode === 'signup' ? 'Create a strong password' : 'Your password'}
                        className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 pl-10 pr-11 text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-sb-muted transition hover:bg-white/10 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sb-muted">
                        Application track
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {PROGRAM_TYPES.map((pt) => (
                          <button
                            key={pt.value}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, program_type: pt.value }))}
                            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                              form.program_type === pt.value
                                ? 'border-emerald-400/60 bg-emerald-500/10 ring-1 ring-emerald-400/30'
                                : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{pt.label}</span>
                              {form.program_type === pt.value && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-sb-muted">{pt.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-sb-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                    {loading ? 'Working...' : mode === 'signup' ? 'Create my account' : 'Sign in'}
                  </button>
                </form>

                <p className="relative text-center text-xs text-sb-muted">
                  By continuing you agree to our terms and acknowledge that your documents are processed
                  securely by MRTK StudyBridge consultants.
                </p>
              </>
            )}

            {step === 'verify' && (
              <div className="relative space-y-4">
                <p className="text-sm text-sb-muted">
                  Enter the 6-digit code we emailed to <strong className="text-white">{form.email}</strong>.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 text-center text-lg font-bold tracking-[0.5em] text-white outline-none ring-emerald-400/30 focus:ring-2"
                  placeholder="------"
                />
                <button
                  type="button"
                  onClick={submitVerify}
                  disabled={verifyLoading || code.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-sb-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Verify & open dashboard
                </button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={resendCode}
                    className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-sb-frost transition hover:bg-white/5"
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={skipVerification}
                    className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-sb-frost transition hover:bg-white/5"
                  >
                    Verify later, take me in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
