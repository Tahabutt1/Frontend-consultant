import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

import { STAGE_STATUS_META } from '../../config/studentApi'

function formatDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  } catch {
    return null
  }
}

const StudentJourney = ({ journey = [] }) => {
  if (!journey.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-sb-muted">
        Your journey will appear here once your profile is created.
      </div>
    )
  }

  const total = journey.length
  const completed = journey.filter((s) => s.status === 'completed').length
  const percent = Math.round((completed / total) * 100)
  const currentIndex = (() => {
    const idx = journey.findIndex((s) => s.status === 'in_progress')
    if (idx >= 0) return idx
    return journey.findIndex((s) => s.status === 'pending')
  })()
  const currentStage = currentIndex >= 0 ? journey[currentIndex] : journey[journey.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-sb-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sb-muted">Overall progress</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {completed} / {total} stages complete
          </p>
          <p className="text-xs text-sb-muted">
            {currentStage ? `Current focus: ${currentStage.label}` : 'All stages complete'}
          </p>
        </div>
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between text-xs text-sb-muted">
            <span>{percent}%</span>
            <span>Visa Approval</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sb-accent transition-all duration-700"
              style={{ width: `${Math.max(percent, 3)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal compact step bar (desktop) */}
      <div className="relative hidden md:block">
        <div className="absolute left-4 right-4 top-5 h-0.5 rounded-full bg-white/10" />
        <div
          className="absolute left-4 top-5 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sb-accent transition-all duration-700"
          style={{
            width: `calc(${Math.max(percent, 3)}% - 2rem)`,
          }}
        />
        <div className="relative flex justify-between gap-1 overflow-x-auto pb-1">
          {journey.map((stage, idx) => {
            const isCurrent = idx === currentIndex
            return (
              <div key={stage.key} className="flex min-w-[6.5rem] flex-1 flex-col items-center text-center">
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full ring-2 transition-all ${
                    stage.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 ring-emerald-400/50'
                      : stage.status === 'in_progress'
                      ? 'bg-gradient-to-br from-sb-accent to-cyan-400 ring-sb-accent/50 animate-pulse'
                      : 'bg-white/10 ring-white/20'
                  }`}
                >
                  {stage.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-white" />}
                  {stage.status === 'in_progress' && <Loader2 className="h-5 w-5 animate-spin text-white" />}
                  {stage.status === 'pending' && <Circle className="h-5 w-5 text-white/40" />}
                </div>
                <p
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-wider leading-tight ${
                    isCurrent ? 'text-white' : 'text-sb-muted'
                  }`}
                  title={stage.label}
                >
                  {stage.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vertical cards with arrows */}
      <ol className="space-y-3">
        {journey.map((stage, idx) => {
          const meta = STAGE_STATUS_META[stage.status] || STAGE_STATUS_META.pending
          const isCompleted = stage.status === 'completed'
          const isInProgress = stage.status === 'in_progress'
          return (
            <li key={stage.key}>
              <div
                className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center sm:gap-5 ${
                  isCompleted
                    ? 'border-emerald-400/30 bg-emerald-500/[0.06]'
                    : isInProgress
                    ? 'border-sb-accent/40 bg-sb-accent/[0.08] shadow-sb-glow'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl font-bold text-white ring-2 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 ring-emerald-400/40'
                          : isInProgress
                          ? 'bg-gradient-to-br from-sb-accent to-cyan-400 ring-sb-accent/40'
                          : 'bg-white/10 ring-white/15'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isInProgress ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <span className="text-sm">{idx + 1}</span>
                      )}
                    </div>
                    {idx < journey.length - 1 && (
                      <div
                        className={`mt-2 hidden h-6 w-px sm:block ${
                          isCompleted ? 'bg-emerald-400/60' : 'bg-white/15'
                        }`}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {idx + 1}. {stage.label}
                    </h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.badge}`}>
                      {meta.label}
                    </span>
                    {stage.owner === 'admin' && (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                        Admin step
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-sb-muted">{stage.description}</p>
                  {stage.remarks && (
                    <p className="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/85">
                      <span className="font-semibold text-white">Note:</span> {stage.remarks}
                    </p>
                  )}
                  {stage.completed_at && (
                    <p className="mt-1 text-xs text-emerald-200/85">
                      Completed on {formatDate(stage.completed_at)}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default StudentJourney
