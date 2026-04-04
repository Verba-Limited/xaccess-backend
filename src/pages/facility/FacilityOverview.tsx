import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Building2,
  IdCard,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import { getAllFacilityRows, getFacilityStats, type FacilityRow } from './mockData'

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'violet' | 'emerald' | 'rose'
}) {
  const ring =
    accent === 'violet'
      ? 'bg-violet-100 text-violet-600'
      : accent === 'emerald'
        ? 'bg-emerald-100 text-emerald-600'
        : 'bg-rose-100 text-rose-600'
  return (
    <div className="relative overflow-hidden rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl ${ring}`}>
        <Box className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-gray-900">
        {String(value).padStart(2, '0')}
      </p>
    </div>
  )
}

export function FacilityOverview() {
  const [rows, setRows] = useState<FacilityRow[]>(() => getAllFacilityRows())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(7)

  const stats = useMemo(() => getFacilityStats(rows), [rows])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.idNo.includes(s) ||
        r.facilityName.toLowerCase().includes(s) ||
        r.location.toLowerCase().includes(s) ||
        r.adminInCharge.toLowerCase().includes(s),
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

  function confirmRemoveFacility() {
    if (!deleteTarget) return
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmRemoveFacility}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View and Manage Registered Users</h1>
          <p className="text-sm text-gray-500">Facilities, locations, and assigned admins</p>
        </div>
        <Link
          to="/facilities/create"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Create Facility
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Facilities" value={stats.total} accent="violet" />
        <StatCard label="Active Facilities" value={stats.active} accent="emerald" />
        <StatCard label="Inactive Facilities" value={stats.inactive} accent="rose" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search admins..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none ring-brand focus:ring-2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  ID No.
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Facility Name
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Location
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Status
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Admin in Charge
                </span>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No facilities found.
                </td>
              </tr>
            ) : (
              pageSlice.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.idNo}</td>
                  <td className="px-4 py-3 text-gray-900">{r.facilityName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.adminInCharge}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/facilities/${r.id}`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        to={`/facilities/${r.id}/edit`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r.id)}
                        className="text-brand hover:text-brand-dark"
                        aria-label="Delete facility"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
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

      <p className="text-xs text-gray-400">
        Facility data is demo content until backend endpoints are wired.
      </p>
    </div>
  )
}
