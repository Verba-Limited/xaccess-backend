/** Human-readable duration from a validity window (hours → days → months → years). */

function diffCalendarMonths(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  return Math.max(0, months)
}

function formatDurationBetween(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime()
  if (Number.isNaN(ms) || ms <= 0) return '—'

  const totalHours = ms / (1000 * 60 * 60)
  const totalDays = ms / (1000 * 60 * 60 * 24)

  if (totalHours < 48) {
    const rounded = Math.round(totalHours * 10) / 10
    const hrs = rounded < 0.1 ? 1 : Math.max(1, rounded)
    return hrs === 1 ? '1 hour' : `${hrs} hours`
  }

  if (totalDays < 30) {
    const d = Math.max(1, Math.floor(totalDays))
    return d === 1 ? '1 day' : `${d} days`
  }

  const months = diffCalendarMonths(start, end)
  if (months < 24) {
    if (months < 1) {
      const d = Math.max(1, Math.floor(totalDays))
      return d === 1 ? '1 day' : `${d} days`
    }
    return months === 1 ? '1 month' : `${months} months`
  }

  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return years === 1 ? '1 year' : `${years} years`
  const yLabel = years === 1 ? '1 year' : `${years} years`
  const mLabel = rem === 1 ? '1 month' : `${rem} months`
  return `${yLabel} ${mLabel}`
}

/** Parses mock validity like "05/08/2024 - 05/10/2024" (MM/DD/YYYY). */
export function parseMockValidityRange(validity: string): { start: Date; end: Date } | null {
  const parts = validity.split(/\s*-\s*/)
  if (parts.length !== 2) return null
  const parse = (s: string): Date | null => {
    const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!m) return null
    const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]))
    return Number.isNaN(d.getTime()) ? null : d
  }
  const a = parse(parts[0])
  const b = parse(parts[1])
  if (!a || !b) return null
  return { start: a, end: b }
}

export function formatDurationFromMockValidity(validity: string): string {
  const range = parseMockValidityRange(validity)
  if (!range) return '—'
  return formatDurationBetween(range.start, range.end)
}

export function formatDurationFromValidityIso(
  validFromIso: string | null | undefined,
  validToIso: string | null | undefined,
  createdAtIso?: string | null,
): string {
  const ok = (d: Date | null): Date | null =>
    d && !Number.isNaN(d.getTime()) ? d : null

  const startD = ok(validFromIso ? new Date(validFromIso) : null)
  const endD = ok(validToIso ? new Date(validToIso) : null)
  const createdD = ok(createdAtIso ? new Date(createdAtIso) : null)

  if (!startD && !endD) return '—'
  if (startD && !endD) return 'Indefinite'
  if (!startD && endD) {
    if (!createdD) return '—'
    return formatDurationBetween(createdD, endD)
  }
  return formatDurationBetween(startD!, endD!)
}
