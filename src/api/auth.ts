import { API_BASE, postJsonEnvelope, setToken, unwrapEnvelope } from './client'
import type { ApiEnvelope, LoginResult, PublicUser } from './types'

function parseMessage(json: unknown, fallback: string): string {
  if (json && typeof json === 'object' && 'message' in json) {
    const m = (json as { message: unknown }).message
    if (Array.isArray(m)) return m.join(', ')
    if (typeof m === 'string') return m
  }
  return fallback
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = (await res.json()) as ApiEnvelope<LoginResult>
  if (!res.ok || !json.success) {
    throw new Error(parseMessage(json, 'Login failed'))
  }
  setToken(json.data.accessToken)
}

export function fetchMe() {
  return unwrapEnvelope<PublicUser>('/auth/me')
}

export async function changePassword(body: {
  currentPassword: string
  newPassword: string
}) {
  return postJsonEnvelope<{ ok: boolean }, typeof body>(
    '/auth/change-password',
    body,
  )
}

export async function registerResident(body: {
  email: string
  password: string
  fullName: string
  communityId?: string
}): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as ApiEnvelope<LoginResult>
  if (!res.ok || !json.success) {
    throw new Error(parseMessage(json, 'Registration failed'))
  }
}
