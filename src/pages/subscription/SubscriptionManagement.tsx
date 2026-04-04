import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import {
  ALERTS,
  MOCK_PLANS,
  MOCK_SUBSCRIPTIONS,
  SUBSCRIPTION_STATS,
  type SubscriptionRow,
} from './mockData'

const PIE_COLORS = ['#3B82F6', '#C4B5FD']

export function SubscriptionManagement() {
  const [rows, setRows] = useState<SubscriptionRow[]>(MOCK_SUBSCRIPTIONS)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(7)

  const pieData = [
    { name: 'Active', value: SUBSCRIPTION_STATS.active },
    { name: 'Inactive', value: SUBSCRIPTION_STATS.inactive },
  ]

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.adminName.toLowerCase().includes(s) ||
        r.facility.toLowerCase().includes(s) ||
        r.plan.toLowerCase().includes(s),
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

  function toggleRow(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    )
  }

  function confirmRemoveSubscription() {
    if (!deleteTarget) return
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmRemoveSubscription}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View and Manage Subscription</h1>
          <p className="text-sm text-gray-500">Plans, renewals, and billing overview</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/subscription/payment-overview"
            className="inline-flex items-center justify-center rounded-lg border-2 border-brand bg-white px-5 py-2.5 text-sm font-semibold text-brand shadow-sm hover:bg-brand-light"
          >
            Payment Overview
          </Link>
          <Link
            to="/subscription/plans/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Create Subscription Plan
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-gray-700">Total Subscriptions</p>
          {/* Figma: total count centered inside donut; legend below chart */}
          <div className="relative mx-auto mt-3 h-44 w-44 max-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-0.5">
              <span className="text-3xl font-bold leading-none tracking-tight text-gray-900">
                {SUBSCRIPTION_STATS.total.toLocaleString()}
              </span>
            </div>
          </div>
          <ul className="mt-4 flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
              <span>
                <span className="font-semibold text-gray-900">{SUBSCRIPTION_STATS.active}</span> Active
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet-300" />
              <span>
                <span className="font-semibold text-gray-900">{SUBSCRIPTION_STATS.inactive}</span> Inactive
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Subscription Plans</p>
            <Link
              to="/subscription/plans/create"
              className="text-sm font-semibold text-brand hover:underline"
            >
              + Add
            </Link>
          </div>
          <ul className="space-y-3">
            {MOCK_PLANS.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-500">${p.monthlyPrice}/month</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/subscription/plans/${p.id}/edit`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="text-brand hover:text-brand-dark"
                    aria-label="Delete plan"
                    onClick={() => alert('Plan delete will connect to API when available.')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-gray-700">Alerts</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between text-gray-700">
              <span>Upcoming expirations</span>
              <span className="font-semibold text-amber-600">{ALERTS.upcomingExpirations}</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Payment failures</span>
              <span className="font-semibold text-rose-600">{ALERTS.paymentFailures}</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Successful payments</span>
              <span className="font-semibold text-emerald-600">{ALERTS.successfulPayments}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search subscriptions..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none ring-brand focus:ring-2"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Admin Name</th>
              <th className="px-4 py-3">Facility</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              pageSlice.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.adminName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.facility}</td>
                  <td className="px-4 py-3 text-gray-600">{r.plan}</td>
                  <td className="px-4 py-3 text-gray-600">{r.startDate}</td>
                  <td className="px-4 py-3 text-gray-600">{r.endDate}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/subscription/subscriptions/${r.id}`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={r.active}
                        onClick={() => toggleRow(r.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                          r.active ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 translate-x-0.5 transform rounded-full bg-white shadow ring-0 transition ${
                            r.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
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

      <p className="text-xs text-gray-400">
        Subscription data is demo content until backend endpoints are wired.
      </p>
    </div>
  )
}
