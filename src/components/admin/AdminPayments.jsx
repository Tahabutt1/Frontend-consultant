import { useCallback, useEffect, useState } from 'react'
import {
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  Search,
  Settings2,
  BadgePercent,
  Save,
  Power,
  Eye,
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

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

const STATUS_TONES = {
  submitted: { label: 'Pending verification', cls: 'bg-amber-500/20 text-amber-100', icon: AlertCircle },
  verified: { label: 'Verified', cls: 'bg-emerald-500/20 text-emerald-100', icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-rose-500/20 text-rose-100', icon: XCircle },
}

const METHOD_FIELD_LABELS = {
  account_holder: 'Account holder',
  account_number: 'Account number',
  bank_name: 'Bank name',
  iban: 'IBAN',
  swift: 'SWIFT / BIC',
  phone_number: 'Phone number',
  reference_hint: 'Reference hint',
}

const AdminPayments = ({ token }) => {
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({ submitted: 0, verified: 0, rejected: 0, total_paid_eur: 0 })
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '', stage: '' })
  const [activePayment, setActivePayment] = useState(null)
  const [editingMethod, setEditingMethod] = useState(null)

  const loadPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.stage) params.set('stage', filters.stage)
      const path = `/api/admin/payments${params.toString() ? `?${params.toString()}` : ''}`
      const resp = await adminFetch(path, { token })
      setPayments(resp?.payments || [])
      setStats(resp?.stats || stats)
    } catch (err) {
      setError(err.message || 'Could not load payments.')
    }
  }, [token, filters.status, filters.stage]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMethods = useCallback(async () => {
    try {
      const resp = await adminFetch('/api/admin/payment-methods', { token })
      setMethods(resp?.methods || [])
    } catch (err) {
      setError(err.message || 'Could not load payment methods.')
    }
  }, [token])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadPayments(), loadMethods()]).finally(() => setLoading(false))
    const id = setInterval(loadPayments, 30000)
    return () => clearInterval(id)
  }, [loadPayments, loadMethods])

  const filtered = filters.q
    ? payments.filter((p) => {
        const q = filters.q.toLowerCase()
        return (
          (p.student_id || '').toLowerCase().includes(q) ||
          (p.student_email || '').toLowerCase().includes(q) ||
          (p.student_name || '').toLowerCase().includes(q) ||
          (p.transaction_id || '').toLowerCase().includes(q)
        )
      })
    : payments

  const handleVerify = async (paymentId, notes = '') => {
    try {
      setError('')
      const resp = await adminFetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        body: { notes },
        token,
      })
      setInfo(resp?.message || 'Payment verified.')
      setActivePayment(null)
      await loadPayments()
    } catch (err) {
      setError(err.message || 'Could not verify payment.')
    }
  }

  const handleReject = async (paymentId, notes = '') => {
    try {
      setError('')
      const resp = await adminFetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        body: { notes },
        token,
      })
      setInfo(resp?.message || 'Payment rejected.')
      setActivePayment(null)
      await loadPayments()
    } catch (err) {
      setError(err.message || 'Could not reject payment.')
    }
  }

  const handleToggleMethod = async (methodKey) => {
    try {
      setError('')
      await adminFetch(`/api/admin/payment-methods/${methodKey}/toggle`, { method: 'POST', token })
      await loadMethods()
    } catch (err) {
      setError(err.message || 'Could not toggle payment method.')
    }
  }

  const handleSaveMethod = async (payload) => {
    try {
      setError('')
      await adminFetch(`/api/admin/payment-methods/${payload.method}`, {
        method: 'PUT',
        body: payload,
        token,
      })
      setInfo('Payment method updated.')
      setEditingMethod(null)
      await loadMethods()
    } catch (err) {
      setError(err.message || 'Could not update payment method.')
    }
  }

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
        <div className="flex items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <span>{info}</span>
          <button type="button" onClick={() => setInfo('')} className="text-emerald-100/70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Pending verification', value: stats.submitted, icon: AlertCircle },
          { label: 'Verified', value: stats.verified, icon: CheckCircle2 },
          { label: 'Rejected', value: stats.rejected, icon: XCircle },
          { label: 'Total verified (EUR)', value: `€${stats.total_paid_eur || 0}`, icon: Wallet },
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
        {/* PAYMENTS TABLE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder="Search by Student ID, email, name, transaction…"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 pl-10 text-sm text-white placeholder:text-white/50"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white"
              >
                <option value="">All statuses</option>
                <option value="submitted">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.stage}
                onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value }))}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white"
              >
                <option value="">All stages</option>
                <option value="confirmation">Confirmation €50</option>
                <option value="final">Final €600</option>
              </select>
              <button
                type="button"
                onClick={loadPayments}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md">
            <table className="min-w-full divide-y divide-white/5 text-sm">
              <thead className="bg-white/[0.04] text-left text-[11px] font-bold uppercase tracking-widest text-white/65">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/85">
                {loading && payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/55">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/55">
                      No payments match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const tone = STATUS_TONES[p.status] || STATUS_TONES.submitted
                    const ToneIcon = tone.icon
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{p.student_name || '—'}</div>
                          <div className="text-[11px] text-white/60">{p.student_id} · {p.student_email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">{p.stage_label || p.stage}</td>
                        <td className="px-4 py-3 text-xs">{p.method_label || p.method}</td>
                        <td className="px-4 py-3 font-mono">€{p.amount}</td>
                        <td className="px-4 py-3 text-[11px] text-white/65">{formatDate(p.created_at)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone.cls}`}
                          >
                            <ToneIcon className="h-3 w-3" />
                            {tone.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActivePayment(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/15"
                          >
                            <Eye className="h-3 w-3" /> Review
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAYMENT METHODS EDITOR */}
        <aside className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-sb-glow" />
              <p className="text-sm font-semibold text-white">Payment methods</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">
              <BadgePercent className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-white/55">
            Edit account details below. Toggles affect what the public website + student portal
            display.
          </p>
          <div className="mt-3 space-y-2">
            {methods.map((m) => (
              <div
                key={m.method}
                className="rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{m.display_name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                          m.is_active
                            ? 'bg-emerald-500/20 text-emerald-100'
                            : 'bg-white/10 text-white/55'
                        }`}
                      >
                        {m.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    {m.tagline && <p className="mt-0.5 text-[11px] text-white/55">{m.tagline}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleMethod(m.method)}
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/80 hover:bg-white/10"
                    title={m.is_active ? 'Disable method' : 'Enable method'}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMethod(m)}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[11px] text-white hover:bg-white/15"
                >
                  Edit details
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* PAYMENT REVIEW MODAL */}
      {activePayment && (
        <PaymentReviewModal
          payment={activePayment}
          onClose={() => setActivePayment(null)}
          onVerify={(notes) => handleVerify(activePayment.id, notes)}
          onReject={(notes) => handleReject(activePayment.id, notes)}
        />
      )}

      {/* METHOD EDIT MODAL */}
      {editingMethod && (
        <MethodEditModal
          method={editingMethod}
          onClose={() => setEditingMethod(null)}
          onSave={handleSaveMethod}
        />
      )}
    </div>
  )
}

const PaymentReviewModal = ({ payment, onClose, onVerify, onReject }) => {
  const [notes, setNotes] = useState(payment.verification_notes || '')
  const [busy, setBusy] = useState(false)
  const tone = STATUS_TONES[payment.status] || STATUS_TONES.submitted
  const ToneIcon = tone.icon

  const handleAction = async (action) => {
    try {
      setBusy(true)
      if (action === 'verify') await onVerify(notes)
      else await onReject(notes)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch overflow-y-auto bg-black/70 px-3 py-6">
      <div className="relative mx-auto my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-sb-deep shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-sb-accent/10 to-emerald-500/5 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Payment review</h3>
            <p className="text-xs text-white/60">{payment.student_name} · {payment.student_id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailRow label="Stage" value={payment.stage_label || payment.stage} />
            <DetailRow label="Amount" value={`€${payment.amount}`} mono />
            <DetailRow label="Method" value={payment.method_label || payment.method} />
            <DetailRow label="Status">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone.cls}`}>
                <ToneIcon className="h-3 w-3" />
                {tone.label}
              </span>
            </DetailRow>
            <DetailRow label="Sender name" value={payment.sender_name} />
            <DetailRow label="Sender contact" value={payment.sender_contact} />
            <DetailRow label="Sender account" value={payment.sender_account} mono />
            <DetailRow label="Transaction ID" value={payment.transaction_id} mono />
            <DetailRow label="Paid on" value={formatDate(payment.paid_on)} />
            <DetailRow label="Submitted" value={formatDate(payment.created_at)} />
            {payment.verified_at && (
              <DetailRow label="Verified at" value={formatDate(payment.verified_at)} />
            )}
            {payment.rejected_at && (
              <DetailRow label="Rejected at" value={formatDate(payment.rejected_at)} />
            )}
          </div>

          {payment.notes && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/65">
                Student note
              </p>
              <p className="mt-1 text-sm text-white/85">{payment.notes}</p>
            </div>
          )}

          <div className="mt-5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/65">
              Verification note (optional — shared with student)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Received in our Sparkasse account on 12 May — receipt issued."
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/40 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => handleAction('reject')}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm font-bold text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button
              type="button"
              onClick={() => handleAction('verify')}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sb-glow transition hover:scale-[1.01] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Verify payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MethodEditModal = ({ method, onClose, onSave }) => {
  const [form, setForm] = useState({
    display_name: method.display_name || '',
    tagline: method.tagline || '',
    instructions: method.instructions || '',
    is_active: method.is_active !== false,
    fields: {
      account_holder: method.fields?.account_holder || '',
      account_number: method.fields?.account_number || '',
      bank_name: method.fields?.bank_name || '',
      iban: method.fields?.iban || '',
      swift: method.fields?.swift || '',
      phone_number: method.fields?.phone_number || '',
      reference_hint: method.fields?.reference_hint || '',
    },
  })
  const [busy, setBusy] = useState(false)

  const handleField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const handleSubField = (key) => (e) =>
    setForm((f) => ({ ...f, fields: { ...f.fields, [key]: e.target.value } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setBusy(true)
      await onSave({ ...form, method: method.method })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch overflow-y-auto bg-black/70 px-3 py-6">
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-sb-deep shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-sb-accent/10 to-emerald-500/5 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Edit payment method</h3>
            <p className="text-xs text-white/60">{method.display_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6 space-y-4">
          <TextField label="Display name" value={form.display_name} onChange={handleField('display_name')} />
          <TextField label="Tagline" value={form.tagline} onChange={handleField('tagline')} />
          <TextAreaField label="Instructions" value={form.instructions} onChange={handleField('instructions')} />

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/65">
              Account details
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(METHOD_FIELD_LABELS).map(([key, label]) => (
                <TextField
                  key={key}
                  label={label}
                  value={form.fields[key]}
                  onChange={handleSubField(key)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-black/25 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sb-glow transition hover:scale-[1.01] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}

const DetailRow = ({ label, value, mono = false, children }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</p>
    {children ? (
      <div className="mt-1">{children}</div>
    ) : (
      <p
        className={`mt-1 text-sm text-white break-words ${
          mono ? 'font-mono text-emerald-100' : ''
        }`}
      >
        {value || '—'}
      </p>
    )}
  </div>
)

const TextField = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[11px] font-bold uppercase tracking-widest text-white/65">{label}</span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/40 focus:outline-none"
    />
  </label>
)

const TextAreaField = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[11px] font-bold uppercase tracking-widest text-white/65">{label}</span>
    <textarea
      value={value}
      onChange={onChange}
      rows={3}
      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/40 focus:outline-none"
    />
  </label>
)

export default AdminPayments
