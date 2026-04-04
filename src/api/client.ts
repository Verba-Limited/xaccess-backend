import type { ApiEnvelope } from './types'

/**
 * API base (must include `/api/v1`).
 * - Dev: default `/api/v1` so the Vite dev server proxies `/api` → `http://localhost:3000` (see `vite.config.ts`).
 * - Prod build: set `VITE_API_URL` to your deployed API, or defaults to localhost:3000.
 */
export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '/api/v1' : 'http://localhost:3000/api/v1')

const TOKEN_KEY = 'xaccess_admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function parseError(json: unknown, statusText: string): string {
  if (json && typeof json === 'object' && 'message' in json) {
    const m = (json as { message: unknown }).message
    if (Array.isArray(m)) return m.join(', ')
    if (typeof m === 'string') return m
  }
  return statusText
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    let msg = parseError(json, res.statusText)
    if (
      res.status === 404 &&
      typeof msg === 'string' &&
      (msg.startsWith('Cannot GET') || msg.startsWith('Cannot POST'))
    ) {
      msg += ` — Restart the API from the repo: cd api && npm run start:dev:build (or npm run build && npm run start:dev). Startup logs must show CommunityAdminsController and Mapped {/api/admin/community-admins, POST}.`
    }
    throw new Error(msg)
  }

  return json as T
}

export async function unwrapEnvelope<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const env = await apiRequest<ApiEnvelope<T>>(path, init)
  if (!env.success) {
    throw new Error(env.message || 'Request failed')
  }
  return env.data
}

export async function postJsonEnvelope<T, B>(
  path: string,
  body: B,
): Promise<T> {
  return unwrapEnvelope<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function patchJsonEnvelope<T, B>(
  path: string,
  body: B,
): Promise<T> {
  return unwrapEnvelope<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function deleteJsonEnvelope<T>(path: string): Promise<T> {
  return unwrapEnvelope<T>(path, { method: 'DELETE' })
}
