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
  serialNumber: string | null
  lastSeenAt: string | null
  isActive: boolean
  /** True when the device currently has an active WebSocket connection on port 7788 */
  isConnected: boolean
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

export type CreateCommunityChargesPayload = {
  title: string
  amountMinor: number
  currency?: string
  dueDate: string
  residentIds: string[]
}

export type CreatedCommunityInvoiceRow = {
  id: string
  invoiceNumber: string
  title: string
  amountMinor: number
  currency: string
  status: string
  dueDate: string
  userId: string
}

export async function postCommunityCharges(body: CreateCommunityChargesPayload) {
  return postJsonEnvelope<
    { created: number; invoices: CreatedCommunityInvoiceRow[] },
    CreateCommunityChargesPayload
  >('/billing/community/invoices', body)
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

/** Facility admin: community utility rollup (last 12 months aggregated). */
export type CommunityUtilitySummary = {
  monthsInView: number
  totals: { electricityKwh: number; waterM3: number }
  chartPoints: {
    label: string
    yearMonth: string
    electricityKwh: number
    waterM3: number
    powerPct: number
    waterPct: number
    residentCount: number
  }[]
}

export async function fetchCommunityUtilitySummary() {
  return unwrapEnvelope<CommunityUtilitySummary>(
    '/utilities/community/summary',
  )
}

export type ResidentUtilityRow = {
  residentId: string
  fullName: string
  unitLabel: string | null
  lastReadingMonth: string | null
  electricityKwh: number | null
  waterM3: number | null
  utilityPeriodKey: string | null
  utilityPaidForPeriod: boolean
  utilityRemainingPowerKwh: number | null
  utilityRemainingWaterM3: number | null
}

export type CommunityUtilityConfigRow = {
  measurementPeriod: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  serviceChargeMinor: number
  includedPowerKwh: number
  includedWaterM3: number
  currency: string
  isActive: boolean
}

export async function fetchCommunityUtilityResidents() {
  return unwrapEnvelope<ResidentUtilityRow[]>(
    '/utilities/community/residents',
  )
}

export async function fetchCommunityUtilityConfig() {
  return unwrapEnvelope<CommunityUtilityConfigRow>(
    '/utilities/community/config',
  )
}

export async function patchCommunityUtilityConfig(
  body: Partial<CommunityUtilityConfigRow>,
) {
  return patchJsonEnvelope<
    CommunityUtilityConfigRow,
    Partial<CommunityUtilityConfigRow>
  >('/utilities/community/config', body)
}

export async function postResidentUtilityConsumption(
  residentId: string,
  body: { powerKwh?: number; waterM3?: number },
) {
  return postJsonEnvelope<unknown, typeof body>(
    `/utilities/community/residents/${residentId}/consumption`,
    body,
  )
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
