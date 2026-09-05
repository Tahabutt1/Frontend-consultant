/**
 * API origin for JSON requests.
 * - In Vercel production: Uses VITE_API_URL or defaults to Railway backend URL.
 * - In local development: If VITE_API_URL is unset, defaults to same-origin '' with Vite proxy.
 */
const DEFAULT_RAILWAY_URL = 'https://backend-consultant-production-f3ba.up.railway.app'

const raw =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? DEFAULT_RAILWAY_URL : '')

const normalized =
  typeof raw === 'string' && raw.trim().length > 0
    ? raw.trim().replace(/\/+$/, '').replace(/\/api\/?$/, '')
    : ''

export const API_ORIGIN = normalized

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  if (API_ORIGIN) {
    return `${API_ORIGIN}${p}`
  }
  return p
}
