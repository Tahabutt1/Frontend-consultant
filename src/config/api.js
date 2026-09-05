/**
 * API origin for JSON requests.
 * - Development: leave VITE_API_URL unset → same-origin `/api/...` with the Vite proxy.
 * - Production (Vercel): set VITE_API_URL in the project environment (no trailing slash).
 *   Do not hardcode a production backend URL here.
 * - VITE_API_BASE_URL is accepted as a fallback name.
 */
const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
const normalized =
  typeof raw === 'string' && raw.trim().length > 0 ? raw.trim().replace(/\/$/, '') : ''

export const API_ORIGIN = normalized

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  if (API_ORIGIN) {
    return `${API_ORIGIN}${p}`
  }
  return p
}
