import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutGrid,
  Search,
  Smartphone,
  Tag,
  Trash2,
} from 'lucide-react'
import { getInvoicePlans, type InvoicePlanRow } from '@/pages/facility/invoiceFacilityMock'

function ThWithIcon({
  icon: Icon,
  label,
}: {
  icon: typeof Tag
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

export function FacilityInvoicePlans() {
  const rows = useMemo(() => getInvoicePlans(), [])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)

  const mergedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        active: activeMap[r.id] !== undefined ? activeMap[r.id] : r.active,
      })),
    [rows, activeMap],
  )

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return mergedRows
    return mergedRows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.serviceType.toLowerCase().includes(s) ||
        r.amount.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        r.dueDate.includes(s),
    )
  }, [mergedRows, q])

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

  function toggleRow(id: string, next: boolean) {
    setActiveMap((m) => ({ ...m, [id]: next }))
  }

  return (
    <div className="space-y-6 pb-8">
      {deleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              Delete is not wired to the API in this release.
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/facility/invoices"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8ED] bg-white text-gray-800 shadow-sm hover:bg-gray-50"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Invoice Plan</h1>
            <p className="mt-1 text-sm text-gray-500">Configure service charges and billing plans.</p>
          </div>
        </div>
        <Link
          to="/facility/invoices/plans/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          + Add New
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
                <ThWithIcon icon={Tag} label="Name" />
                <ThWithIcon icon={Smartphone} label="Service Type" />
                <ThWithIcon icon={DollarSign} label="Amount" />
                <ThWithIcon icon={LayoutGrid} label="Category" />
                <ThWithIcon icon={Calendar} label="Due Date" />
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No results.
                  </td>
                </tr>
              ) : (
                pageRows.map((row: InvoicePlanRow & { active: boolean }) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.serviceType}</td>
                    <td className="px-4 py-3.5 text-gray-900">{row.amount}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.category}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.dueDate}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-4">
                        <Link
                          to={`/facility/invoices/plans/${row.id}/edit`}
                          className="text-sm font-semibold text-brand hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.active}
                          onClick={() => toggleRow(row.id, !row.active)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                            row.active ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              row.active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
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
