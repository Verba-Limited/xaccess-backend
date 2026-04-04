import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import {
  DEMO_FACILITY_ACTIVITY,
  enrichFacilityDetail,
  getFacilityById,
  type FacilityDetail,
} from './mockData'

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function FacilityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<
    (FacilityDetail & { activityLog: { date: string; activity: string }[] }) | null
  >(null)
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    const row = getFacilityById(id)
    if (!row) {
      setError('Facility not found')
      setLoading(false)
      return
    }
    const detail = enrichFacilityDetail(row)
    setActive(detail.status === 'active')
    setData({
      ...detail,
      activityLog: DEMO_FACILITY_ACTIVITY,
    })
    setLoading(false)
  }, [id])

  function confirmDeleteFacility() {
    setDeleteOpen(false)
    void navigate('/facilities')
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading facility…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          to="/facilities"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to facilities
        </Link>
        <p className="text-red-600">{error ?? 'Not found'}</p>
      </div>
    )
  }

  const logs = data.activityLog?.length ? data.activityLog : DEMO_FACILITY_ACTIVITY

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteFacility}
        message="Are you sure you want to delete this facility? This action cannot be undone."
      />
      <Link
        to="/facilities"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Facility Information</h1>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                active ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 translate-x-0.5 transform rounded-full bg-white shadow ring-0 transition ${
                  active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-gray-600">{active ? 'Active' : 'Inactive'}</span>
          </label>
          <Link
            to={`/facilities/${id}/edit`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-brand hover:text-brand-dark"
            aria-label="Delete facility"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900">Facility Details</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Facility Name', data.facilityName],
              ['Facility ID', data.idNo],
              ['Email', data.email],
              ['Phone Number', data.phone],
              ['Facility Admin', data.facilityAdmin],
              ['Location', data.location],
              ['Status', <StatusPill key="st" active={active} />],
              ['Registration Date', data.registrationDate],
            ] as const
          ).map(([k, v]) => (
            <div key={String(k)} className="sm:col-span-1">
              <dt className="text-sm text-gray-500">{k}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900">Operational Metrics</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Power Usage', `${data.powerUsageKwh.toLocaleString()} kWh`],
              ['Water Usage', `${data.waterUsageLiters.toLocaleString()} liters`],
              ['Total Users', String(data.totalUsers)],
              ['Subscription Status', data.subscriptionStatusLine],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-gray-500">{k}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900">Admin Info</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Admin Name', data.adminName],
              ['Email', data.adminEmail],
              ['Phone Number', data.adminPhone],
              ['Last Login', data.lastLogin],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-gray-500">{k}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900">Subscription Info</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Subscription Type', data.subscriptionType],
              ['Start Date', data.subStartDate],
              ['End Date', data.subEndDate],
              ['Payment Status', data.paymentStatus],
            ] as const
          ).map(([k, v]) => (
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

      <p className="text-xs text-gray-400">
        Demo content. Connect to facility APIs when available.
      </p>
    </div>
  )
}
