import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  UserRound,
} from 'lucide-react'
import { MOCK_ACTIVITIES, type ActivityRow } from './mockData'

export function RecentActivities() {
  const [rows] = useState<ActivityRow[]>(MOCK_ACTIVITIES)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(7)

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage))
  const pageSlice = useMemo(() => {
    const start = (page - 1) * perPage
    return rows.slice(start, start + perPage)
  }, [rows, page, perPage])

  useEffect(() => {
    setPage(1)
  }, [perPage])

  const total = rows.length
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recent Activities</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Date
                </span>
              </th>
              <th className="px-5 py-4">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Time
                </span>
              </th>
              <th className="px-5 py-4">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Admin Name
                </span>
              </th>
              <th className="px-5 py-4">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Facility
                </span>
              </th>
              <th className="px-5 py-4">
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Activity Description
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                  No activities yet.
                </td>
              </tr>
            ) : (
              pageSlice.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-gray-900 tabular-nums">{r.date}</td>
                  <td className="px-5 py-4 text-gray-700 tabular-nums">{r.time}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{r.adminName}</td>
                  <td className="px-5 py-4 text-gray-700">{r.facility}</td>
                  <td className="px-5 py-4 text-gray-700">{r.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-brand-light px-3 py-1.5 text-sm font-medium text-gray-800 outline-none ring-brand focus:ring-2"
          >
            {[5, 7, 10, 20].map((n) => (
              <option key={n} value={n}>
                {String(n).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="tabular-nums">
            {start.toString().padStart(2, '0')} – {end.toString().padStart(2, '0')} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`rounded-lg border p-1.5 transition-colors disabled:opacity-40 ${
                page < totalPages
                  ? 'border-brand bg-brand-light text-brand hover:bg-brand-light/80'
                  : 'border-gray-200 text-gray-400'
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Activity data is illustrative until an audit log API is connected.
      </p>
    </div>
  )
}
