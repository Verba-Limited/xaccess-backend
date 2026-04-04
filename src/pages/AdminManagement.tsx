import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { deleteCommunityAdmin, fetchCommunityAdmins } from '@/api/admin'
import type { CommunityAdminRow } from '@/api/types'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'

export function AdminManagement() {
  const [rows, setRows] = useState<CommunityAdminRow[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(7)

  const load = () => {
    setLoading(true)
    fetchCommunityAdmins()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.facilityManaged.toLowerCase().includes(s),
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

  async function confirmDeactivateAdmin() {
    if (!deleteTarget) return
    try {
      await deleteCommunityAdmin(deleteTarget)
      load()
      setDeleteTarget(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const total = filtered.length
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeactivateAdmin}
        message="Are you sure you want to deactivate this admin? They will no longer be able to sign in."
        confirmLabel="Yes, Deactivate"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View and Manage Registered Users</h1>
          <p className="text-sm text-gray-500">Community administrators</p>
        </div>
        <Link
          to="/admin-management/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Create Admin
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Admins', value: rows.length, color: 'text-violet-600' },
          {
            label: 'Active Admins',
            value: rows.filter((r) => r.isActive).length,
            color: 'text-emerald-600',
          },
          {
            label: 'Inactive Admins',
            value: rows.filter((r) => !r.isActive).length,
            color: 'text-rose-600',
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-surface-border bg-white p-4 shadow-card"
          >
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
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

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Admin Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Facility Managed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : pageSlice.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            ) : (
              pageSlice.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="px-4 py-3 text-gray-600">{r.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{r.facilityManaged}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin-management/${r.id}`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        to={`/admin-management/${r.id}/edit`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r.id)}
                        className="text-brand hover:text-brand-dark"
                        aria-label="Delete"
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
    </div>
  )
}
