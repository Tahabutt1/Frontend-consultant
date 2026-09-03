import { useEffect, useState, useCallback } from 'react'
import { apiUrl } from '../config/api'
import AdminStudents from '../components/admin/AdminStudents'
import AdminPayments from '../components/admin/AdminPayments'

const LEARN_API = () => apiUrl('/api/admin/chat-learning')

function ChatLearningAnalytics ({ token }) {
  const [overview, setOverview] = useState(null)
  const [turns, setTurns] = useState([])
  const [topQ, setTopQ] = useState([])
  const [loadErr, setLoadErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [pick, setPick] = useState(null)
  const [qNotes, setQNotes] = useState('')
  const [qQuality, setQQuality] = useState('neutral')

  const load = useCallback(async () => {
    if (!token) return
    setBusy(true)
    setLoadErr('')
    const hdr = { Authorization: `Bearer ${token}` }
    try {
      const [o, t, top] = await Promise.all([
        fetch(`${LEARN_API()}/overview`, { headers: hdr }).then(r => r.json()),
        fetch(`${LEARN_API()}/turns?limit=35`, { headers: hdr }).then(r => r.json()),
        fetch(`${LEARN_API()}/top-queries?limit=22&days=60`, { headers: hdr }).then(r => r.json()),
      ])
      if (o.error) throw new Error(o.message || o.error)
      setOverview(o)
      setTurns(t.turns || [])
      setTopQ(top.top_queries || [])
    } catch (e) {
      setLoadErr(e.message || 'Failed to load analytics')
    } finally {
      setBusy(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const saveAnnot = async () => {
    if (!pick?.id || !token) return
    try {
      const res = await fetch(`${LEARN_API()}/turns/${pick.id}/annotate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quality: qQuality, admin_notes: qNotes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Save failed')
      setPick(null)
      setQNotes('')
      load()
    } catch (e) {
      setLoadErr(e.message)
    }
  }

  const downloadExport = async () => {
    if (!token) return
    try {
      const res = await fetch(`${LEARN_API()}/export-sample?limit=250`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.error) throw new Error(data.message || data.error)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const u = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = u
      a.download = `studybridge-training-sample-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(u)
    } catch (e) {
      setLoadErr(e.message || 'Export failed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-white/85 text-sm max-w-xl">
          Public widget + logged-in chats are stored with language, intents, fingerprints, profile snapshots (form), and timings for analytics and fine-tuning prep.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => load()} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/15">
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" onClick={downloadExport} className="rounded-xl border border-cyan-400/40 px-4 py-2 text-sm font-semibold text-cyan-100 bg-cyan-500/15 hover:bg-cyan-500/25">
            Download JSON sample
          </button>
        </div>
      </div>
      {loadErr && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{loadErr}</div>
      )}

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total turns logged', val: overview.total_turns ?? '—' },
            { label: 'Last 7 days', val: overview.turns_last_7_days ?? '—' },
            { label: 'Threads (7d)', val: overview.distinct_threads_last_7_days ?? '—' },
            { label: 'Training schema', val: overview.latest_training_schema_in_db ?? 'legacy' },
          ].map(k => (
            <div key={k.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-white/55">{k.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{k.val}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Languages (7d)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(overview?.by_language_7d || []).length === 0 ? (
              <p className="text-sm text-white/60">No data yet.</p>
            ) : (
              overview.by_language_7d.map(row => (
                <div key={row._id} className="flex justify-between text-sm text-white/90 border-b border-white/10 pb-1">
                  <span>{row._id}</span>
                  <span className="font-semibold">{row.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Intents (7d)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(overview?.by_intent_7d || []).length === 0 ? (
              <p className="text-sm text-white/60">No data yet.</p>
            ) : (
              overview.by_intent_7d.map(row => (
                <div key={row._id} className="flex justify-between text-sm text-white/90 border-b border-white/10 pb-1">
                  <span className="truncate pr-2" title={row._id}>{row._id}</span>
                  <span className="font-semibold">{row.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Repeated question clusters (â‰ˆnormalized text)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-white/65 border-b border-white/15">
              <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Count</th><th className="py-2">Sample student message</th>
            </tr></thead>
            <tbody>
              {topQ.map((r, i) => (
                <tr key={r.fingerprint} className="border-b border-white/10 text-white/90">
                  <td className="py-2 pr-3">{i + 1}</td>
                  <td className="py-2 pr-3 font-semibold">{r.occurrences}</td>
                  <td className="py-2 max-w-xl whitespace-normal">{r.sample_user_message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Recent conversations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-white/65 border-b border-white/15">
              <th className="py-2 pr-2">Time</th><th className="py-2 pr-2">Lang</th><th className="py-2 pr-2">Intent</th><th className="py-2">User</th><th className="py-2 pr-2 text-right">Action</th>
            </tr></thead>
            <tbody>
              {turns.map(t => (
                <tr key={t.id} className="border-b border-white/10 align-top">
                  <td className="py-2 pr-2 whitespace-nowrap text-white/75">{t.timestamp ? new Date(t.timestamp).toLocaleString() : '—'}</td>
                  <td className="py-2 pr-2">{t.detected_language}</td>
                  <td className="py-2 pr-2 max-w-[10rem] truncate" title={t.intent_type}>{t.intent_type}</td>
                  <td className="py-2 max-w-lg text-white/90">{(t.user_message || '').slice(0, 160)}{(t.user_message || '').length > 160 ? '…' : ''}</td>
                  <td className="py-2 pr-2 text-right">
                    <button type="button" onClick={() => { setPick(t); setQNotes(t.training_feedback?.admin_notes || ''); setQQuality(t.training_feedback?.quality || 'neutral') }} className="text-cyan-200 hover:text-white text-xs font-semibold">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/15 bg-sb-deep p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-white">Label turn for QA / training backlog</h4>
              <button type="button" className="text-white/70 hover:text-white" onClick={() => setPick(null)}>âœ•</button>
            </div>
            <p className="text-xs text-white/55 mb-1">Intent · {pick.intent_type}</p>
            <div className="rounded-xl bg-black/25 p-3 text-sm text-white/92 mb-3 whitespace-pre-wrap">{pick.user_message}</div>
            <div className="rounded-xl bg-sb-accent/10 border border-white/10 p-3 text-sm text-white/88 mb-4 whitespace-pre-wrap">{pick.bot_response}</div>
            <label className="block text-sm text-white/80 mb-2">Quality</label>
            <select value={qQuality} onChange={e => setQQuality(e.target.value)} className="mb-3 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white">
              <option value="neutral">neutral</option>
              <option value="good">good</option>
              <option value="bad">needs improvement</option>
            </select>
            <label className="block text-sm text-white/80 mb-2">Admin notes</label>
            <textarea value={qNotes} onChange={e => setQNotes(e.target.value)} rows={4} className="mb-4 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/35" placeholder="What to fix in copy or routing…" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setPick(null)} className="rounded-xl px-4 py-2 text-sm border border-white/20 text-white/85">Cancel</button>
              <button type="button" onClick={saveAnnot} className="rounded-xl px-5 py-2 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Save label</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  // The legacy "Consultant roster" tab was a leftover hospital module and has
  // been removed. The dashboard now ships with the Students portal as the
  // default landing tab plus the Chatbot learning analytics tab.
  const [dashTab, setDashTab] = useState('students')

  const token = localStorage.getItem('access_token')

  return (
    <div className="relative min-h-screen overflow-hidden bg-sb-navy py-8 px-4 sm:px-6 lg:px-8">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(30px,-30px) rotate(90deg)}50%{transform:translate(-20px,30px) rotate(180deg)}75%{transform:translate(40px,20px) rotate(270deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-40px,20px) rotate(-90deg)}50%{transform:translate(30px,-20px) rotate(-180deg)}75%{transform:translate(-30px,-40px) rotate(-270deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.2;filter:blur(60px);transform:scale(1)}50%{opacity:0.45;filter:blur(80px);transform:scale(1.05)} }
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        .float-orb-1{animation:float1 22s ease-in-out infinite}
        .float-orb-2{animation:float2 28s ease-in-out infinite}
        .pulse-glow{animation:pulse-glow 7s ease-in-out infinite}
        .gradient-shift{background-size:200% 200%;animation:gradient-shift 10s ease infinite}
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-sb-hero opacity-80" />
      <div className="float-orb-1 absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-sb-accent/25 pulse-glow" />
      <div className="float-orb-2 absolute -right-40 bottom-10 h-[480px] w-[480px] rounded-full bg-cyan-500/15 pulse-glow" />
      <div className="absolute inset-0 bg-gradient-to-t from-sb-navy via-sb-deep/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-5 py-2 backdrop-blur-md">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-sb-glow" />
            <span className="text-sm font-semibold text-white">StudyBridge · Operations</span>
          </div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl">
            Admin dashboard
          </h1>
          <p className="text-lg text-sb-muted">Student admissions, payments & chatbot analytics in one place</p>
          <div className="mt-6 inline-flex flex-wrap rounded-2xl border border-white/15 bg-black/25 p-1 backdrop-blur-md">
            {[
              { id: 'students', label: 'Students portal' },
              { id: 'payments', label: 'Payments & offers' },
              { id: 'analytics', label: 'Chatbot learning data' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDashTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${dashTab === tab.id ? 'bg-gradient-to-r from-sb-accent to-blue-600 text-white shadow-lg' : 'text-white/70 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {dashTab === 'students' && <AdminStudents token={token} />}

        {dashTab === 'payments' && <AdminPayments token={token} />}

        {dashTab === 'analytics' && <ChatLearningAnalytics token={token} />}
      </div>
    </div>
  )
}

export default AdminDashboard
