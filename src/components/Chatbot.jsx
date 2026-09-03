import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  GraduationCap,
  X,
  Send,
  Sparkles,
  PanelLeft,
  LogIn,
  Plus,
  Pencil,
  Trash2,
  Check,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { apiUrl } from '../config/api'

// ---------------------------------------------------------------------------
// Auth wiring — the chatbot is shared by guests, students and admins.
// We prefer the student JWT (richer context) and fall back to the admin one.
// ---------------------------------------------------------------------------
const ADMIN_TOKEN_KEY = 'access_token'
const STUDENT_TOKEN_KEY = 'student_access_token'
const VISITOR_CHAT_KEY = 'sb_visitor_chat_id'
const ACTIVE_CHAT_KEY = 'sb_active_chat_id' // last-opened thread per identity

function readActiveTokenFromStorage() {
  if (typeof window === 'undefined') return null
  // Student first — that's the primary "logged-in user" for the consultancy UX.
  const studentToken = window.localStorage.getItem(STUDENT_TOKEN_KEY)
  if (studentToken) return { token: studentToken, kind: 'student' }
  const adminToken = window.localStorage.getItem(ADMIN_TOKEN_KEY)
  if (adminToken) return { token: adminToken, kind: 'admin' }
  return null
}

function decodeJwtSubject(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    )
    return json.sub || json.identity || null
  } catch {
    return null
  }
}

const authHeaders = (t) => (t ? { Authorization: `Bearer ${t}` } : {})

const WELCOME =
  'Assalamualaikum. Welcome to MRTK StudyBridge Germany. I am your study-abroad consultant assistant.\n\n' +
  'Share your CGPA/scale, degree field, IELTS or English-medium background, study gaps, budget, and target intake — I will walk you through realistic next steps for Germany (APS, Uni-Assist, admissions, blocked account, visa).\n\n' +
  'For a formal eligibility review, log in to your portal and upload transcripts and supporting documents when you are ready.'

const PRIMARY_SUGGESTIONS = [
  { id: 1, text: 'CGPA 2.5+ pathways', question: 'My CGPA is around 2.6 on 4.0 in engineering. What is a realistic Germany Master plan including APS and Uni-Assist timing?' },
  { id: 2, text: 'MOI / without IELTS', question: 'My bachelor was English-medium. Can I apply without IELTS using MOI — what do you need to verify on my file?' },
  { id: 3, text: 'APS overview', question: 'Explain APS Germany document flow and common timeline mistakes for students from my region.' },
  { id: 4, text: 'Blocked account', question: 'How should I plan blocked account (Sperrkonto) and finances for a German student visa after admission?' },
  { id: 5, text: 'SOP structure', question: 'How should I draft an SOP for German universities that matches my transcripts and motivation credibly?' },
  { id: 6, text: 'Study gap', question: 'I have a 2-year gap after graduation with work experience. How should this be presented for German admissions?' },
]

function buildProfilePayload(form) {
  const o = {}
  const num = (v) => {
    if (v === '' || v == null) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const cgpa = num(form.cgpa)
  const scale = num(form.cgpa_scale)
  const gap = num(form.gap_years)
  const ielts = num(form.ielts_overall)
  const budget = num(form.budget_eur_year)
  const work = num(form.work_experience_years)
  if (cgpa != null) o.cgpa = cgpa
  if (scale != null) o.cgpa_scale = scale
  if (gap != null) o.gap_years = gap
  if (ielts != null) o.ielts_overall = ielts
  if (form.ielts_status) o.ielts_status = form.ielts_status
  if (budget != null) o.budget_eur_year = budget
  if (work != null) o.work_experience_years = work
  if (form.degree_level) o.degree_level = form.degree_level.trim()
  if (form.field_of_study) o.field_of_study = form.field_of_study.trim()
  if (form.preferred_intake) o.preferred_intake = form.preferred_intake.trim()
  if (form.target_country) o.target_country = form.target_country.trim()
  if (form.target_university) o.target_university = form.target_university.trim()
  if (form.education_background) o.education_background = form.education_background.trim()
  return o
}

function deriveTitleFromMessage(raw, max = 50) {
  if (!raw) return 'New consultation'
  const cleaned = String(raw)
    .replace(/\s+/g, ' ')
    .trim()
  if (cleaned.length <= max) return cleaned
  const slice = cleaned.slice(0, max - 1)
  const sep = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf(','), slice.lastIndexOf('.'))
  const cut = sep > max * 0.5 ? slice.slice(0, sep) : slice
  return cut.trim() + '…'
}

function relativeTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const Chatbot = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const API_BASE = apiUrl('/api')

  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [showSidebar, setShowSidebar] = useState(true)
  const [messages, setMessages] = useState(() => [
    { id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Auth session — kind: 'student' | 'admin' | null (guest)
  const [session, setSession] = useState(() => readActiveTokenFromStorage())
  const token = session?.token || null
  const isAuthed = Boolean(token)
  const identity = useMemo(() => decodeJwtSubject(token) || '', [token])

  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [editingChatId, setEditingChatId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const messagesEndRef = useRef(null)
  const renameInputRef = useRef(null)

  // Each guest browser session keeps its own anon thread id. Cleared by the
  // browser on close because we use sessionStorage (NOT localStorage).
  const [anonThreadId] = useState(() => {
    if (typeof sessionStorage === 'undefined') return 'v_guest'
    let id = sessionStorage.getItem(VISITOR_CHAT_KEY)
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID ? `v_${crypto.randomUUID()}` : `v_${Date.now()}`
      sessionStorage.setItem(VISITOR_CHAT_KEY, id)
    }
    return id
  })

  const [profileForm, setProfileForm] = useState({
    cgpa: '',
    cgpa_scale: '4',
    gap_years: '',
    ielts_overall: '',
    ielts_status: '',
    degree_level: '',
    field_of_study: '',
    budget_eur_year: '',
    work_experience_years: '',
    preferred_intake: '',
    target_country: 'Germany',
    target_university: '',
    education_background: '',
  })

  // -----------------------------------------------------------------------
  // Responsive resize + auth session sync (storage, focus, route change)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const sync = () => {
      const next = readActiveTokenFromStorage()
      setSession((prev) => {
        if (!prev && !next) return prev
        if (prev && next && prev.token === next.token && prev.kind === next.kind) return prev
        return next
      })
    }
    sync()
    const onStorage = (e) => {
      if (!e.key || e.key === STUDENT_TOKEN_KEY || e.key === ADMIN_TOKEN_KEY) sync()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', sync)
    }
  }, [location.pathname])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus rename input as soon as a row enters edit mode.
  useEffect(() => {
    if (editingChatId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [editingChatId])

  // -----------------------------------------------------------------------
  // History loading — runs whenever auth changes. Guests get a fresh slate.
  // -----------------------------------------------------------------------
  const loadChatsForToken = useCallback(
    async (authToken, identityKey) => {
      if (!authToken) return
      setIsLoadingChats(true)
      try {
        const res = await fetch(`${API_BASE}/chat/all`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
        })
        if (!res.ok) {
          setChatHistory([])
          setCurrentChatId(null)
          setMessages([{ id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() }])
          return
        }
        const data = await res.json()
        const list = Array.isArray(data.chats) ? data.chats : []
        setChatHistory(list)
        if (!list.length) {
          setCurrentChatId(null)
          setMessages([{ id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() }])
          return
        }
        // Prefer the chat the user last had open (per identity), else newest.
        const savedKey = identityKey ? `${ACTIVE_CHAT_KEY}:${identityKey}` : ACTIVE_CHAT_KEY
        const remembered = (() => {
          try {
            const raw = window.localStorage.getItem(savedKey)
            if (!raw) return null
            const n = Number(raw)
            return Number.isFinite(n) ? n : raw
          } catch {
            return null
          }
        })()
        const target = list.find((c) => String(c.id) === String(remembered)) || list[0]
        setCurrentChatId(target.id)
        await fetchChatMessages(target.id, authToken)
      } catch {
        /* ignore network errors silently — UI keeps showing welcome */
      } finally {
        setIsLoadingChats(false)
      }
    },
    // fetchChatMessages defined below; safe ref since it doesn't depend on state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [API_BASE]
  )

  useEffect(() => {
    if (!token) {
      setChatHistory([])
      setCurrentChatId(null)
      setEditingChatId(null)
      setConfirmDeleteId(null)
      setMessages([{ id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() }])
      return
    }
    loadChatsForToken(token, identity)
  }, [token, identity, loadChatsForToken])

  // Remember which thread the user is on so refresh lands them back here.
  useEffect(() => {
    if (!isAuthed || !identity) return
    const key = `${ACTIVE_CHAT_KEY}:${identity}`
    try {
      if (currentChatId != null) {
        window.localStorage.setItem(key, String(currentChatId))
      } else {
        window.localStorage.removeItem(key)
      }
    } catch {
      /* ignore quota errors */
    }
  }, [currentChatId, isAuthed, identity])

  // -----------------------------------------------------------------------
  // API helpers
  // -----------------------------------------------------------------------
  const chatThreadPayload = useCallback(() => {
    if (token && currentChatId != null) return { chat_id: String(currentChatId) }
    if (!token) return { chat_id: anonThreadId }
    return {}
  }, [token, currentChatId, anonThreadId])

  const postConsultant = async (text, overrideChatId) => {
    const profile = buildProfilePayload(profileForm)
    const threadPayload = overrideChatId
      ? { chat_id: String(overrideChatId) }
      : chatThreadPayload()
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({
        message: text,
        student_profile: profile,
        omit_assistant_greeting: true,
        ...threadPayload,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return { reply: data.response || data.message || '—', meta: data }
  }

  const fetchChatMessages = async (chatId, authToken) => {
    try {
      const res = await fetch(`${API_BASE}/chat/${chatId}/messages`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders(authToken || token) },
      })
      if (!res.ok) return
      const data = await res.json()
      const rows = Array.isArray(data.messages) ? data.messages : []
      if (rows.length === 0) {
        setMessages([{ id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() }])
        return
      }
      setMessages(
        rows.map((m, i) => ({
          id: i + 1,
          text: m.text,
          sender: m.sender,
          timestamp: new Date(m.timestamp),
        }))
      )
    } catch {
      /* ignore */
    }
  }

  const createNewChat = async () => {
    const id = Date.now()
    // Optimistic insert at the top so the UI feels instant.
    setChatHistory((h) => [
      { id, title: 'New consultation', messages: 0, lastMessage: '' },
      ...h.filter((c) => c.id !== id),
    ])
    setCurrentChatId(id)
    setMessages([{ id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() }])
    setEditingChatId(null)
    setConfirmDeleteId(null)
    if (token) {
      try {
        await fetch(`${API_BASE}/chat/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
          body: JSON.stringify({ chat_id: id, title: 'New consultation' }),
        })
      } catch {
        /* swallow — the backend will lazy-create on first message anyway */
      }
    }
    return id
  }

  const switchChat = async (id) => {
    if (id === currentChatId) return
    setCurrentChatId(id)
    setEditingChatId(null)
    setConfirmDeleteId(null)
    if (token) await fetchChatMessages(id, token)
  }

  const startRename = (chat) => {
    setEditingChatId(chat.id)
    setEditingTitle(chat.title || '')
    setConfirmDeleteId(null)
  }

  const cancelRename = () => {
    setEditingChatId(null)
    setEditingTitle('')
  }

  const commitRename = async () => {
    const chatId = editingChatId
    const title = editingTitle.trim()
    setEditingChatId(null)
    setEditingTitle('')
    if (!chatId || !title || !token) return
    const previous = chatHistory
    setChatHistory((h) => h.map((c) => (c.id === chatId ? { ...c, title } : c)))
    try {
      const res = await fetch(`${API_BASE}/chat/${chatId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error('rename failed')
    } catch {
      setChatHistory(previous)
    }
  }

  const confirmDelete = (id) => {
    setConfirmDeleteId(id)
    setEditingChatId(null)
  }

  const cancelDelete = () => setConfirmDeleteId(null)

  const performDelete = async (id) => {
    setConfirmDeleteId(null)
    if (!token) return
    const previous = chatHistory
    const remaining = chatHistory.filter((c) => c.id !== id)
    setChatHistory(remaining)
    if (currentChatId === id) {
      const fallback = remaining[0]?.id || null
      setCurrentChatId(fallback)
      if (fallback) {
        await fetchChatMessages(fallback, token)
      } else {
        setMessages([{ id: 1, text: WELCOME, sender: 'bot', timestamp: new Date() }])
      }
    }
    try {
      const res = await fetch(`${API_BASE}/chat/${id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      })
      if (!res.ok) throw new Error('delete failed')
    } catch {
      setChatHistory(previous)
    }
  }

  // -----------------------------------------------------------------------
  // Send flow — handles auto-create + auto-title for the very first message.
  // -----------------------------------------------------------------------
  const refreshChatListMeta = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/chat/all`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.chats)) setChatHistory(data.chats)
    } catch {
      /* ignore */
    }
  }, [API_BASE, token])

  const handleSend = async (rawText) => {
    const text = typeof rawText === 'string' ? rawText.trim() : inputMessage.trim()
    if (!text) return

    // For logged-in users without an active thread, mint one BEFORE sending so
    // the message lands in a real chat row (not the user-id fallback bucket).
    let chatIdForThisMessage = currentChatId
    let isFirstMessageOfThread = false
    if (token) {
      if (chatIdForThisMessage == null) {
        chatIdForThisMessage = await createNewChat()
        isFirstMessageOfThread = true
      } else {
        // A "first message" is also one sent on a brand-new thread that only
        // shows the WELCOME bubble (no user/bot exchange yet).
        const nonWelcome = messages.filter((m) => m.sender === 'user' || m.id !== 1)
        isFirstMessageOfThread = nonWelcome.length === 0
      }
    }

    const userMsg = { id: messages.length + 1, text, sender: 'user', timestamp: new Date() }
    setMessages((m) => [...m, userMsg])
    if (typeof rawText !== 'string') setInputMessage('')
    setLoading(true)
    try {
      const { reply } = await postConsultant(text, chatIdForThisMessage)
      setMessages((m) => [
        ...m,
        { id: m.length + 2, text: reply, sender: 'bot', timestamp: new Date() },
      ])

      // After the first exchange in a thread, give it a real title pulled
      // from the user message so the sidebar isn't a wall of "New consultation".
      if (token && isFirstMessageOfThread && chatIdForThisMessage != null) {
        const newTitle = deriveTitleFromMessage(text)
        setChatHistory((h) =>
          h.map((c) =>
            c.id === chatIdForThisMessage && (c.title === 'New consultation' || !c.title)
              ? { ...c, title: newTitle, lastMessage: reply.slice(0, 60) }
              : c
          )
        )
        try {
          await fetch(`${API_BASE}/chat/${chatIdForThisMessage}/rename`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify({ title: newTitle }),
          })
        } catch {
          /* not fatal */
        }
      } else if (token) {
        // Refresh message count + preview on subsequent turns.
        refreshChatListMeta()
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: m.length + 2,
          text: e.message || 'Connection issue. Please ensure the API is running.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      setInputMessage('')
    }
  }

  const profileField = (key, placeholder, type = 'text') => (
    <input
      type={type}
      value={profileForm[key]}
      onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-sb-ink/60 px-2.5 py-1.5 text-xs text-sb-frost placeholder:text-sb-muted/50 outline-none focus:ring-1 focus:ring-sb-accent"
    />
  )

  // -----------------------------------------------------------------------
  // Render — header + sidebar + transcript + composer
  // -----------------------------------------------------------------------
  const sidebarVisible = !isMobile && showSidebar
  // Routes used by the in-widget CTAs. All "Sign in / Sign up" actions go to
  // the Student Portal — never the admin login — so chat history binds to the
  // student account. Admins remain authenticated via the dedicated /login
  // route from the website header.
  const STUDENT_LOGIN_PATH = '/student/login'
  const STUDENT_SIGNUP_PATH = '/student/login?mode=signup'
  const STUDENT_DASHBOARD_PATH = '/student/dashboard'
  const ADMIN_DASHBOARD_PATH = '/admin'
  const portalCtaTarget =
    session?.kind === 'admin'
      ? ADMIN_DASHBOARD_PATH
      : session?.kind === 'student'
      ? STUDENT_DASHBOARD_PATH
      : STUDENT_LOGIN_PATH

  const renderSidebarBody = () => {
    if (!isAuthed) {
      return (
        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold text-sb-frost">Guest session</p>
            <p className="mt-1 text-[10px] leading-relaxed text-sb-muted">
              Your messages stay in this browser tab only and disappear when you close it. Sign in
              to keep a permanent history of every consultation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(STUDENT_LOGIN_PATH)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-sb-accent/30 bg-sb-accent/15 px-3 py-2 text-[11px] font-bold text-white hover:bg-sb-accent/25"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in to save chats
          </button>
          <button
            type="button"
            onClick={() => navigate(STUDENT_SIGNUP_PATH)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-sb-frost hover:bg-white/[0.08]"
          >
            Create student account
          </button>
        </div>
      )
    }
    if (isLoadingChats && chatHistory.length === 0) {
      return <p className="px-4 py-6 text-center text-[11px] text-sb-muted">Loading your chats…</p>
    }
    if (chatHistory.length === 0) {
      return (
        <p className="px-3 py-6 text-center text-[11px] leading-relaxed text-sb-muted/80">
          No saved chats yet. Send your first question to start one.
        </p>
      )
    }
    return chatHistory.map((c) => {
      const isActive = currentChatId === c.id
      const isEditing = editingChatId === c.id
      const isConfirming = confirmDeleteId === c.id
      return (
        <div
          key={c.id}
          className={`group relative mb-1 rounded-xl border text-[11px] transition ${
            isActive
              ? 'border-sb-accent/40 bg-sb-accent/15'
              : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
          }`}
        >
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commitRename()
              }}
              className="flex items-center gap-1 px-2 py-2"
            >
              <input
                ref={renameInputRef}
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelRename()
                  }
                }}
                maxLength={80}
                className="flex-1 rounded-lg border border-sb-accent/40 bg-sb-ink/80 px-2 py-1 text-[11px] text-white outline-none focus:ring-1 focus:ring-sb-accent"
              />
              <button
                type="submit"
                className="rounded-md bg-sb-accent/30 p-1 text-sb-glow hover:bg-sb-accent/40"
                aria-label="Save title"
              >
                <Check className="h-3 w-3" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => switchChat(c.id)}
              className="block w-full px-2.5 py-2 text-left"
            >
              <div className="flex items-start gap-2">
                <MessageSquare
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-sb-glow' : 'text-sb-muted/70'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`line-clamp-1 font-semibold ${
                      isActive ? 'text-white' : 'text-sb-frost'
                    }`}
                  >
                    {c.title || 'Untitled consultation'}
                  </p>
                  {c.lastMessage ? (
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-sb-muted/75">
                      {c.lastMessage}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-sb-muted/50 italic">No messages yet</p>
                  )}
                  <p className="mt-0.5 text-[9px] uppercase tracking-wider text-sb-muted/55">
                    {c.messages ? `${c.messages} turns · ` : ''}
                    {relativeTime(c.created_at)}
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Hover actions — rename / delete */}
          {!isEditing && !isConfirming && (
            <div
              className={`pointer-events-none absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 ${
                isActive ? 'opacity-100 pointer-events-auto' : ''
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  startRename(c)
                }}
                className="rounded-md p-1 text-sb-muted hover:bg-white/10 hover:text-sb-glow"
                aria-label="Rename chat"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  confirmDelete(c.id)
                }}
                className="rounded-md p-1 text-sb-muted hover:bg-rose-500/20 hover:text-rose-200"
                aria-label="Delete chat"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Inline delete confirmation */}
          {isConfirming && (
            <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-rose-500/10 px-2 py-1.5">
              <span className="text-[10px] text-rose-100">Delete this chat?</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    performDelete(c.id)
                  }}
                  className="rounded-md bg-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-50 hover:bg-rose-500/50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    cancelDelete()
                  }}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-sb-frost hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  const chatShell = (
    <>
      <div className="relative shrink-0 border-b border-white/10 bg-gradient-to-r from-sb-ink via-sb-deep to-sb-navy px-4 py-3">
        <div className="absolute inset-0 bg-sb-mesh opacity-40 pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {!isMobile && (
              <button
                type="button"
                onClick={() => setShowSidebar((s) => !s)}
                className="p-2 rounded-lg text-sb-muted hover:bg-white/5 hover:text-white transition"
                aria-label="Toggle history"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sb-accent to-cyan-500 shadow-sb-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sb-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sb-glow" />
                StudyBridge
                {isAuthed && (
                  <span className="ml-1 rounded-full bg-emerald-400/15 px-1.5 py-px text-[9px] font-semibold text-emerald-200">
                    {session?.kind === 'student' ? 'Student' : 'Admin'}
                  </span>
                )}
              </p>
              <h3 className="text-sm font-bold text-white truncate">Germany admissions consultant</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isAuthed ? (
              <button
                type="button"
                onClick={() => navigate(portalCtaTarget)}
                className="hidden sm:flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-sb-frost bg-white/5 border border-white/10 hover:bg-white/10"
              >
                <LogOut className="w-3.5 h-3.5 rotate-180" />
                Portal
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(STUDENT_LOGIN_PATH)}
                className="hidden sm:flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-sb-frost bg-white/5 border border-white/10 hover:bg-white/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-sb-muted hover:bg-white/5 hover:text-white"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {sidebarVisible && (
          <div className="w-60 shrink-0 border-r border-white/10 bg-sb-deep/80 flex flex-col">
            <div className="border-b border-white/5 p-3">
              <button
                type="button"
                onClick={() => createNewChat()}
                disabled={!isAuthed}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sb-accent to-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                title={!isAuthed ? 'Sign in to start a saved chat' : 'Start a new conversation'}
              >
                <Plus className="h-3.5 w-3.5" />
                New chat
              </button>
              {isAuthed && (
                <p className="mt-2 text-center text-[9px] uppercase tracking-widest text-sb-muted/60">
                  {chatHistory.length} saved
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-3">{renderSidebarBody()}</div>
          </div>
        )}

        <div className="flex flex-1 flex-col min-w-0 bg-sb-navy/95">
          <details className="border-b border-white/10 bg-sb-deep/40 group">
            <summary className="cursor-pointer list-none px-4 py-2.5 text-[11px] font-semibold text-sb-muted flex items-center justify-between">
              <span>Academic profile (improves answers)</span>
              <span className="text-sb-glow opacity-70 group-open:rotate-180 transition">⌄</span>
            </summary>
            <div className="px-4 pb-3 grid grid-cols-2 gap-2">
              {profileField('cgpa', 'CGPA (e.g. 2.65)')}
              {profileField('cgpa_scale', 'Scale (e.g. 4)')}
              {profileField('gap_years', 'Study gap years', 'number')}
              {profileField('ielts_overall', 'IELTS overall', 'number')}
              <select
                value={profileForm.ielts_status}
                onChange={(e) => setProfileForm((p) => ({ ...p, ielts_status: e.target.value }))}
                className="col-span-2 rounded-lg border border-white/10 bg-sb-ink/60 px-2.5 py-1.5 text-xs text-sb-frost outline-none"
              >
                <option value="">English proof status…</option>
                <option value="has_score">IELTS score available</option>
                <option value="without_ielts_exploring">Exploring MOI / without IELTS</option>
              </select>
              {profileField('degree_level', 'Degree (e.g. BSc CS)')}
              {profileField('field_of_study', 'Field / major')}
              {profileField('budget_eur_year', 'Budget (EUR/year)', 'number')}
              {profileField('work_experience_years', 'Work years', 'number')}
              {profileField('preferred_intake', 'Preferred intake')}
              {profileField('education_background', 'Education background')}
            </div>
          </details>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-br from-sb-accent to-blue-700 text-white rounded-br-md'
                      : 'bg-white/[0.06] border border-white/10 text-sb-frost rounded-bl-md border-l-2 border-l-sb-accent/80'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className={`text-[10px] mt-1.5 ${m.sender === 'user' ? 'text-white/70' : 'text-sb-muted'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-sb-muted animate-pulse">
                  Preparing your tailored guidance…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-white/10 bg-sb-deep/90 p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {PRIMARY_SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSend(s.question)}
                  disabled={loading}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-sb-frost hover:bg-sb-accent/20 hover:border-sb-accent/40 transition disabled:opacity-40"
                >
                  {s.text}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                rows={2}
                placeholder="Ask about APS, Uni-Assist, eligibility, visa, blocked account…"
                className="flex-1 resize-none rounded-xl border border-white/10 bg-sb-ink/80 px-3 py-2 text-sm text-white placeholder:text-sb-muted/45 outline-none focus:ring-2 focus:ring-sb-accent/40"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !inputMessage.trim()}
                className="self-end p-3 rounded-xl bg-gradient-to-br from-sb-accent to-blue-600 text-white shadow-sb-glow disabled:opacity-40 disabled:shadow-none"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-sb-muted text-center">
              {isAuthed ? (
                <>
                  Your chats are saved to your account.{' '}
                  <Link to={portalCtaTarget} className="text-sb-glow hover:underline font-semibold">
                    Open portal
                  </Link>{' '}
                  to upload documents.
                </>
              ) : (
                <>
                  <Link to={STUDENT_LOGIN_PATH} className="text-sb-glow hover:underline font-semibold">
                    Sign in
                  </Link>{' '}
                  or{' '}
                  <Link to={STUDENT_SIGNUP_PATH} className="text-sb-glow hover:underline font-semibold">
                    create a student account
                  </Link>{' '}
                  to keep your chat history permanent across devices.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col items-end gap-3">
      {isOpen && (
        <>
          <div className="hidden md:flex h-[min(72vh,560px)] w-[min(92vw,820px)] max-w-[820px] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-sb-card bg-sb-navy backdrop-blur-xl">
            {chatShell}
          </div>
          <div className="md:hidden fixed inset-0 flex flex-col bg-sb-navy border border-white/5">
            <div className="flex h-full min-h-0 flex-col">{chatShell}</div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sb-accent via-blue-600 to-cyan-500 text-white shadow-sb-glow ring-2 ring-white/10 transition hover:scale-105 hover:brightness-110"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        <GraduationCap className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-sb-navy animate-pulse" />
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-lg border border-white/10 bg-sb-deep px-3 py-1.5 text-[11px] font-semibold text-sb-frost shadow-xl group-hover:block">
          StudyBridge consultant
        </span>
      </button>
    </div>
  )
}

export default Chatbot
