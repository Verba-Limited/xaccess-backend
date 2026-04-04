import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import { fetchSubscriptionDetail } from '@/api/subscriptions'
import type { SubscriptionDetailWithLog } from '@/api/subscriptions'

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

export function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<SubscriptionDetailWithLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchSubscriptionDetail(id)
      .then((d) => {
        if (!d) setError('Subscription not found')
        else setData(d)
      })
      .catch(() => setError('Could not load subscription'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading subscription…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          to="/subscription"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subscriptions
        </Link>
        <p className="text-red-600">{error ?? 'Not found'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          alert('Delete subscription will call DELETE when API is available.')
        }}
      />
      <Link
        to="/subscription"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Details</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/subscription/subscriptions/${id}/edit`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            className="text-brand hover:text-brand-dark"
            aria-label="Delete subscription"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900">Subscription information</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Admin name', data.adminName],
              ['Email', data.adminEmail],
              ['Facility', data.facility],
              ['Plan', data.plan],
              [
                'Monthly amount',
                `${data.currency} ${data.monthlyAmount.toFixed(2)}`,
              ],
              ['Start date', data.startDate],
              ['End date', data.endDate],
              ['Status', <StatusPill key="s" active={data.active} />],
            ] as const
          ).map(([label, value]) => (
            <div key={String(label)} className="sm:col-span-1">
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-surface-border bg-white shadow-card">
        <h2 className="border-b border-gray-100 px-6 py-4 text-lg font-semibold text-gray-900">
          Activity log
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Activity</th>
            </tr>
          </thead>
          <tbody>
            {data.activityLog.map((row, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-6 py-3 text-gray-600">{row.date}</td>
                <td className="px-6 py-3 text-gray-800">{row.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-gray-400">
        Mock data is shown. Set <code className="rounded bg-gray-100 px-1">VITE_USE_SUBSCRIPTION_API=true</code>{' '}
        and implement <code className="rounded bg-gray-100 px-1">GET /api/v1/admin/subscriptions/:id</code> to use
        live data.
      </p>
    </div>
  )
}
