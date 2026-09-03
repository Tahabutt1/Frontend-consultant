import { useEffect, useMemo, useState } from 'react'
import {
  BadgePercent,
  CheckCircle2,
  Wallet,
  Receipt,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Smartphone,
} from 'lucide-react'

import { StudentApi, PAYMENT_STATUS_META } from '../../config/studentApi'

const METHOD_ICONS = {
  bank_transfer: CreditCard,
  easypaisa: Smartphone,
  jazzcash: Smartphone,
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

const blankForm = {
  stage: 'confirmation',
  method: 'bank_transfer',
  sender_name: '',
  sender_contact: '',
  sender_account: '',
  transaction_id: '',
  notes: '',
  paid_on: '',
}

const StudentPayments = ({ student, onError }) => {
  const [plan, setPlan] = useState(null)
  const [methods, setMethods] = useState([])
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formInfo, setFormInfo] = useState('')
  const [form, setForm] = useState({
    ...blankForm,
    sender_name: student?.full_name || '',
  })

  const loadAll = useMemo(
    () => async () => {
      try {
        setLoading(true)
        const [planResp, paymentsResp] = await Promise.all([
          StudentApi.paymentPlan(),
          StudentApi.myPayments(),
        ])
        setPlan(planResp?.plan || null)
        setMethods(planResp?.methods || [])
        setPayments(paymentsResp?.payments || [])
        setSummary(paymentsResp?.summary || null)
      } catch (err) {
        if (onError) onError(err.message || 'Could not load payments.')
      } finally {
        setLoading(false)
      }
    },
    [onError],
  )

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (summary?.next_stage && summary.next_stage !== 'completed') {
      setForm((f) => ({ ...f, stage: summary.next_stage }))
    }
  }, [summary])

  const handleField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormInfo('')
    if (!form.method) {
      setFormError('Pick a payment method.')
      return
    }
    if (form.method !== 'bank_transfer' && !form.transaction_id.trim()) {
      setFormError('Transaction ID is required for mobile wallet payments.')
      return
    }
    try {
      setSubmitting(true)
      const resp = await StudentApi.submitPayment({
        stage: form.stage,
        method: form.method,
        sender_name: form.sender_name,
        sender_contact: form.sender_contact,
        sender_account: form.sender_account,
        transaction_id: form.transaction_id,
        paid_on: form.paid_on || null,
        notes: form.notes,
      })
      setFormInfo(resp?.message || 'Payment submitted — awaiting admin verification.')
      setForm((f) => ({ ...blankForm, stage: f.stage, sender_name: student?.full_name || '' }))
      await loadAll()
    } catch (err) {
      setFormError(err.message || 'Could not submit payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !plan) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-sb-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading payment portal…
      </div>
    )
  }

  const symbol = plan?.currency_symbol || '€'
  const offerPrice = plan?.offer_price ?? 650
  const totalPaid = summary?.total_paid ?? 0
  const balanceDue = summary?.balance_due ?? offerPrice
  const paidConfirmation = summary?.paid_confirmation
  const paidFinal = summary?.paid_final
  const completed = paidConfirmation && paidFinal
  const progress = Math.min(Math.round((totalPaid / offerPrice) * 100), 100)
  const selectedMethod = methods.find((m) => m.method === form.method)

  return (
    <div className="space-y-6">
      {/* HERO STAT STRIP */}
      <header className="rounded-3xl border border-white/15 bg-gradient-to-br from-emerald-500/10 via-white/[0.04] to-sb-accent/10 p-6 backdrop-blur-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-100">
              <BadgePercent className="h-3 w-3" /> {plan?.offer_label || 'Launch offer'}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-white">My payments</h2>
            <p className="mt-1 text-sm text-sb-muted">
              Pay {symbol}50 to start, {symbol}600 only after admission. Every transfer is verified
              manually by admin.
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-3 lg:w-auto">
            <StatTile
              label="Total paid"
              value={`${symbol}${totalPaid}`}
              accent="emerald"
              icon={Wallet}
            />
            <StatTile
              label="Balance due"
              value={`${symbol}${balanceDue}`}
              accent="cyan"
              icon={Receipt}
            />
            <StatTile
              label="Offer price"
              value={`${symbol}${offerPrice}`}
              accent="violet"
              icon={Sparkles}
              hint={`vs ${symbol}${plan?.original_price ?? 900}`}
            />
          </div>
        </div>

        {/* Progress meter */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/70">
            <span>Payment progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sb-accent transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <StageChip
              label={`Step 1 · ${symbol}50 confirmation`}
              done={Boolean(paidConfirmation)}
              accent="emerald"
            />
            <StageChip
              label={`Step 2 · ${symbol}600 final`}
              done={Boolean(paidFinal)}
              locked={!paidConfirmation}
              accent="sb-accent"
            />
            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 py-1 font-bold uppercase tracking-widest text-emerald-100">
                <CheckCircle2 className="h-3 w-3" /> All cleared
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* PAYMENT SUBMISSION FORM */}
        <section className="lg:col-span-3 rounded-3xl border border-white/15 bg-white/[0.05] p-6 backdrop-blur-2xl">
          <header className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-white">Submit a payment</h3>
              <p className="mt-1 text-sm text-sb-muted">
                Make the transfer using one of the methods on the right, then log it here so admin
                can verify it.
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </header>

          {completed ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
              <CheckCircle2 className="mb-2 h-5 w-5" />
              <p className="font-bold">All payments cleared.</p>
              <p className="mt-1 text-emerald-100/85">
                Your full {symbol}
                {offerPrice} package balance has been verified. Sit back — the admissions team will
                drive the process forward.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STAGE PICKER */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                  Payment stage
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(plan?.stages || []).map((s) => {
                    const stageDone =
                      (s.key === 'confirmation' && paidConfirmation) ||
                      (s.key === 'final' && paidFinal)
                    const stageLocked = s.key === 'final' && !paidConfirmation
                    const active = form.stage === s.key
                    return (
                      <button
                        key={s.key}
                        type="button"
                        disabled={stageDone || stageLocked}
                        onClick={() => setForm((f) => ({ ...f, stage: s.key }))}
                        className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                          active
                            ? 'border-emerald-400/50 bg-emerald-500/15 shadow-sb-glow'
                            : 'border-white/15 bg-white/[0.04] hover:bg-white/[0.07]'
                        } ${stageDone || stageLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                          {s.label}
                        </span>
                        <span className="mt-1 text-xl font-extrabold text-white">
                          {symbol}
                          {s.amount}
                        </span>
                        <span className="mt-1 text-[11px] text-white/65">
                          {stageDone ? 'Already paid' : stageLocked ? 'Unlocks after step 1' : 'Available'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* METHOD PICKER */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                  Payment method
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {methods.length === 0 && (
                    <p className="col-span-full text-sm text-white/55">
                      No active payment methods configured. Please contact support.
                    </p>
                  )}
                  {methods.map((m) => {
                    const Icon = METHOD_ICONS[m.method] || Wallet
                    const active = form.method === m.method
                    return (
                      <button
                        key={m.method}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, method: m.method }))}
                        className={`flex items-center gap-2 rounded-2xl border p-3 text-left transition ${
                          active
                            ? 'border-sb-accent/50 bg-sb-accent/15'
                            : 'border-white/15 bg-white/[0.04] hover:bg-white/[0.07]'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-sb-glow" />
                        <span className="text-sm font-semibold text-white">{m.display_name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* FIELDS */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Sender full name"
                  value={form.sender_name}
                  onChange={handleField('sender_name')}
                  placeholder="As on the transfer"
                />
                <TextField
                  label="Sender contact (phone / email)"
                  value={form.sender_contact}
                  onChange={handleField('sender_contact')}
                  placeholder="Optional"
                />
                <TextField
                  label="Sender account / IBAN"
                  value={form.sender_account}
                  onChange={handleField('sender_account')}
                  placeholder="Optional, helpful for bank transfers"
                />
                <TextField
                  label={
                    form.method === 'bank_transfer'
                      ? 'Reference / SWIFT (optional)'
                      : 'Transaction ID (required)'
                  }
                  value={form.transaction_id}
                  onChange={handleField('transaction_id')}
                  placeholder="TXN12345..."
                  required={form.method !== 'bank_transfer'}
                />
                <TextField
                  label="Date of payment"
                  type="datetime-local"
                  value={form.paid_on}
                  onChange={handleField('paid_on')}
                />
                <TextField
                  label="Notes (optional)"
                  value={form.notes}
                  onChange={handleField('notes')}
                  placeholder="Anything admin should know"
                />
              </div>

              {formError && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                  {formError}
                </div>
              )}
              {formInfo && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  {formInfo}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || methods.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sb-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? 'Submitting…' : 'Submit payment for verification'}
              </button>
            </form>
          )}
        </section>

        {/* METHOD DETAILS SIDE PANEL */}
        <aside className="lg:col-span-2 space-y-4">
          {selectedMethod ? (
            <div className="rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-2xl">
              <header className="flex items-center gap-2">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-sb-accent/20 p-2">
                  {(() => {
                    const Icon = METHOD_ICONS[selectedMethod.method] || Wallet
                    return <Icon className="h-4 w-4 text-emerald-200" />
                  })()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/60">Transfer to</p>
                  <p className="text-sm font-bold text-white">{selectedMethod.display_name}</p>
                </div>
              </header>
              {selectedMethod.instructions && (
                <p className="mt-3 text-xs leading-relaxed text-white/80">
                  {selectedMethod.instructions}
                </p>
              )}
              {selectedMethod.fields && Object.keys(selectedMethod.fields).length > 0 && (
                <dl className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/25 p-3 text-[11px]">
                  {Object.entries(selectedMethod.fields).map(([k, v]) =>
                    v ? (
                      <div key={k} className="flex flex-col gap-0.5">
                        <dt className="font-semibold uppercase tracking-widest text-white/55">
                          {k.replace(/_/g, ' ')}
                        </dt>
                        <dd className="font-mono text-emerald-100 break-all">{v}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              )}
            </div>
          ) : null}

          <div className="rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-2xl">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Trust & verification
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-white/80">
              {(plan?.trust_signals || []).map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* PAYMENT HISTORY */}
      <section className="rounded-3xl border border-white/15 bg-white/[0.05] p-6 backdrop-blur-2xl">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white">Payment history</h3>
            <p className="mt-1 text-xs text-sb-muted">
              Every submission, receipt, and admin verification log lives here.
            </p>
          </div>
          <Receipt className="h-5 w-5 text-sb-glow" />
        </header>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-10 text-center">
            <AlertCircle className="h-6 w-6 text-white/50" />
            <p className="text-sm text-white/65">
              No payments yet — submit your first €50 confirmation above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/5 text-sm">
              <thead className="bg-white/[0.04] text-left text-[11px] font-bold uppercase tracking-widest text-white/65">
                <tr>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/85">
                {payments.map((p) => {
                  const meta = PAYMENT_STATUS_META[p.status] || PAYMENT_STATUS_META.submitted
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">
                          {p.stage_label || p.stage}
                        </div>
                        {p.verification_notes && (
                          <div className="mt-1 text-[11px] text-white/55">
                            “{p.verification_notes}”
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-white">
                        {symbol}
                        {p.amount}
                      </td>
                      <td className="px-4 py-3">{p.method_label || p.method}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-100">
                        {p.transaction_id || '—'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-white/65">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

const StatTile = ({ label, value, icon: Icon, accent = 'emerald', hint }) => {
  const accentMap = {
    emerald: 'text-emerald-200',
    cyan: 'text-cyan-200',
    violet: 'text-violet-200',
  }
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/65">
        <Icon className={`h-3 w-3 ${accentMap[accent] || 'text-sb-glow'}`} />
        {label}
      </div>
      <p className="mt-1 text-xl font-extrabold text-white">{value}</p>
      {hint && <p className="text-[10px] text-white/50">{hint}</p>}
    </div>
  )
}

const StageChip = ({ label, done, locked = false, accent = 'emerald' }) => {
  const accentClass =
    accent === 'sb-accent' ? 'bg-sb-accent/25 text-sb-glow' : 'bg-emerald-500/25 text-emerald-100'
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-bold uppercase tracking-widest text-white/55">
        {label}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold uppercase tracking-widest ${
        done ? accentClass : 'bg-white/10 text-white/65'
      }`}
    >
      {done && <CheckCircle2 className="h-3 w-3" />}
      {label}
    </span>
  )
}

const TextField = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[11px] font-bold uppercase tracking-widest text-white/65">
      {label}
      {required && <span className="ml-1 text-rose-300">*</span>}
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/40 focus:outline-none"
    />
  </label>
)

export default StudentPayments
