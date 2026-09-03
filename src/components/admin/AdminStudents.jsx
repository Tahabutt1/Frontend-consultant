import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  Search,
  Users,
  FileCheck2,
  GraduationCap,
  Mail,
  MapPin,
  RefreshCw,
  Bell,
  X,
  ChevronRight,
  Loader2,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldOff,
  ShieldCheck,
  StickyNote,
  ArrowLeftCircle,
} from 'lucide-react'

import { apiUrl } from '../../config/api'

const adminHeaders = (token) => ({
  Accept: 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

async function adminFetch(path, { method = 'GET', body, token, headers = {}, ...rest } = {}) {
  const init = {
    method,
    headers: { ...adminHeaders(token), ...headers },
    ...rest,
  }
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }
  const res = await fetch(apiUrl(path), init)
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `Request failed (${res.status})`)
    err.payload = data
    err.status = res.status
    throw err
  }
  return data
}

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

const STATUS_TONES = {
  approved: { label: 'Approved', cls: 'bg-emerald-500/20 text-emerald-100', icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-rose-500/20 text-rose-100', icon: XCircle },
  pending_review: { label: 'Pending review', cls: 'bg-amber-500/20 text-amber-100', icon: AlertCircle },
  superseded: { label: 'Superseded', cls: 'bg-white/10 text-white/60', icon: AlertCircle },
}

const STAGE_TONES = {
  completed: { label: 'Completed', cls: 'bg-emerald-500/20 text-emerald-100' },
  in_progress: { label: 'In progress', cls: 'bg-sb-accent/25 text-sb-glow' },
  pending: { label: 'Pending', cls: 'bg-white/10 text-white/70' },
}

const AdminStudents = ({ token }) => {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ q: '', program: '', status: '' })
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  const [loadingList, setLoadingList] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [notifsUnread, setNotifsUnread] = useState(0)

  const loadStats = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminFetch('/api/admin/students/stats', { token })
      setStats(data)
    } catch (err) {
      setError(err.message || 'Could not load stats')
    }
  }, [token])

  const loadStudents = useCallback(async () => {
    if (!token) return
    setLoadingList(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('limit', String(pageSize))
      params.set('skip', String(page * pageSize))
      if (filters.q.trim()) params.set('q', filters.q.trim())
      if (filters.program) params.set('program', filters.program)
      if (filters.status) params.set('status', filters.status)
      const data = await adminFetch(`/api/admin/students?${params}`, { token })
      setStudents(data.students || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message || 'Could not load students')
    } finally {
      setLoadingList(false)
    }
  }, [token, page, pageSize, filters])

  const loadNotifications = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminFetch('/api/admin/student-notifications?limit=80', { token })
      setNotifs(data.notifications || [])
      setNotifsUnread(data.unread || 0)
    } catch {
      /* silent */
    }
  }, [token])

  useEffect(() => {
    loadStats()
    loadStudents()
    loadNotifications()
    const id = setInterval(() => {
      loadStats()
      loadNotifications()
    }, 30000)
    return () => clearInterval(id)
  }, [loadStats, loadStudents, loadNotifications])

  const openDetail = async (studentDbId) => {
    setSelectedId(studentDbId)
    setLoadingDetail(true)
    setDetail(null)
    setError('')
    try {
      const data = await adminFetch(`/api/admin/students/${studentDbId}`, { token })
      setDetail(data)
    } catch (err) {
      setError(err.message || 'Could not open student')
    } finally {
      setLoadingDetail(false)
    }
  }

  const refreshDetail = useCallback(async () => {
    if (!selectedId) return
    try {
      const data = await adminFetch(`/api/admin/students/${selectedId}`, { token })
      setDetail(data)
    } catch (err) {
      setError(err.message || 'Could not refresh student')
    }
  }, [token, selectedId])

  const closeDetail = () => {
    setSelectedId(null)
    setDetail(null)
  }

  const downloadDocument = async (studentDbId, docId, filename) => {
    try {
      const res = await fetch(
        apiUrl(`/api/admin/students/${studentDbId}/documents/${docId}/download`),
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      )
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename || 'document'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      setError(err.message || 'Download failed')
    }
  }

  const updateDocumentStatus = async (docId, status, remarks = '') => {
    if (!selectedId) return
    try {
      await adminFetch(`/api/admin/students/${selectedId}/documents/${docId}/status`, {
        method: 'PUT',
        token,
        body: { status, remarks },
      })
      setInfo(`Document marked ${status.replace('_', ' ')}.`)
      setTimeout(() => setInfo(''), 2200)
      refreshDetail()
      loadStudents()
      loadStats()
      loadNotifications()
    } catch (err) {
      setError(err.message || 'Could not update document.')
    }
  }

  const updateStage = async (stageKey, action, remarks = '') => {
    if (!selectedId) return
    try {
      await adminFetch(`/api/admin/students/${selectedId}/journey/${stageKey}`, {
        method: 'PUT',
        token,
        body: { action, remarks },
      })
      setInfo(`Stage ${action.replace('_', ' ')} successful.`)
      setTimeout(() => setInfo(''), 2200)
      refreshDetail()
      loadStats()
      loadNotifications()
    } catch (err) {
      setError(err.message || 'Could not update stage.')
    }
  }

  const saveNotes = async (notes) => {
    if (!selectedId) return
    try {
      await adminFetch(`/api/admin/students/${selectedId}/notes`, {
        method: 'PUT',
        token,
        body: { admin_notes: notes },
      })
      setInfo('Notes saved.')
      setTimeout(() => setInfo(''), 1800)
      refreshDetail()
    } catch (err) {
      setError(err.message || 'Could not save notes.')
    }
  }

  const toggleActive = async () => {
    if (!detail?.student) return
    try {
      await adminFetch(`/api/admin/students/${detail.student.id}/status`, {
        method: 'PUT',
        token,
        body: { is_active: !detail.student.is_active },
      })
      refreshDetail()
      loadStudents()
    } catch (err) {
      setError(err.message || 'Could not change account status.')
    }
  }

  const markNotificationRead = async (id) => {
    try {
      await adminFetch(`/api/admin/student-notifications/${id}/read`, { method: 'POST', token })
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setNotifsUnread((u) => Math.max(u - 1, 0))
    } catch {
      /* silent */
    }
  }

  const markAllRead = async () => {
    try {
      await adminFetch('/api/admin/student-notifications/read-all', { method: 'POST', token })
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setNotifsUnread(0)
    } catch {
      /* silent */
    }
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1)

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-rose-100/70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {info && !error && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {info}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total students', value: stats?.total ?? '—', icon: Users },
          { label: 'Active', value: stats?.active ?? '—', icon: ShieldCheck },
          { label: 'Pending document reviews', value: stats?.pending_documents ?? '—', icon: FileCheck2 },
          {
            label: 'Inter / Bachelor split',
            value: stats ? `${stats.inter || 0} · ${stats.bachelor || 0}` : '—',
            icon: GraduationCap,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
              <card.icon className="h-3.5 w-3.5 text-sb-glow" />
              {card.label}
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(0)
                      loadStudents()
                    }
                  }}
                  placeholder="Search by Student ID, email, name, phone, passport, city..."
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 pl-10 text-sm text-white placeholder:text-white/50"
                />
              </div>
              <select
                value={filters.program}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, program: e.target.value }))
                  setPage(0)
                }}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white"
              >
                <option value="">All tracks</option>
                <option value="inter">Inter / A-Level</option>
                <option value="bachelor">Bachelor → Master</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, status: e.target.value }))
                  setPage(0)
                }}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white"
              >
                <option value="">Active + disabled</option>
                <option value="active">Active only</option>
                <option value="disabled">Disabled only</option>
              </select>
              <button
                type="button"
                onClick={() => loadStudents()}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-white/85">
              <span>{loadingList ? 'Loading...' : `Showing ${students.length} of ${total} student${total === 1 ? '' : 's'}`}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  className="rounded-lg border border-white/15 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs text-white/65">
                  Page {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-white/15 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/[0.04] text-left text-[11px] font-bold uppercase tracking-widest text-white/65">
                  <tr>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Profile</th>
                    <th className="px-4 py-3">Track</th>
                    <th className="px-4 py-3">Documents</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-white/65">
                        {loadingList ? 'Loading students...' : 'No students match your filters.'}
                      </td>
                    </tr>
                  )}
                  {students.map((s) => (
                    <tr key={s.id} className="align-top hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-emerald-200">{s.student_id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{s.full_name || '(unnamed)'}</p>
                        <p className="text-xs text-white/65">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/75">
                        {s.program_type === 'bachelor' ? 'Bachelor → Master' : 'Inter / A-Level'}
                        <br />
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${s.is_active ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'}`}>
                          {s.is_active ? 'active' : 'disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/85">
                        {s.documents_uploaded_count || 0} / {s.documents_required_count || 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/75">{formatDate(s.created_at, { hour: undefined, minute: undefined }) || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(s.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Open
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-sb-glow" />
              <p className="text-sm font-semibold text-white">
                Notifications
                {notifsUnread > 0 && (
                  <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {notifsUnread}
                  </span>
                )}
              </p>
            </div>
            {notifs.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-white/70 hover:text-white"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {notifs.length === 0 && (
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center text-xs text-white/65">
                No notifications yet.
              </li>
            )}
            {notifs.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl border px-3 py-2 text-xs ${
                  n.is_read ? 'border-white/10 bg-white/[0.03] text-white/75' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50'
                }`}
              >
                <p className="font-semibold text-white">{n.title}</p>
                {n.body && <p className="mt-0.5 text-white/75">{n.body}</p>}
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-white/55">
                  <span>{formatDate(n.created_at)}</span>
                  <div className="flex items-center gap-2">
                    {n.student_db_id && (
                      <button
                        type="button"
                        onClick={() => openDetail(n.student_db_id)}
                        className="font-semibold text-cyan-200 hover:text-white"
                      >
                        Open student
                      </button>
                    )}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="font-semibold text-emerald-200 hover:text-white"
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {selectedId && (
        <StudentDetailModal
          loading={loadingDetail}
          detail={detail}
          onClose={closeDetail}
          onDownload={downloadDocument}
          onUpdateDoc={updateDocumentStatus}
          onUpdateStage={updateStage}
          onSaveNotes={saveNotes}
          onToggleActive={toggleActive}
        />
      )}
    </div>
  )
}

const StudentDetailModal = ({
  loading,
  detail,
  onClose,
  onDownload,
  onUpdateDoc,
  onUpdateStage,
  onSaveNotes,
  onToggleActive,
}) => {
  const [docRemarks, setDocRemarks] = useState({})
  const [stageRemarks, setStageRemarks] = useState({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setNotes(detail?.student?.admin_notes || '')
    setDocRemarks({})
    setStageRemarks({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.student?.id])

  const student = detail?.student

  return (
    <div className="fixed inset-0 z-50 flex items-stretch overflow-y-auto bg-black/70 px-3 py-6">
      <div className="relative mx-auto my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-sb-deep shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-sb-accent/10 to-emerald-500/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white"
              aria-label="Close"
            >
              <ArrowLeftCircle className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/65">Student profile</p>
              <h3 className="text-lg font-bold text-white">{student?.full_name || student?.email || 'Loading...'}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          {loading || !detail ? (
            <div className="flex items-center justify-center py-20 text-white/70">
              <Loader2 className="h-6 w-6 animate-spin" /> &nbsp;Loading profile...
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header info */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/65">Student ID</p>
                  <p className="mt-1 font-mono text-lg font-extrabold text-emerald-200">{student.student_id}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/65">Email</p>
                  <p className="mt-1 break-all text-sm font-semibold text-white">{student.email}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-white/55">
                    {student.is_email_verified ? 'verified' : 'unverified'} · {student.auth_provider}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/65">Account</p>
                  <p className="mt-1 text-sm font-semibold text-white">{student.is_active ? 'Active' : 'Disabled'}</p>
                  <button
                    type="button"
                    onClick={onToggleActive}
                    className={`mt-2 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      student.is_active
                        ? 'bg-rose-500/15 text-rose-100 hover:bg-rose-500/25'
                        : 'bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
                    }`}
                  >
                    {student.is_active ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    {student.is_active ? 'Disable account' : 'Enable account'}
                  </button>
                </div>
              </section>

              {/* Profile fields */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/85">Profile details</h4>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <ProfileItem icon={GraduationCap} label="Track" value={student.program_type === 'bachelor' ? 'Bachelor → Master' : 'Inter / A-Level'} />
                  <ProfileItem icon={Mail} label="Phone" value={student.profile?.phone} />
                  <ProfileItem icon={MapPin} label="City" value={`${student.profile?.city || ''} ${student.profile?.country ? `, ${student.profile.country}` : ''}`.trim()} />
                  <ProfileItem label="Passport" value={student.profile?.passport_number} />
                  <ProfileItem label="Date of birth" value={student.profile?.date_of_birth} />
                  <ProfileItem label="Current education" value={student.profile?.current_education} />
                  <ProfileItem label="Target program" value={student.profile?.target_program} />
                  <ProfileItem label="Intended intake" value={student.profile?.intended_intake} />
                  <ProfileItem label="German level" value={student.profile?.german_level} />
                  <ProfileItem label="English level" value={student.profile?.english_level} />
                  <ProfileItem label="Created" value={formatDate(student.created_at) || '—'} />
                  <ProfileItem label="Last login" value={formatDate(student.last_login) || 'Never'} />
                </div>
                {student.profile?.notes && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-white/80">
                    <p className="font-semibold text-white">Student note</p>
                    <p className="mt-1 whitespace-pre-wrap">{student.profile.notes}</p>
                  </div>
                )}
              </section>

              {/* Documents */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <header className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/85">Documents</h4>
                  <p className="text-xs text-white/65">
                    {student.documents_uploaded_count || 0} / {student.documents_required_count || 0} required uploaded
                  </p>
                </header>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-white/[0.05] text-left text-[11px] font-bold uppercase tracking-widest text-white/60">
                      <tr>
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">File</th>
                        <th className="px-4 py-3">Review remarks</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(detail.documents_summary || []).map((item) => {
                        const latest = item.latest
                        const status = latest?.status || 'not_uploaded'
                        const tone = STATUS_TONES[status] || { label: 'Not uploaded', cls: 'bg-white/10 text-white/65', icon: AlertCircle }
                        const Icon = tone.icon || AlertCircle
                        return (
                          <Fragment key={item.doc_key}>
                            <tr className="align-top">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-white">{item.doc_label}</p>
                                <p className="text-xs text-white/65">{item.category}</p>
                                {item.required ? (
                                  <span className="mt-1 inline-block rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-100">required</span>
                                ) : (
                                  <span className="mt-1 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/65">optional</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone.cls}`}>
                                  <Icon className="h-3 w-3" />
                                  {tone.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-white/85">
                                {latest ? (
                                  <>
                                    <p className="font-semibold text-white">{latest.original_filename}</p>
                                    <p className="mt-0.5 text-white/60">{formatDate(latest.uploaded_at)}</p>
                                  </>
                                ) : (
                                  <span className="text-white/55">Not uploaded</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-white/75">
                                <textarea
                                  rows={2}
                                  value={docRemarks[item.doc_key] ?? (latest?.remarks || '')}
                                  onChange={(e) => setDocRemarks((prev) => ({ ...prev, [item.doc_key]: e.target.value }))}
                                  placeholder={latest ? 'Optional remarks for the student' : 'Awaiting upload'}
                                  disabled={!latest}
                                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-2 py-1 text-xs text-white placeholder:text-white/40 disabled:opacity-40"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col items-stretch justify-end gap-2 lg:flex-row">
                                  {latest && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => onDownload(student.id, latest.id, latest.original_filename)}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white"
                                      >
                                        <Download className="h-3 w-3" /> Download
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onUpdateDoc(latest.id, 'approved', docRemarks[item.doc_key] ?? '')}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500/25 px-2.5 py-1 text-xs font-bold text-emerald-100 hover:bg-emerald-500/35"
                                      >
                                        <CheckCircle2 className="h-3 w-3" /> Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onUpdateDoc(latest.id, 'rejected', docRemarks[item.doc_key] ?? '')}
                                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-500/25 px-2.5 py-1 text-xs font-bold text-rose-100 hover:bg-rose-500/35"
                                      >
                                        <XCircle className="h-3 w-3" /> Reject
                                      </button>
                                      {latest.status !== 'pending_review' && (
                                        <button
                                          type="button"
                                          onClick={() => onUpdateDoc(latest.id, 'pending_review', docRemarks[item.doc_key] ?? '')}
                                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Journey */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <header className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/85">Journey & approvals</h4>
                  <p className="text-xs text-white/65">
                    Approve a stage to automatically move the student to the next step.
                  </p>
                </header>
                <ol className="mt-4 space-y-2">
                  {(student.journey || []).map((stage, idx) => {
                    const tone = STAGE_TONES[stage.status] || STAGE_TONES.pending
                    return (
                      <li
                        key={stage.key}
                        className={`rounded-2xl border px-4 py-3 ${
                          stage.status === 'completed'
                            ? 'border-emerald-400/30 bg-emerald-500/[0.05]'
                            : stage.status === 'in_progress'
                            ? 'border-sb-accent/30 bg-sb-accent/[0.06]'
                            : 'border-white/10 bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {idx + 1}. {stage.label}
                            </p>
                            <p className="text-xs text-white/65">{stage.description}</p>
                            {stage.completed_at && (
                              <p className="mt-1 text-[11px] text-emerald-200/80">
                                Completed on {formatDate(stage.completed_at)}
                              </p>
                            )}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${tone.cls}`}>
                            {tone.label}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={stageRemarks[stage.key] ?? stage.remarks ?? ''}
                            onChange={(e) => setStageRemarks((prev) => ({ ...prev, [stage.key]: e.target.value }))}
                            placeholder="Optional note for the student"
                            className="flex-1 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-white placeholder:text-white/40"
                          />
                          {stage.status !== 'completed' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStage(stage.key, 'in_progress', stageRemarks[stage.key] || '')}
                                className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Mark in progress
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStage(stage.key, 'complete', stageRemarks[stage.key] || '')}
                                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white"
                              >
                                Approve & continue
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateStage(stage.key, 'revert', stageRemarks[stage.key] || '')}
                              className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100"
                            >
                              Revert
                            </button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>

              {/* Admin notes */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-amber-200" />
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/85">
                    Private admin notes
                  </h4>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white"
                  placeholder="Not visible to the student — for internal record keeping."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSaveNotes(notes)}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-bold text-white"
                  >
                    Save notes
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
    {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 text-white/60" />}
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/55">{label}</p>
      <p className="truncate text-sm font-semibold text-white">{value || '—'}</p>
    </div>
  </div>
)

export default AdminStudents
