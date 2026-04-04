import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  fetchCommunityAccessLogs,
  fetchCommunityAccessToken,
  postCommunityAccessTokenCheckIn,
  postCommunityAccessTokenCheckOut,
  type AccessLogRow,
  type CommunityAccessTokenRow,
} from '@/api/facility'
import { getAccessDashboardRowById } from './accessDashboardMock'
import { getEffectiveAccessTokenDisplayStatus, getEffectiveMockStatusFromValidity } from './accessDisplayStatus'
import { formatDurationFromMockValidity, formatDurationFromValidityIso } from './accessDuration'

function formatUsDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

export type AccessDetailFields = {
  guestName: string
  accessTokenDisplay: string
  block: string
  accessType: string
  status: string
  checkInTime: string
  checkOutTime: string
  arrivalDate: string
  validity: string
  date: string
  duration: string
}

function detailFromApiLog(log: AccessLogRow): AccessDetailFields {
  const d = formatUsDate(log.createdAt)
  return {
    guestName: log.userId ?? '—',
    accessTokenDisplay: log.id.length > 7 ? `${log.id.slice(0, 7)}…` : log.id,
    block: '—',
    accessType: log.credentialType ?? '—',
    status: 'Active',
    checkInTime: d,
    checkOutTime: d,
    arrivalDate: d,
    validity: `${d} - ${d}`,
    date: d,
    duration: '—',
  }
}

function detailFromMock(row: NonNullable<ReturnType<typeof getAccessDashboardRowById>>): AccessDetailFields {
  return {
    guestName: row.guestName,
    accessTokenDisplay: row.tokenPreview,
    block: row.block,
    accessType: row.accessType,
    status: getEffectiveMockStatusFromValidity(row.validity),
    checkInTime: row.checkInTime,
    checkOutTime: row.checkOutTime,
    arrivalDate: row.arrivalDate,
    validity: row.validity,
    date: row.date,
    duration: formatDurationFromMockValidity(row.validity),
  }
}

