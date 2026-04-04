import { patchJsonEnvelope, postJsonEnvelope, unwrapEnvelope } from './client'
import type { PublicUser } from './types'

export type AccessLogRow = {
  id: string
  communityId: string
  userId: string | null
  action: string
  credentialType: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type CommunityContext = {
  community: { id: string; name: string; slug: string } | null
  administrator: { fullName: string; phone: string | null; email: string } | null
}

export type HardwareDeviceRow = {
  id: string
  communityId: string
  name: string
  type: string
  lastSeenAt: string | null
  isActive: boolean
  createdAt: string
}

export async function fetchCommunityContext() {
  return unwrapEnvelope<CommunityContext>('/users/community/context')
}

export async function fetchCommunityResidents() {
  return unwrapEnvelope<PublicUser[]>('/users/residents')
}

export async function fetchCommunityAccessLogs() {
  return unwrapEnvelope<AccessLogRow[]>('/access/logs/community')
}

/** Emergency / alarm incidents reported by residents (mobile “Call for help”). */
export type CommunityIncidentRow = {
  id: string
  category: string
  notes: string | null
  createdAt: string
  residentId: string
  residentName: string
  residentEmail: string | null
  unitLabel: string | null
}

export async function fetchCommunityIncidents() {
  return unwrapEnvelope<CommunityIncidentRow[]>(`/incidents/community`)
}

/** Access token history for facility admin (plain secret is never stored server-side). */
export type CommunityAccessTokenRow = {
  id: string
  guestName: string | null
  hostName: string
  hostId: string
  hostUnitLabel: string | null
  tokenPreview: string
  accessType: string
  status: string
  validFrom: string | null
  validTo: string | null
  createdAt: string
}

export async function fetchCommunityAccessTokens() {
  return unwrapEnvelope<CommunityAccessTokenRow[]>('/access/tokens/community')
}

export async function fetchCommunityAccessToken(id: string) {
  return unwrapEnvelope<CommunityAccessTokenRow>(`/access/tokens/community/${id}`)
}

export type CommunityInvoiceApiRow = {
  id: string
  invoiceNumber: string
  title: string
  amountMinor: number
  currency: string
  status: string
  dueDate: string
  paidAt: string | null
  createdAt: string
  residentName: string
  residentEmail: string | null
  unitLabel: string | null
}

export async function fetchCommunityInvoices() {
  return unwrapEnvelope<CommunityInvoiceApiRow[]>(`/billing/community/invoices`)
}

export async function postCommunityAccessTokenCheckIn(tokenId: string) {
  return postJsonEnvelope<{ ok: boolean }, Record<string, never>>(
    `/access/tokens/community/${tokenId}/check-in`,
    {},
  )
}

export async function postCommunityAccessTokenCheckOut(tokenId: string) {
  return postJsonEnvelope<{ ok: boolean }, Record<string, never>>(
    `/access/tokens/community/${tokenId}/check-out`,
    {},
  )
}

export async function fetchHardwareDevices() {
  return unwrapEnvelope<HardwareDeviceRow[]>('/hardware/devices')
}

export async function updateResidentStatus(id: string, isActive: boolean) {
  return patchJsonEnvelope<PublicUser, { isActive: boolean }>(
    `/users/residents/${id}/status`,
    { isActive },
  )
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
