import { parseMockValidityRange } from './accessDuration'

/** UI label for facility access detail / lists (expired tokens show as Inactive). */
export function getEffectiveAccessTokenDisplayStatus(input: {
  status: string
  validFromIso?: string | null
  validToIso?: string | null
}): string {
  const now = Date.now()
  const s = input.status.trim().toUpperCase()
  if (s === 'REVOKED') return 'Revoked'
  if (s === 'EXPIRED') return 'Inactive'

  const vf = input.validFromIso ? new Date(input.validFromIso).getTime() : NaN
  const vt = input.validToIso ? new Date(input.validToIso).getTime() : NaN

  if (s === 'ACTIVE') {
    if (!Number.isNaN(vt) && now > vt) return 'Inactive'
    if (!Number.isNaN(vf) && now < vf) return 'Pending'
    return 'Active'
  }
  return input.status
}

/** Mock rows: compare today to validity end date (local calendar). */
export function getEffectiveMockStatusFromValidity(validity: string): string {
  const range = parseMockValidityRange(validity)
  if (!range) return 'Active'
  const now = new Date()
  const endOfEndDay = new Date(range.end)
  endOfEndDay.setHours(23, 59, 59, 999)
  if (now > endOfEndDay) return 'Inactive'
  const startOfStartDay = new Date(range.start)
  startOfStartDay.setHours(0, 0, 0, 0)
  if (now < startOfStartDay) return 'Pending'
  return 'Active'
}
