import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Lock } from 'lucide-react'
import { apiUrl } from '../config/api'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('login')
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const navigate = useNavigate()

  const validateLoginId = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

  const authJsonHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateLoginId(email)) {
      return setError('Sign-in could not be completed.')
    }

    setLoading(true)
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      const accessToken = data.access_token
      localStorage.setItem('access_token', accessToken)

      const sendCode = await fetch(apiUrl('/api/verify/send-code'), {
        method: 'POST',
        headers: authJsonHeaders(accessToken),
      })
      if (sendCode.ok) {
        setStep('verify')
      } else {
        localStorage.removeItem('access_token')
        const errData = await sendCode.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to send verification code')
      }
    } catch (err) {
      const isNet =
        err instanceof TypeError &&
        String(err.message || '').toLowerCase().includes('fetch')
      setError(
        isNet
          ? 'Unable to reach the service.'
          : err.message || 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return setError('Session expired. Please log in again.')
    setError('')
    setVerifying(true)
    try {
      const res = await fetch(apiUrl('/api/verify/resend-code'), {
        method: 'POST',
        headers: authJsonHeaders(token),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Could not resend code')
      }
    } catch (err) {
      const isNet =
        err instanceof TypeError &&
        String(err.message || '').toLowerCase().includes('fetch')
      setError(isNet ? 'Unable to reach the service.' : err.message || 'Resend failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleVerifyCode = async () => {
    setVerifying(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Session missing. Log in again.')
        setVerifying(false)
        return
      }
      const res = await fetch(apiUrl('/api/verify/verify-code'), {
        method: 'POST',
        headers: authJsonHeaders(token),
        body: JSON.stringify({ code }),
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        setError('Invalid response from server.')
        return
      }
      if (res.ok && data.success) {
        navigate('/admin', { replace: true })
        return
      }
      setError(data.error || data.message || 'Invalid or expired code')
    } catch (err) {
      const isNet =
        err instanceof TypeError &&
        String(err.message || '').toLowerCase().includes('fetch')
      setError(isNet ? 'Unable to reach the service.' : err.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sb-navy px-4 py-16">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(30px,-30px) rotate(90deg)}50%{transform:translate(-20px,30px) rotate(180deg)}75%{transform:translate(40px,20px) rotate(270deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-40px,20px) rotate(-90deg)}50%{transform:translate(30px,-20px) rotate(-180deg)}75%{transform:translate(-30px,-40px) rotate(-270deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.25;filter:blur(72px);transform:scale(1)}50%{opacity:0.55;filter:blur(88px);transform:scale(1.08)} }
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        .float-orb-1{animation:float1 22s ease-in-out infinite}
        .float-orb-2{animation:float2 28s ease-in-out infinite}
        .pulse-glow{animation:pulse-glow 7s ease-in-out infinite}
        .gradient-shift{background-size:200% 200%;animation:gradient-shift 10s ease infinite}
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-sb-hero opacity-90" />
      <div className="float-orb-1 absolute -left-20 top-10 h-96 w-96 rounded-full bg-sb-accent/30 pulse-glow" />
      <div className="float-orb-2 absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 pulse-glow" />
      <div className="absolute inset-0 bg-gradient-to-t from-sb-navy via-transparent to-sb-deep/80" />

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-sb-card backdrop-blur-2xl md:p-10">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center space-y-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sb-accent to-blue-700 shadow-sb-glow">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">StudyBridge Control</h2>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-sb-muted">
            <Sparkles className="h-3.5 w-3.5 text-sb-glow" /> MRTK · Admin access
          </p>
        </div>

        {error && (
          <div className="relative rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100">
            {error}
          </div>
        )}

        {step === 'login' && (
          <>
            <div className="relative">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sb-muted">
                Account
              </label>
              <input
                type="text"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 text-sm text-white outline-none ring-sb-accent/30 focus:ring-2"
                required
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-sb-muted">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 pr-12 text-sm text-white outline-none ring-sb-accent/30 focus:ring-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-sb-muted transition hover:bg-white/10 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-7s4.477-7 10-7c1.04 0 2.03.153 2.975.435m1.395 1.17A9.974 9.974 0 0122 12c0 2.97-4.477 7-10 7a9.958 9.958 0 01-3.5-.645M4.598 4.598l14.804 14.804" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.234.735-.53 1.437-.882 2.096m-1.26 1.712A9.957 9.957 0 0112 19c-1.615 0-3.13-.385-4.468-1.066" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 w-full rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 py-3.5 text-sm font-bold text-white shadow-sb-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading && (
                  <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                )}
                {loading ? 'Authenticating…' : 'Continue'}
              </span>
            </button>
          </>
        )}

        {step === 'verify' && (
          <div className="relative space-y-4">
            <p className="text-xs text-sb-muted">Enter the verification code you received.</p>
            <label className="block text-xs font-semibold uppercase tracking-wide text-sb-muted">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-sb-ink/80 px-4 py-3.5 text-sm text-white outline-none ring-emerald-400/30 focus:ring-2"
            />
            <button
              type="button"
              onClick={handleResendCode}
              disabled={verifying}
              className="w-full rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-sb-frost transition hover:bg-white/5"
            >
              Resend code
            </button>
            <button
              onClick={handleVerifyCode}
              type="button"
              disabled={verifying}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? 'Verifying…' : 'Verify & enter dashboard'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default LoginPage
