import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { getSecurityRows } from '@/pages/facility/securityMockData'

const MOCK_ROWS = getSecurityRows()

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

export function SecurityManagement() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [deleteInfoOpen, setDeleteInfoOpen] = useState(false)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return MOCK_ROWS
    return MOCK_ROWS.filter(
      (r) =>
        r.securityName.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s) ||
        r.homeAddress.toLowerCase().includes(s),
    )
  }, [q])

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
      {deleteInfoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              Removing a security account is not available in this release.
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          List of All Security
        </h1>
        <Link
          to="/facility/security/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          Add New +
        </Link>
      </div>

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
                <ThWithIcon icon={User} label="Security Name" />
                <ThWithIcon icon={Mail} label="Email" />
                <ThWithIcon icon={Phone} label="Phone Number" />
                <ThWithIcon icon={MapPin} label="Home Address" />
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No results.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3.5 text-gray-600">{row.securityName}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.phone}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.homeAddress}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-3">
                        <Link
                          to={`/facility/security/${row.id}`}
                          className="text-sm font-semibold text-brand hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          to={`/facility/security/${row.id}/edit`}
                          className="text-sm font-semibold text-brand hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteInfoOpen(true)}
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
