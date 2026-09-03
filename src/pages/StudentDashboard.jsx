import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ClipboardList,
  Map,
  Bell,
  User,
  LogOut,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Mail,
  RefreshCw,
  Save,
  CircleAlert,
  Wallet,
} from 'lucide-react'

import {
  StudentApi,
  clearStudentSession,
  getStudentProfile,
  setStudentSession,
  PROGRAM_TYPES,
} from '../config/studentApi'

import StudentJourney from '../components/student/StudentJourney'
import StudentDocuments from '../components/student/StudentDocuments'
import StudentPayments from '../components/student/StudentPayments'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'documents', label: 'Documents', icon: ClipboardList },
  { id: 'journey', label: 'Process flow', icon: Map },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

function formatDate(value, opts = {}) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...opts,
    })
  } catch {
    return null
  }
}

function nextStageLabel(journey) {
  if (!Array.isArray(journey)) return ''
  const inProg = journey.find((s) => s.status === 'in_progress')
  if (inProg) return inProg.label
  const pending = journey.find((s) => s.status === 'pending')
  if (pending) return pending.label
  return 'Visa approved'
}

const StudentDashboard = () => {
  const navigate = useNavigate()

  const [tab, setTab] = useState('overview')
  const [student, setStudent] = useState(getStudentProfile())
  const [catalog, setCatalog] = useState([])
  const [catalogLimits, setCatalogLimits] = useState({})
  const [documents, setDocuments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notifUnread, setNotifUnread] = useState(0)
  const [loadingPage, setLoadingPage] = useState(true)
  const [pageError, setPageError] = useState('')
  const [pageInfo, setPageInfo] = useState('')

  const [profileForm, setProfileForm] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [verifyBusy, setVerifyBusy] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyInfo, setVerifyInfo] = useState('')
  const [copyMsg, setCopyMsg] = useState('')

  const reloadData = useCallback(async () => {
    try {
      setPageError('')
      const [profileResp, catResp, docsResp, notifsResp] = await Promise.all([
        StudentApi.profile(),
        StudentApi.documentsCatalog(),
        StudentApi.myDocuments(),
        StudentApi.notifications(50).catch(() => ({ notifications: [], unread: 0 })),
      ])
      const me = profileResp.student
      setStudent(me)
      setStudentSession({ student: me })
      setCatalog(catResp.documents || [])
      setCatalogLimits(catResp.limits || {})
      setDocuments(docsResp.documents || [])
      setNotifications(notifsResp.notifications || [])
      setNotifUnread(notifsResp.unread || 0)
      setProfileForm({
        full_name: me?.full_name || '',
        program_type: me?.program_type || 'inter',
        ...(me?.profile || {}),
      })
    } catch (err) {
      setPageError(err.message || 'Could not load dashboard.')
      if (err.status === 401 || err.status === 403) {
        clearStudentSession()
        navigate('/student/login', { replace: true })
      }
    }
  }, [navigate])

  useEffect(() => {
    setLoadingPage(true)
    reloadData().finally(() => setLoadingPage(false))
  }, [reloadData])

  const requiredCount = catalog.filter((c) => c.required).length
  const uploadedRequired = useMemo(() => {
    const set = new Set()
    documents.forEach((d) => {
      if (d.status !== 'superseded') set.add(d.doc_key)
    })
    return catalog.filter((c) => c.required && set.has(c.key)).length
  }, [catalog, documents])

  const handleLogout = () => {
    clearStudentSession()
    navigate('/student/login', { replace: true })
  }

  const copyId = async () => {
    if (!student?.student_id) return
    try {
      await navigator.clipboard.writeText(student.student_id)
      setCopyMsg('Student ID copied to clipboard.')
      setTimeout(() => setCopyMsg(''), 2200)
    } catch {
      setCopyMsg('Copy not supported in this browser.')
    }
  }

  const saveProfile = async () => {
    setProfileSaving(true)
    setPageError('')
    setPageInfo('')
    try {
      const payload = {
        full_name: profileForm.full_name,
        program_type: profileForm.program_type,
        profile: {
          phone: profileForm.phone || '',
          country: profileForm.country || '',
          city: profileForm.city || '',
          date_of_birth: profileForm.date_of_birth || '',
          passport_number: profileForm.passport_number || '',
          current_education: profileForm.current_education || '',
          intended_intake: profileForm.intended_intake || '',
          target_program: profileForm.target_program || '',
          german_level: profileForm.german_level || '',
          english_level: profileForm.english_level || '',
          notes: profileForm.notes || '',
        },
      }
      const data = await StudentApi.updateProfile(payload)
      setStudent(data.student)
      setStudentSession({ student: data.student })
      setPageInfo('Profile saved.')
      setTimeout(() => setPageInfo(''), 2500)
    } catch (err) {
      setPageError(err.message || 'Could not save profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const requestCode = async () => {
    setVerifyBusy(true)
    setVerifyError('')
    setVerifyInfo('')
    try {
      await StudentApi.requestEmailCode()
      setVerifyInfo('A 6-digit code has been sent to your email.')
    } catch (err) {
      setVerifyError(err.message || 'Could not request code.')
    } finally {
      setVerifyBusy(false)
    }
  }

  const submitVerify = async () => {
    if (verifyCode.length !== 6) {
      setVerifyError('Enter the full 6-digit code.')
      return
    }
    setVerifyBusy(true)
    setVerifyError('')
    setVerifyInfo('')
    try {
      const data = await StudentApi.verifyEmail(verifyCode)
      setStudent(data.student)
      setStudentSession({ student: data.student })
      setVerifyInfo('Email verified successfully.')
      setVerifyCode('')
    } catch (err) {
      setVerifyError(err.message || 'Could not verify code.')
    } finally {
      setVerifyBusy(false)
    }
  }

  const markNotifRead = async (id) => {
    try {
      await StudentApi.readNotification(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setNotifUnread((u) => Math.max(u - 1, 0))
    } catch (err) {
      setPageError(err.message || 'Could not update notification.')
    }
  }

  const markAllRead = async () => {
    try {
      await StudentApi.readAllNotifications()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setNotifUnread(0)
    } catch (err) {
      setPageError(err.message || 'Could not update notifications.')
    }
  }

  if (loadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sb-navy text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-300" />
          <p className="text-sm text-sb-muted">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sb-navy text-white">
        <div className="max-w-md rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm">
          <CircleAlert className="mb-2 h-6 w-6 text-rose-200" />
          {pageError || 'Session expired. Please log in again.'}
          <button
            type="button"
            onClick={() => navigate('/student/login', { replace: true })}
            className="mt-4 w-full rounded-xl bg-emerald-500 py-2 font-semibold"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-sb-navy py-6 px-3 sm:px-6 lg:px-8">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(30px,-30px) rotate(90deg)}50%{transform:translate(-20px,30px) rotate(180deg)}75%{transform:translate(40px,20px) rotate(270deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-40px,20px) rotate(-90deg)}50%{transform:translate(30px,-20px) rotate(-180deg)}75%{transform:translate(-30px,-40px) rotate(-270deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.2;filter:blur(60px);transform:scale(1)}50%{opacity:0.45;filter:blur(80px);transform:scale(1.05)} }
        .float-orb-1{animation:float1 22s ease-in-out infinite}
        .float-orb-2{animation:float2 28s ease-in-out infinite}
        .pulse-glow{animation:pulse-glow 7s ease-in-out infinite}
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-sb-hero opacity-80" />
      <div className="float-orb-1 absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-emerald-500/20 pulse-glow" />
      <div className="float-orb-2 absolute -right-40 bottom-10 h-[480px] w-[480px] rounded-full bg-sb-accent/20 pulse-glow" />
      <div className="absolute inset-0 bg-gradient-to-t from-sb-navy via-sb-deep/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        {/* Header card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl shadow-sb-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sb-glow">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sb-muted">
                  Welcome back
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {student.full_name || student.email}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copyId}
                    className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100 transition hover:bg-emerald-500/20"
                    title="Click to copy"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span className="font-mono">{student.student_id}</span>
                    <Copy className="h-3 w-3 opacity-80" />
                  </button>
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/85">
                    {student.program_type === 'bachelor' ? 'Bachelor → Master' : 'Inter / A-Level'}
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                      student.is_email_verified
                        ? 'bg-emerald-500/20 text-emerald-100'
                        : 'bg-amber-500/20 text-amber-100'
                    }`}
                  >
                    {student.is_email_verified ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {student.is_email_verified ? 'Email verified' : 'Email pending'}
                  </span>
                </div>
                {copyMsg && (
                  <p className="mt-2 text-xs text-emerald-200">{copyMsg}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:flex-none">
              <button
                type="button"
                onClick={reloadData}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Visit site
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 ring-1 ring-red-400/30 transition hover:bg-red-500/30"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-sb-muted">Docs uploaded</p>
              <p className="mt-1 text-xl font-extrabold text-white">
                {uploadedRequired}<span className="text-sm text-sb-muted">/{requiredCount || 0}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-sb-muted">Current stage</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{nextStageLabel(student.journey)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-sb-muted">Account email</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{student.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-sb-muted">Member since</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{formatDate(student.created_at, { hour: undefined, minute: undefined }) || '—'}</p>
            </div>
          </div>
        </div>

        {(pageError || pageInfo) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              pageError
                ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {pageError || pageInfo}
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-sb-glow'
                    : 'text-sb-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.id === 'notifications' && notifUnread > 0 && (
                  <span className="ml-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {notifUnread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Your Germany journey</h2>
                    <p className="text-xs text-sb-muted">
                      Each stage moves automatically once admin verifies the previous step.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('journey')}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Full process →
                  </button>
                </div>
                <div className="mt-5">
                  <StudentJourney journey={(student.journey || []).slice(0, 6)} />
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              {!student.is_email_verified && (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-amber-100">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <p className="text-sm font-semibold">Verify your email</p>
                  </div>
                  <p className="mt-1 text-xs text-amber-50/85">
                    Help us secure your account by confirming the email <strong>{student.email}</strong>.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="6-digit code"
                      className="flex-1 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-100/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={verifyBusy}
                      onClick={submitVerify}
                      className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-amber-950 disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={verifyBusy}
                    onClick={requestCode}
                    className="mt-2 text-xs font-semibold text-amber-100 underline disabled:opacity-50"
                  >
                    Send / resend code
                  </button>
                  {verifyError && <p className="mt-2 text-xs text-rose-200">{verifyError}</p>}
                  {verifyInfo && !verifyError && <p className="mt-2 text-xs text-emerald-200">{verifyInfo}</p>}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-sb-muted">What to do next</p>
                <ul className="mt-3 space-y-3 text-sm">
                  {(student.journey || [])
                    .filter((s) => s.status === 'in_progress' || s.status === 'pending')
                    .slice(0, 4)
                    .map((stage) => (
                      <li key={stage.key} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                            stage.status === 'in_progress'
                              ? 'bg-gradient-to-br from-sb-accent to-cyan-400 text-white animate-pulse'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          ◆
                        </span>
                        <div>
                          <p className="font-semibold text-white">{stage.label}</p>
                          <p className="text-xs text-sb-muted">{stage.description}</p>
                        </div>
                      </li>
                    ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setTab('documents')}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sb-glow transition hover:brightness-110"
                >
                  Upload documents
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-sb-muted">Latest notifications</p>
                {notifications.length === 0 ? (
                  <p className="mt-3 text-sm text-sb-muted">You&apos;re all caught up.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {notifications.slice(0, 4).map((n) => (
                      <li
                        key={n.id}
                        className={`rounded-xl border px-3 py-2 text-xs ${
                          n.is_read ? 'border-white/10 bg-white/[0.03] text-sb-muted' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50'
                        }`}
                      >
                        <p className="font-semibold text-white">{n.title}</p>
                        {n.body && <p className="mt-0.5 text-sb-muted">{n.body}</p>}
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-sb-muted">{formatDate(n.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab('notifications')}
                    className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white"
                  >
                    See all notifications
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}

        {tab === 'documents' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <StudentDocuments
              catalog={catalog}
              documents={documents}
              limits={catalogLimits}
              programType={student.program_type}
              onChanged={reloadData}
              onError={(msg) => setPageError(msg)}
            />
          </div>
        )}

        {tab === 'payments' && (
          <StudentPayments
            student={student}
            onError={(msg) => setPageError(msg)}
          />
        )}

        {tab === 'journey' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <header className="mb-6">
              <h2 className="text-xl font-bold text-white">Process flow</h2>
              <p className="mt-1 text-sm text-sb-muted">
                The full 11-stage journey from profile creation to visa approval. Stages
                marked as &ldquo;Admin step&rdquo; advance once a consultant updates them.
              </p>
            </header>
            <StudentJourney journey={student.journey || []} />
          </div>
        )}

        {tab === 'profile' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">My profile</h2>
                <p className="mt-1 text-sm text-sb-muted">
                  Keep these details accurate — they feed into the visa file and consultant assignment.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ProfileField label="Full name" value={profileForm.full_name} onChange={(v) => setProfileForm((p) => ({ ...p, full_name: v }))} />
              <ProgramTypeField value={profileForm.program_type} onChange={(v) => setProfileForm((p) => ({ ...p, program_type: v }))} />
              <ProfileField label="Phone number" value={profileForm.phone} onChange={(v) => setProfileForm((p) => ({ ...p, phone: v }))} />
              <ProfileField label="Date of birth" value={profileForm.date_of_birth} onChange={(v) => setProfileForm((p) => ({ ...p, date_of_birth: v }))} placeholder="YYYY-MM-DD" />
              <ProfileField label="Country" value={profileForm.country} onChange={(v) => setProfileForm((p) => ({ ...p, country: v }))} />
              <ProfileField label="City" value={profileForm.city} onChange={(v) => setProfileForm((p) => ({ ...p, city: v }))} />
              <ProfileField label="Passport number" value={profileForm.passport_number} onChange={(v) => setProfileForm((p) => ({ ...p, passport_number: v }))} />
              <ProfileField label="Current education" value={profileForm.current_education} onChange={(v) => setProfileForm((p) => ({ ...p, current_education: v }))} placeholder="e.g. BS Computer Science, NUST 2023" />
              <ProfileField label="Intended intake" value={profileForm.intended_intake} onChange={(v) => setProfileForm((p) => ({ ...p, intended_intake: v }))} placeholder="Winter 2026 / Summer 2027" />
              <ProfileField label="Target program" value={profileForm.target_program} onChange={(v) => setProfileForm((p) => ({ ...p, target_program: v }))} placeholder="e.g. MSc Data Science" />
              <ProfileField label="German level" value={profileForm.german_level} onChange={(v) => setProfileForm((p) => ({ ...p, german_level: v }))} placeholder="A1 / A2 / B1 / B2 / C1" />
              <ProfileField label="English level" value={profileForm.english_level} onChange={(v) => setProfileForm((p) => ({ ...p, english_level: v }))} placeholder="IELTS 6.5 / TOEFL 90" />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sb-muted">
                Additional notes (private)
              </label>
              <textarea
                value={profileForm.notes || ''}
                onChange={(e) => setProfileForm((p) => ({ ...p, notes: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-white/15 bg-sb-ink/70 px-4 py-3 text-sm text-white outline-none ring-emerald-400/30 focus:ring-2"
                placeholder="Anything else you'd like your consultant to know"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={profileSaving}
                onClick={saveProfile}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sb-glow transition hover:brightness-110 disabled:opacity-50"
              >
                {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {profileSaving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="mt-1 text-sm text-sb-muted">
                  Document approvals, stage updates and admin messages will appear here.
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
                >
                  Mark all as read
                </button>
              )}
            </header>
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-sm text-sb-muted">
                No notifications yet — we will keep you posted as your application progresses.
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-2xl border px-4 py-3 ${
                      n.is_read ? 'border-white/10 bg-white/[0.04]' : 'border-emerald-400/30 bg-emerald-500/10'
                    }`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{n.title}</p>
                        {n.body && <p className="mt-1 text-sm text-sb-muted">{n.body}</p>}
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-sb-muted">{formatDate(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={() => markNotifRead(n.id)}
                          className="self-start rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/20"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ProfileField = ({ label, value, onChange, placeholder = '', type = 'text' }) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sb-muted">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/15 bg-sb-ink/70 px-4 py-3 text-sm text-white outline-none ring-emerald-400/30 focus:ring-2"
    />
  </div>
)

const ProgramTypeField = ({ value, onChange }) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-sb-muted">Application track</label>
    <div className="grid grid-cols-2 gap-2">
      {PROGRAM_TYPES.map((pt) => (
        <button
          key={pt.value}
          type="button"
          onClick={() => onChange(pt.value)}
          className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
            value === pt.value
              ? 'border-emerald-400/60 bg-emerald-500/10 ring-1 ring-emerald-400/30'
              : 'border-white/10 bg-white/[0.04] hover:border-white/25'
          }`}
        >
          <p className="font-semibold text-white">{pt.label}</p>
          <p className="mt-1 text-[11px] text-sb-muted">{pt.description}</p>
        </button>
      ))}
    </div>
  </div>
)

export default StudentDashboard