function detailFromApiToken(r: CommunityAccessTokenRow): AccessDetailFields {
  const vf = r.validFrom ? formatUsDate(r.validFrom) : '—'
  const vt = r.validTo ? formatUsDate(r.validTo) : '—'
  const c = formatUsDate(r.createdAt)
  let validity = '—'
  if (r.validFrom && r.validTo) validity = `${vf} - ${vt}`
  else if (r.validTo) validity = `— - ${vt}`
  else if (r.validFrom) validity = `${vf} - —`
  return {
    guestName: r.guestName ?? '—',
    accessTokenDisplay: r.tokenPreview,
    block: r.hostUnitLabel ?? '—',
    accessType: r.accessType,
    status: getEffectiveAccessTokenDisplayStatus({
      status: r.status,
      validFromIso: r.validFrom,
      validToIso: r.validTo,
    }),
    checkInTime: vf,
    checkOutTime: vt,
    arrivalDate: c,
    validity,
    date: c,
    duration: formatDurationFromValidityIso(r.validFrom, r.validTo, r.createdAt),
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-start sm:gap-8">
      <p className="text-sm text-[#9CA3AF]">{label}</p>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}

export default function AccessDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [apiLog, setApiLog] = useState<AccessLogRow | null>(null)
  const [apiToken, setApiToken] = useState<CommunityAccessTokenRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showNotAvailable, setShowNotAvailable] = useState(false)
  const [checkInOutBusy, setCheckInOutBusy] = useState<'in' | 'out' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const mockRow = id ? getAccessDashboardRowById(id) : undefined

  const load = useCallback(async () => {
    if (!id || mockRow) return
    setLoading(true)
    setApiToken(null)
    setApiLog(null)
    try {
      try {
        const t = await fetchCommunityAccessToken(id)
        setApiToken(t)
      } catch {
        const rows = await fetchCommunityAccessLogs()
        setApiLog(rows.find((l) => l.id === id) ?? null)
      }
    } catch {
      setApiLog(null)
      setApiToken(null)
    } finally {
      setLoading(false)
    }
  }, [id, mockRow])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!actionSuccess) return
    const t = window.setTimeout(() => setActionSuccess(null), 4000)
    return () => window.clearTimeout(t)
  }, [actionSuccess])

  const canCheckInOut = Boolean(apiToken && id && !mockRow)
  /** Log-only detail view has no token id — check-in/out need a token row. */
  const checkButtonsDisabled =
    loading || Boolean(checkInOutBusy) || (!canCheckInOut && !mockRow)

  const onCheckIn = async () => {
    setActionError(null)
    if (mockRow) {
      setShowNotAvailable(true)
      return
    }
    if (!canCheckInOut || !id) {
      setShowNotAvailable(true)
      return
    }
    setCheckInOutBusy('in')
    try {
      await postCommunityAccessTokenCheckIn(id)
      await load()
      setActionSuccess('Check-in recorded.')
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Check-in failed.')
    } finally {
      setCheckInOutBusy(null)
    }
  }

  const onCheckOut = async () => {
    setActionError(null)
    if (mockRow) {
      setShowNotAvailable(true)
      return
    }
    if (!canCheckInOut || !id) {
      setShowNotAvailable(true)
      return
    }
    setCheckInOutBusy('out')
    try {
      await postCommunityAccessTokenCheckOut(id)
      await load()
      setActionSuccess('Check-out recorded.')
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Check-out failed.')
    } finally {
      setCheckInOutBusy(null)
    }
  }

  const detail: AccessDetailFields | null = useMemo(() => {
    if (mockRow) return detailFromMock(mockRow)
    if (apiToken) return detailFromApiToken(apiToken)
    if (apiLog) return detailFromApiLog(apiLog)
    return null
  }, [mockRow, apiToken, apiLog])

  if (!id) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
        Missing access id.
      </div>
    )
  }

  if (!mockRow && loading) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
        Loading…
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
        Access record not found.
        <div className="mt-4">
          <Link to="/facility/access" className="text-sm font-semibold text-[#F97316] hover:underline">
            Back to Access Management
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm hover:bg-[#F9FAFB]"
            aria-label="Back"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-[#111827]">Access Details</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void onCheckIn()}
            disabled={checkButtonsDisabled}
            title={
              !mockRow && !apiToken && apiLog
                ? 'Open this access from Access Management (token list) to check in or out.'
                : undefined
            }
            className="rounded-full bg-[#F97316] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#ea6a0f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkInOutBusy === 'in' ? 'Checking in…' : 'Check In'}
          </button>
          <button
            type="button"
            onClick={() => void onCheckOut()}
            disabled={checkButtonsDisabled}
            title={
              !mockRow && !apiToken && apiLog
                ? 'Open this access from Access Management (token list) to check in or out.'
                : undefined
            }
            className="rounded-full bg-[#F97316] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#ea6a0f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkInOutBusy === 'out' ? 'Checking out…' : 'Check Out'}
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316] text-white shadow-sm hover:bg-[#ea6a0f]"
            aria-label="Delete"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {(actionError || actionSuccess) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            actionError
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
          role="status"
        >
          {actionError ?? actionSuccess}
        </div>
      )}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-base font-semibold text-[#6B7280]">Access Details</h2>
        <div className="space-y-5">
          <DetailRow label="Guest Name" value={detail.guestName} />
          {apiToken && <DetailRow label="Host (resident)" value={apiToken.hostName} />}
          <DetailRow label="Access Token" value={detail.accessTokenDisplay} />
          {apiToken && (
            <p className="text-xs leading-relaxed text-[#9CA3AF]">
              The full token is only shown once when created. The value above is a masked reference (digest
              prefix), not the guest passcode.
            </p>
          )}
          <DetailRow label="Block" value={detail.block} />
          <DetailRow label="Access Type" value={detail.accessType} />
          <DetailRow label="Status" value={detail.status} />
          <DetailRow label="Check In Time" value={detail.checkInTime} />
          <DetailRow label="Check Out Time" value={detail.checkOutTime} />
          <DetailRow label="Arrival Date" value={detail.arrivalDate} />
          <DetailRow label="Validity" value={detail.validity} />
          <DetailRow label="Date" value={detail.date} />
          <DetailRow label="Duration" value={detail.duration} />
        </div>
      </section>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">Delete access?</h3>
            <p className="mt-2 text-sm text-[#6B7280]">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDelete(false)
                  setShowNotAvailable(true)
                }}
                className="rounded-full bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea6a0f]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotAvailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">Not available</h3>
            <p className="mt-2 text-sm text-[#6B7280]">This action is not wired to the API yet.</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNotAvailable(false)}
                className="rounded-full bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea6a0f]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
