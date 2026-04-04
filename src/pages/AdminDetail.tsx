import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { deleteCommunityAdmin, fetchCommunityAdmin } from '@/api/admin'
import type { CommunityAdminRow } from '@/api/types'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'

const demoLog = [
  { date: '01/05/2024', activity: 'Created user account for Jane Smith' },
  { date: '01/05/2024', activity: 'Updated subscription for Facility 1' },
]

export function AdminDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<
    (CommunityAdminRow & { activityLog: { date: string; activity: string }[] }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchCommunityAdmin(id)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function confirmDeactivateAdmin() {
    if (!id) return
    try {
      await deleteCommunityAdmin(id)
      setDeleteOpen(false)
      navigate('/admin-management')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed')
    }
  }

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error || !data) {
    return <p className="text-red-600">{error ?? 'Not found'}</p>
  }

  const logs =
    data.activityLog?.length > 0 ? data.activityLog : demoLog

  const created = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString()
    : '—'

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeactivateAdmin}
        message="Are you sure you want to deactivate this admin?"
        confirmLabel="Yes, Deactivate"
      />
      <Link
        to="/admin-management"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Information</h1>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" defaultChecked className="accent-emerald-500" disabled />
            <span className="text-brand">Impersonate Admin</span>
            <span className="text-xs text-gray-400">(coming soon)</span>
          </label>
          <Link
            to={`/admin-management/${id}/edit`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-brand hover:text-brand-dark"
            aria-label="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900">Admin Details</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['Admin Name', data.fullName],
            ['Email', data.email],
            ['Phone Number', data.phone],
            ['Assigned Facilities', data.facilityManaged],
            ['Location', data.location],
            ['Status', data.isActive ? 'Active' : 'Inactive'],
            ['Registration Date', created],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-gray-500">{k}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-surface-border bg-white shadow-card">
        <h2 className="border-b border-gray-100 px-6 py-4 text-lg font-semibold text-gray-900">
          Activity Log
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Activity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-6 py-3 text-gray-600">{row.date}</td>
                <td className="px-6 py-3 text-gray-800">{row.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
