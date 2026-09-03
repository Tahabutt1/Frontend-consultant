import { Fragment, useMemo, useRef, useState } from 'react'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Info,
  Download,
  Clock,
} from 'lucide-react'

import { StudentApi, DOC_STATUS_META } from '../../config/studentApi'

function formatBytes(n) {
  if (!n && n !== 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return null
  }
}

const StudentDocuments = ({
  catalog = [],
  documents = [],
  limits = {},
  programType = 'inter',
  onChanged,
  onError,
}) => {
  const [busyKey, setBusyKey] = useState(null)
  const [activeInfoKey, setActiveInfoKey] = useState(null)
  const fileRefs = useRef({})

  const latestByKey = useMemo(() => {
    const map = {}
    for (const doc of documents) {
      const key = doc.doc_key
      if (!key) continue
      if (
        !map[key] ||
        new Date(doc.uploaded_at || 0).getTime() > new Date(map[key].uploaded_at || 0).getTime()
      ) {
        if (doc.status !== 'superseded') {
          map[key] = doc
        }
      }
    }
    return map
  }, [documents])

  const grouped = useMemo(() => {
    const groups = {}
    for (const item of catalog) {
      const cat = item.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    return groups
  }, [catalog])

  const requiredCount = catalog.filter((c) => c.required).length
  const uploadedRequired = catalog.filter(
    (c) => c.required && latestByKey[c.key]
  ).length

  const handlePick = (key) => {
    const input = fileRefs.current[key]
    if (input) input.click()
  }

  const handleUpload = async (key, file) => {
    if (!file) return
    setBusyKey(key)
    try {
      await StudentApi.uploadDocument({ doc_key: key, file })
      onChanged && onChanged()
    } catch (err) {
      onError && onError(err.message || 'Upload failed')
    } finally {
      setBusyKey(null)
      const input = fileRefs.current[key]
      if (input) input.value = ''
    }
  }

  const handleDelete = async (docId, key) => {
    if (!docId) return
    if (!window.confirm('Delete this uploaded document? You can re-upload at any time.')) return
    setBusyKey(key)
    try {
      await StudentApi.deleteDocument(docId)
      onChanged && onChanged()
    } catch (err) {
      onError && onError(err.message || 'Delete failed')
    } finally {
      setBusyKey(null)
    }
  }

  const handleDownload = (docId) => {
    const token = localStorage.getItem('student_access_token') || ''
    const url = StudentApi.downloadDocumentUrl(docId)
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not download file')
        const blob = await res.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'document'
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch((err) => onError && onError(err.message || 'Download failed'))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.05] to-sb-accent/[0.05] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sb-muted">
              Document upload checklist
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              {uploadedRequired} / {requiredCount} required documents uploaded
            </h3>
            <p className="mt-1 text-xs text-sb-muted">
              Tailored for the <span className="font-semibold text-white">{programType === 'inter' ? 'Inter / FSc / A-Level' : 'Bachelor → Master'}</span> Germany track.
              Each upload is encrypted and visible only to MRTK consultants.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-sb-muted">
            <p>Max file size: <span className="font-semibold text-white">{Math.round((limits.max_size_bytes || 0) / (1024 * 1024)) || 8} MB</span></p>
            <p className="mt-1">Allowed: <span className="font-semibold text-white">{(limits.allowed_extensions || ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']).join(', ')}</span></p>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-sb-frost">{category}</h3>
            <span className="text-xs text-sb-muted">{items.length} document{items.length === 1 ? '' : 's'}</span>
          </header>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.05] text-left text-[11px] font-bold uppercase tracking-widest text-sb-muted">
                <tr>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Audience</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Uploaded file</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => {
                  const uploaded = latestByKey[item.key]
                  const status = uploaded ? uploaded.status : 'not_uploaded'
                  const meta = DOC_STATUS_META[status] || DOC_STATUS_META.not_uploaded
                  const isInfoOpen = activeInfoKey === item.key
                  const isBusy = busyKey === item.key
                  return (
                    <Fragment key={item.key}>
                      <tr className="align-top hover:bg-white/[0.02]">
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-2">
                            <FileText className="mt-0.5 h-4 w-4 flex-none text-white/60" />
                            <div>
                              <p className="font-semibold text-white">
                                {item.label}
                                {item.required ? (
                                  <span className="ml-2 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-100">
                                    required
                                  </span>
                                ) : (
                                  <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                                    optional
                                  </span>
                                )}
                              </p>
                              <p className="mt-0.5 text-xs text-sb-muted">{item.description}</p>
                              <button
                                type="button"
                                onClick={() => setActiveInfoKey(isInfoOpen ? null : item.key)}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sb-glow hover:text-white"
                              >
                                <Info className="h-3 w-3" />
                                {isInfoOpen ? 'Hide guide' : 'Why is this needed?'}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-sb-muted">
                          {item.audience?.includes('inter') && item.audience?.includes('bachelor')
                            ? 'All tracks'
                            : item.audience?.includes('inter')
                            ? 'Inter / A-Level'
                            : item.audience?.includes('bachelor')
                            ? 'Bachelor → Master'
                            : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.tone}`}>
                            {status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                            {status === 'pending_review' && <Clock className="h-3 w-3" />}
                            {status === 'rejected' && <AlertCircle className="h-3 w-3" />}
                            {meta.label}
                          </span>
                          {uploaded?.remarks && (
                            <p className="mt-2 max-w-xs rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/85">
                              {uploaded.remarks}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {uploaded ? (
                            <div className="space-y-0.5 text-xs text-white/85">
                              <p className="font-semibold text-white">{uploaded.original_filename}</p>
                              <p className="text-sb-muted">
                                {formatBytes(uploaded.size_bytes)} · {formatDate(uploaded.uploaded_at) || ''}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-sb-muted">Not uploaded yet</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row">
                            {uploaded && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(uploaded.id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                                >
                                  <Download className="h-3.5 w-3.5" /> Download
                                </button>
                                {status !== 'approved' && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleDelete(uploaded.id, item.key)}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handlePick(item.key)}
                              className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                                uploaded
                                  ? 'border border-sb-accent/40 bg-sb-accent/15 text-white hover:bg-sb-accent/25'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sb-glow hover:brightness-110'
                              }`}
                            >
                              {isBusy ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
                                </>
                              ) : uploaded ? (
                                <>
                                  <UploadCloud className="h-3.5 w-3.5" /> Replace
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="h-3.5 w-3.5" /> Upload
                                </>
                              )}
                            </button>
                            <input
                              ref={(el) => (fileRefs.current[item.key] = el)}
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                handleUpload(item.key, file)
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                      {isInfoOpen && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={5} className="px-4 pb-4">
                            <div className="rounded-xl border border-sb-accent/25 bg-sb-accent/[0.08] p-4 text-sm text-white/90">
                              <p className="font-semibold text-white">Why this document is needed</p>
                              <p className="mt-1 leading-relaxed text-white/80">{item.why}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

export default StudentDocuments
