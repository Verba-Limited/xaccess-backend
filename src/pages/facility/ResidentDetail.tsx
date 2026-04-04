import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  fetchCommunityAccessLogs,
  fetchCommunityResidents,
  updateResidentStatus,
  type AccessLogRow,
} from '@/api/facility'
import type { PublicUser } from '@/api/types'

function formatUsDate(iso?: string) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '—'
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${mm}/${dd}/${yyyy}`
  } catch {
    return '—'
  }
}

function formatPhoneDisplay(phone: string | null | undefined) {
  if (!phone?.trim()) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function humanizeActivity(action: string): string {
  const a = action.trim()
  if (!a) return '—'
  const map: Record<string, string> = {
    SIGN_IN: 'Signed In',
    PAYMENT: 'Made Payment',
    GENERATE_TOKEN: 'Generated Access Token',
    CREATE_USER: 'Created new user account',
  }
  if (map[a]) return map[a]
  return a
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(160px,240px)_1fr] sm:items-baseline sm:gap-8">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

export function ResidentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [logs, setLogs] = useState<AccessLogRow[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteInfoOpen, setDeleteInfoOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setErr(null)
    Promise.all([fetchCommunityResidents(), fetchCommunityAccessLogs().catch(() => [])])
      .then(([rows, accessLogs]) => {
        const u = rows.find((r) => r.id === id) ?? null
        setUser(u)
        setLogs(accessLogs)
        if (!u) setErr('Resident not found in this facility.')
      })
      .catch((e: Error) => setErr(e.message))
  }, [id])

  const activityForUser = useMemo(() => {
    if (!user) return []
    return logs
      .filter((l) => l.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12)
  }, [logs, user])

  async function toggleActive() {
    if (!user) return
    setBusy(true)
    setErr(null)
    try {
      const next = await updateResidentStatus(user.id, !user.isActive)
      setUser(next)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  if (!id) {
    return <p className="text-sm text-gray-600">Invalid link.</p>
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {err && !user && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      )}

      {user && (
        <>
          {deleteInfoOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="resident-delete-info-title"
                className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
              >
                <p id="resident-delete-info-title" className="text-sm leading-relaxed text-gray-700">
                  Removing a resident from the directory is not available in this release.
                </p>
                <button
                  type="button"
                  className="mt-6 w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark"
                  onClick={() => setDeleteInfoOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-10">
          {/* Header: back + title + actions */}
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Resident Information
              </h1>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-4 sm:justify-end">
              <button
                type="button"
                role="switch"
                aria-checked={user.isActive}
                disabled={busy}
                onClick={() => void toggleActive()}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 ${
                  user.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    user.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>

              <button
                type="button"
                disabled
                className="text-sm font-semibold text-brand opacity-70"
                title="Coming soon"
              >
                Make As Privilege
              </button>

              <button
                type="button"
                onClick={() => setDeleteInfoOpen(true)}
                className="text-brand transition-opacity hover:opacity-80"
                aria-label="Delete resident"
              >
                <Trash2 className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {err && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
          )}

          {/* Resident Details */}
          <section className="mb-12">
            <h2 className="mb-6 text-base font-semibold text-gray-900">Resident Details</h2>
            <dl className="space-y-5">
              <DetailRow label="Resident Name" value={user.fullName} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone Number" value={formatPhoneDisplay(user.phone)} />
              <DetailRow label="Apartment" value={user.unitLabel?.trim() || '—'} />
              <DetailRow
                label="Status"
                value={user.isActive ? 'Active' : 'Inactive'}
              />
              <DetailRow label="Registration Date" value={formatUsDate(user.createdAt)} />
            </dl>
          </section>

          {/* Invoice Details */}
          <section className="mb-12">
            <h2 className="mb-6 text-base font-semibold text-gray-900">Invoice Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(160px,240px)_1fr] sm:items-baseline sm:gap-8">
                <dt className="text-sm text-gray-500">Pending Payments</dt>
                <dd className="text-sm font-medium text-gray-900">None</dd>
              </div>
              <button
                type="button"
                disabled
                className="text-left text-sm font-semibold text-brand opacity-70"
                title="Coming soon"
              >
                Create Personalize Invoice Plan
              </button>
            </div>
          </section>

          {/* Activity Log */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-900">Activity Log:</h2>
            <div className="overflow-hidden rounded-lg border border-[#E8E8ED] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100/90">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activityForUser.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-10 text-center text-gray-500">
                        No activity recorded for this resident.
                      </td>
                    </tr>
                  ) : (
                    activityForUser.map((log) => (
                      <tr key={log.id}>
                        <td className="px-5 py-3.5 text-gray-800">
                          {formatUsDate(log.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-gray-800">
                          {humanizeActivity(log.action)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-10 text-center text-sm text-gray-500">
            <Link to="/facility/residents" className="font-semibold text-brand hover:underline">
              Back to resident list
            </Link>
          </p>
          </div>
        </>
      )}
    </div>
  )
}
