import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BadgePercent,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Wallet,
  CreditCard,
  Smartphone,
  Receipt,
  ArrowRight,
  Star,
  RefreshCw,
} from 'lucide-react'

import { StudentApi } from '../config/studentApi'

const METHOD_ICONS = {
  bank_transfer: CreditCard,
  easypaisa: Smartphone,
  jazzcash: Smartphone,
}

const FALLBACK_PLAN = {
  currency: 'EUR',
  currency_symbol: '€',
  original_price: 900,
  offer_price: 650,
  discount_amount: 250,
  discount_percent: 28,
  offer_label: 'Launch offer',
  offer_subtitle: 'Limited intake — Winter 2026 cohort',
  stages: [
    {
      key: 'confirmation',
      label: 'Step 1 · Confirmation fee',
      amount: 50,
      description:
        'Refundable one-time confirmation fee to lock your seat and kickstart the consultancy workflow.',
      trust_notes: [
        'Pay only 50 € to start — no upfront commitment.',
        'Receipt + payment proof reviewed by admin before activation.',
      ],
    },
    {
      key: 'final',
      label: 'Step 2 · Final balance',
      amount: 600,
      description:
        'Charged only after your German admission is confirmed by the university.',
      trust_notes: [
        'Charged only on successful admission.',
        'Full transparent receipt issued by admin after verification.',
      ],
    },
  ],
  trust_signals: [
    'Manual admin verification of every transfer.',
    'Receipts + verification logs visible inside your portal.',
    'Confirmation fee is refundable if your German admission is not secured.',
  ],
}

