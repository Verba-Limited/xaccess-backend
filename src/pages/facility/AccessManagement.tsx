import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  Key,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import {
  fetchCommunityAccessTokens,
  type CommunityAccessTokenRow,
} from '@/api/facility'
import { getEffectiveAccessTokenDisplayStatus } from '@/pages/facility/accessDisplayStatus'

function ThWithIcon({
  icon: Icon,
  label,
}: {
  icon: typeof User
  label: string
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
      <span className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
        {label}
      </span>
    </th>
  )
}

function StatCard({
  value,
  label,
  subtitle,
  subtitleIcon: SubIcon,
}: {
  value: string | number
  label: string
  subtitle: string
  subtitleIcon: typeof Calendar | typeof Database
}) {
  return (
    <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="text-3xl font-bold tabular-nums text-brand">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
        <SubIcon className="h-4 w-4 text-gray-400" strokeWidth={2} />
        {subtitle}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-800">{label}</p>
    </div>
  )
}

export function AccessManagement() {
  const [rows, setRows] = useState<CommunityAccessTokenRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    fetchCommunityAccessTokens()
      .then(setRows)
      .catch((e: Error) => setErr(e.message ?? 'Failed to load access tokens'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const counts = useMemo(() => {
    const total = rows.length
    let active = 0
    let inactive = 0
    let revoked = 0
    let pending = 0
    for (const r of rows) {
      const d = getEffectiveAccessTokenDisplayStatus({
        status: r.status,
        validFromIso: r.validFrom,
        validToIso: r.validTo,
      })
      if (d === 'Active') active += 1
      else if (d === 'Inactive') inactive += 1
      else if (d === 'Revoked') revoked += 1
      else if (d === 'Pending') pending += 1
    }
    return { total, active, inactive, revoked, pending }
  }, [rows])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => {
      const display = getEffectiveAccessTokenDisplayStatus({
        status: r.status,
        validFromIso: r.validFrom,
        validToIso: r.validTo,
      })
      return (
        (r.guestName ?? '').toLowerCase().includes(s) ||
        r.hostName.toLowerCase().includes(s) ||
        r.tokenPreview.toLowerCase().includes(s) ||
        r.accessType.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        display.toLowerCase().includes(s)
      )
    })
  }, [rows, q])

  const totalFiltered = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / rowsPerPage) || 1)
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * rowsPerPage
  const pageRows = filtered.slice(start, start + rowsPerPage)

  const rangeLabel = (() => {
    if (totalFiltered === 0) return '0 of 0'
    const from = String(start + 1).padStart(2, '0')
    const to = String(Math.min(start + rowsPerPage, totalFiltered)).padStart(2, '0')
    const tot = String(totalFiltered).padStart(2, '0')
    return `${from} - ${to} of ${tot}`
  })()

  return (
    <div className="space-y-6 pb-8">
      {deleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              Removing an access entry is not available in this release.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark"
              onClick={() => setDeleteOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {err && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{err}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-red-800 ring-1 ring-red-200 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={counts.total} label="Total tokens" subtitle="Generated" subtitleIcon={Database} />
        <StatCard
          value={counts.active}
          label="Active"
          subtitle={counts.pending ? `${counts.pending} scheduled` : 'Current'}
          subtitleIcon={Calendar}
        />
        <StatCard value={counts.inactive} label="Inactive" subtitle="Expired window" subtitleIcon={Database} />
        <StatCard value={counts.revoked} label="Revoked" subtitle="Total" subtitleIcon={Database} />
      </div>

      <p className="text-xs text-gray-500">
        Tokens are created by residents from the app. The full secret is only shown once at creation; this list shows a
        masked reference (digest prefix) for each record.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search admins..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none ring-brand focus:ring-2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8E8ED] bg-gray-50/90">
                <ThWithIcon icon={User} label="Guest Name" />
                <ThWithIcon icon={User} label="Host Nmae" />
                <ThWithIcon icon={CreditCard} label="Access Token" />
                <ThWithIcon icon={Key} label="Access Type" />
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    {err ? 'Could not load data.' : 'No access tokens yet. When residents generate guest access from the mobile app, they will appear here.'}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3.5 text-gray-600">{row.guestName ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.hostName}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-700">{row.tokenPreview}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.accessType}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-3">
                        <Link
                          to={`/facility/access/${row.id}`}
                          className="text-sm font-semibold text-brand hover:underline"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteOpen(true)}
                          className="text-brand hover:opacity-80"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-[#E8E8ED] px-4 py-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <span>Row per page:</span>
            <select
              className="rounded-lg border border-amber-100 bg-amber-50/80 px-2 py-1.5 text-xs font-medium text-gray-800"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(1)
              }}
            >
              {[7, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {String(n).padStart(2, '0')}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">{rangeLabel}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
