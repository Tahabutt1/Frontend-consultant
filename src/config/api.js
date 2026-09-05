/**
 * API origin for JSON requests.
 * - Development: leave VITE_API_URL unset → same-origin `/api/...` with the Vite proxy.
 * - Production (Vercel): set VITE_API_URL in the project environment (no trailing slash).
 *   Do not hardcode a production backend URL here.
 * - VITE_API_BASE_URL is accepted as a fallback name.
 */
const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
const normalized =
  typeof raw === 'string' && raw.trim().length > 0
    ? raw.trim().replace(/\/+$/, '').replace(/\/api\/?$/, '')
    : ''

export const API_ORIGIN = normalized

if (import.meta.env.PROD && !API_ORIGIN) {
  console.warn(
    '[MRTK StudyBridge] VITE_API_URL is missing! Please configure VITE_API_URL in your Vercel Project Settings and redeploy.'
  )
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  if (API_ORIGIN) {
    return `${API_ORIGIN}${p}`
  }
  return p
}