const Payments = () => {
  const [plan, setPlan] = useState(FALLBACK_PLAN)
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const resp = await StudentApi.paymentPlan()
        if (cancelled) return
        if (resp?.plan) setPlan(resp.plan)
        if (Array.isArray(resp?.methods)) setMethods(resp.methods)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load live pricing — showing defaults.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const symbol = plan?.currency_symbol || '€'
  const stageConfirmation = plan.stages?.find((s) => s.key === 'confirmation') || FALLBACK_PLAN.stages[0]
  const stageFinal = plan.stages?.find((s) => s.key === 'final') || FALLBACK_PLAN.stages[1]

  return (
    <section className="relative min-h-screen bg-sb-hero pb-24 pt-28 text-white">
      <div className="pointer-events-none absolute inset-0 bg-sb-mesh" />
      <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px] animate-sb-float" />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 rounded-full bg-sb-accent/20 blur-[90px] animate-sb-float"
        style={{ animationDelay: '2s' }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
            <BadgePercent className="h-3.5 w-3.5" />
            {plan.offer_label || 'Launch offer'}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Transparent pricing for your <span className="gradient-text">Germany journey</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-sb-muted sm:text-lg">
            Pay only <strong className="text-white">{symbol}50</strong> to start. The remaining{' '}
            <strong className="text-white">{symbol}600</strong> is charged{' '}
            <em className="not-italic text-emerald-200">only after your German admission is confirmed</em>.
          </p>
        </motion.div>

        {error && (
          <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
            {error}
          </div>
        )}

        {/* PRICING CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.02] p-8 shadow-sb-card backdrop-blur-2xl sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sb-accent/20 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-100">
                <Star className="h-3 w-3" />
                Save {symbol}
                {plan.discount_amount} · {plan.discount_percent}% off
              </span>

              <div className="mt-5 flex items-end justify-center gap-4">
                <span className="text-2xl font-semibold text-white/55 line-through">
                  {symbol}
                  {plan.original_price}
                </span>
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-100 to-white bg-clip-text text-6xl font-extrabold text-transparent sm:text-7xl">
                  {symbol}
                  {plan.offer_price}
                </span>
              </div>
              <p className="mt-2 text-sm text-sb-muted">
                Complete consultancy package · {plan.offer_subtitle}
              </p>

              <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <StructureCard
                  badge="Pay now"
                  badgeTone="bg-emerald-500/20 text-emerald-100"
                  title={stageConfirmation.label}
                  amount={`${symbol}${stageConfirmation.amount}`}
                  description={stageConfirmation.description}
                  notes={stageConfirmation.trust_notes}
                  highlight
                />
                <StructureCard
                  badge="On admission"
                  badgeTone="bg-sb-accent/25 text-sb-glow"
                  title={stageFinal.label}
                  amount={`${symbol}${stageFinal.amount}`}
                  description={stageFinal.description}
                  notes={stageFinal.trust_notes}
                />
              </div>

              <Link
                to="/student/login?mode=signup"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-base font-bold text-white shadow-sb-glow transition hover:scale-[1.02]"
              >
                Start with €50 confirmation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-xs text-sb-muted">
                Already a student?{' '}
                <Link to="/student/login" className="font-semibold text-sb-glow hover:underline">
                  Sign in
                </Link>{' '}
                and submit your payment from the portal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* TRUST SIGNALS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3"
        >
          {(plan.trust_signals || FALLBACK_PLAN.trust_signals).map((line) => (
            <div
              key={line}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
            >
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <p className="text-sm text-white/85">{line}</p>
            </div>
          ))}
        </motion.div>

        {/* PAYMENT METHODS */}
        <div className="mt-16">
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Payment methods we support</h2>
            <p className="mt-2 text-sm text-sb-muted">
              Pick the channel that suits you. Account details below are kept up-to-date by our admin
              team — always submit your receipt through the student portal for fastest verification.
            </p>
          </header>

          {loading && methods.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-sb-muted">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading payment methods…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(methods.length > 0 ? methods : []).map((m) => {
                const Icon = METHOD_ICONS[m.method] || Wallet
                return (
                  <div
                    key={m.method}
                    className="rounded-2xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-sb-accent/20 p-2.5">
                        <Icon className="h-5 w-5 text-emerald-200" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{m.display_name}</h3>
                        {m.tagline && <p className="text-xs text-sb-muted">{m.tagline}</p>}
                      </div>
                    </div>
                    {m.instructions && (
                      <p className="mt-4 text-sm leading-relaxed text-white/80">{m.instructions}</p>
                    )}
                    {m.fields && Object.keys(m.fields).length > 0 && (
                      <dl className="mt-4 space-y-2 rounded-xl border border-white/10 bg-black/25 p-3 text-xs">
                        {Object.entries(m.fields).map(([k, v]) =>
                          v ? (
                            <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                              <dt className="font-semibold uppercase tracking-widest text-white/55">
                                {k.replace(/_/g, ' ')}
                              </dt>
                              <dd className="text-right font-mono text-emerald-100 break-all">{v}</dd>
                            </div>
                          ) : null,
                        )}
                      </dl>
                    )}
                  </div>
                )
              })}
              {methods.length === 0 && !loading && (
                <p className="col-span-full text-center text-sm text-sb-muted">
                  No active payment methods yet — please contact support.
                </p>
              )}
            </div>
          )}
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-16">
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">How payments work end-to-end</h2>
            <p className="mt-2 text-sm text-sb-muted">
              Every transfer is verified manually by our admin team — no automated chargebacks, no
              hidden fees.
            </p>
          </header>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'Sign up',
                body: 'Create a free student account in under 60 seconds.',
              },
              {
                icon: Wallet,
                title: 'Transfer €50',
                body: 'Use any of the methods above, with your Student ID as reference.',
              },
              {
                icon: Receipt,
                title: 'Submit receipt',
                body: 'Log your payment in the portal — admin verifies it within hours.',
              },
              {
                icon: CheckCircle2,
                title: 'Process begins',
                body: 'APS, university shortlist, Uni-Assist & visa prep unlock instantly.',
              },
            ].map((step, idx) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
              >
                <span className="absolute -top-3 left-5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-extrabold text-white shadow-sb-glow">
                  {idx + 1}
                </span>
                <step.icon className="mt-1 h-5 w-5 text-sb-glow" />
                <h3 className="mt-3 text-sm font-bold uppercase tracking-widest text-white/85">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-sb-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-white/15 bg-gradient-to-br from-emerald-500/15 via-sb-accent/10 to-transparent p-8 text-center backdrop-blur-2xl sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Ready to start your Germany journey?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-sb-muted sm:text-base">
            One small confirmation fee is all it takes. We handle the heavy paperwork — you focus on
            the universities.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/student/login?mode=signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sb-glow transition hover:scale-[1.02]"
            >
              Create student account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Talk to a consultant
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

const StructureCard = ({ badge, badgeTone, title, amount, description, notes = [], highlight = false }) => (
  <div
    className={`flex flex-col rounded-2xl border p-5 text-left transition ${
      highlight
        ? 'border-emerald-400/40 bg-emerald-500/10'
        : 'border-white/15 bg-white/[0.04]'
    }`}
  >
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${badgeTone}`}
    >
      {badge}
    </span>
    <h3 className="mt-3 text-sm font-bold uppercase tracking-widest text-white/85">{title}</h3>
    <p className="mt-1 text-3xl font-extrabold text-white">{amount}</p>
    <p className="mt-2 text-sm text-sb-muted">{description}</p>
    <ul className="mt-4 space-y-1.5">
      {notes.map((note) => (
        <li key={note} className="flex items-start gap-2 text-xs text-white/75">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-300" />
          {note}
        </li>
      ))}
    </ul>
  </div>
)

export default Payments
