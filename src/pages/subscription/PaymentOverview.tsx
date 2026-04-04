import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Calendar, DollarSign, User } from 'lucide-react'
import { MOCK_PAYMENTS, type PaymentRow } from './mockData'

function StatusPill({ status }: { status: PaymentRow['status'] }) {
  const styles =
    status === 'Active'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'Inactive'
        ? 'bg-gray-100 text-gray-700'
        : 'bg-rose-100 text-rose-800'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  )
}

export function PaymentOverview() {
  const [rows] = useState<PaymentRow[]>(MOCK_PAYMENTS)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(7)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.adminName.toLowerCase().includes(s) ||
        r.facility.toLowerCase().includes(s) ||
        r.planLabel.toLowerCase().includes(s),
    )
  }, [rows, q])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSlice = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  useEffect(() => {
    setPage(1)
  }, [q, perPage])

  const total = filtered.length
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return (
    <div className="space-y-6">
      <Link
        to="/subscription"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Payment Overview</h1>

      <div className="relative max-w-md">
        <input
          type="search"
          placeholder="Search payments..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-4 text-sm outline-none ring-brand focus:ring-2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Admin Name
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Facility
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Plan
                </span>
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{r.adminName}</td>
                <td className="px-4 py-3 text-gray-600">{r.facility}</td>
                <td className="px-4 py-3 text-gray-600">{r.planLabel}</td>
                <td className="px-4 py-3">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-3 text-gray-600">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 sm:mr-auto">
          <span>Row per page</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="rounded border border-gray-200 px-2 py-1 text-sm"
          >
            {[5, 7, 10, 20].map((n) => (
              <option key={n} value={n}>
                {String(n).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {start.toString().padStart(2, '0')} – {end.toString().padStart(2, '0')} of {total}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
