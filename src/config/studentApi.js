import { apiUrl } from './api'

const STUDENT_TOKEN_KEY = 'student_access_token'
const STUDENT_PROFILE_KEY = 'student_profile'

export function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY) || ''
}

export function setStudentSession({ token, student } = {}) {
  if (token) localStorage.setItem(STUDENT_TOKEN_KEY, token)
  if (student) localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(student))
}

export function clearStudentSession() {
  localStorage.removeItem(STUDENT_TOKEN_KEY)
  localStorage.removeItem(STUDENT_PROFILE_KEY)
}

export function getStudentProfile() {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_PROFILE_KEY) || '{}')
  } catch {
    return {}
  }
}

const baseHeaders = (token) => ({
  Accept: 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

async function parseResponse(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

export async function studentApi(path, { method = 'GET', body, headers = {}, token, ...rest } = {}) {
  const authToken = token === undefined ? getStudentToken() : token
  const init = {
    method,
    headers: { ...baseHeaders(authToken), ...headers },
    ...rest,
  }
  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body
    } else {
      init.headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
  }
  const res = await fetch(apiUrl(path), init)
  return parseResponse(res)
}

export const StudentApi = {
  signup: (payload) => studentApi('/api/student/auth/signup', { method: 'POST', body: payload, token: null }),
  login: (payload) => studentApi('/api/student/auth/login', { method: 'POST', body: payload, token: null }),
  googleLogin: (payload) => studentApi('/api/student/auth/google', { method: 'POST', body: payload, token: null }),
  requestEmailCode: () => studentApi('/api/student/auth/request-email-code', { method: 'POST' }),
  verifyEmail: (code) => studentApi('/api/student/auth/verify-email', { method: 'POST', body: { code } }),
  me: () => studentApi('/api/student/auth/me'),
  logout: () => studentApi('/api/student/auth/logout', { method: 'POST' }),
  profile: () => studentApi('/api/student/profile'),
  updateProfile: (payload) => studentApi('/api/student/profile', { method: 'PUT', body: payload }),
  documentsCatalog: () => studentApi('/api/student/documents/catalog'),
  myDocuments: () => studentApi('/api/student/documents'),
  uploadDocument: ({ doc_key, file }) => {
    const fd = new FormData()
    fd.append('doc_key', doc_key)
    fd.append('file', file)
    return studentApi('/api/student/documents/upload', { method: 'POST', body: fd })
  },
  deleteDocument: (docId) => studentApi(`/api/student/documents/${docId}`, { method: 'DELETE' }),
  downloadDocumentUrl: (docId) => apiUrl(`/api/student/documents/${docId}/download`),
  journey: () => studentApi('/api/student/journey'),
  notifications: (limit = 50) => studentApi(`/api/student/notifications?limit=${limit}`),
  readNotification: (id) => studentApi(`/api/student/notifications/${id}/read`, { method: 'POST' }),
  readAllNotifications: () => studentApi('/api/student/notifications/read-all', { method: 'POST' }),
  // Payments & Offer Management — public endpoints don't need a token, but
  // we route them through `studentApi` so the response parsing is uniform.
  paymentPlan: () => studentApi('/api/payments/plan', { token: null }),
  paymentMethods: () => studentApi('/api/payments/methods', { token: null }),
  myPayments: () => studentApi('/api/student/payments'),
  myPaymentSummary: () => studentApi('/api/student/payments/summary'),
  submitPayment: (payload) =>
    studentApi('/api/student/payments', { method: 'POST', body: payload }),
}

export const PROGRAM_TYPES = [
  {
    value: 'inter',
    label: 'Inter / FSc / A-Level',
    description: 'Applying for Bachelor or Studienkolleg in Germany.',
  },
  {
    value: 'bachelor',
    label: 'Bachelor degree holder',
    description: "Applying for Master's programs at German universities.",
  },
]

export const DOC_STATUS_META = {
  not_uploaded: {
    label: 'Not uploaded',
    tone: 'border-white/15 bg-white/[0.04] text-white/60',
    badge: 'bg-white/10 text-white/70',
  },
  pending_review: {
    label: 'Pending review',
    tone: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    badge: 'bg-amber-500/20 text-amber-100',
  },
  approved: {
    label: 'Approved',
    tone: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    badge: 'bg-emerald-500/20 text-emerald-100',
  },
  rejected: {
    label: 'Needs revision',
    tone: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
    badge: 'bg-rose-500/20 text-rose-100',
  },
  superseded: {
    label: 'Superseded',
    tone: 'border-white/15 bg-white/[0.04] text-white/55',
    badge: 'bg-white/10 text-white/70',
  },
}

export const PAYMENT_STATUS_META = {
  submitted: {
    label: 'Awaiting verification',
    tone: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    badge: 'bg-amber-500/20 text-amber-100',
    dot: 'bg-amber-400',
  },
  verified: {
    label: 'Verified',
    tone: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    badge: 'bg-emerald-500/20 text-emerald-100',
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Needs attention',
    tone: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
    badge: 'bg-rose-500/20 text-rose-100',
    dot: 'bg-rose-400',
  },
}

export const STAGE_STATUS_META = {
  pending: {
    label: 'Pending',
    badge: 'bg-white/10 text-white/65',
    dot: 'bg-white/20',
  },
  in_progress: {
    label: 'In progress',
    badge: 'bg-sb-accent/25 text-sb-glow',
    dot: 'bg-gradient-to-br from-sb-accent to-cyan-400',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-500/20 text-emerald-100',
    dot: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  },
}
