import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  LineChart,
  Package,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import {
  fetchCommunityAccessLogs,
  fetchCommunityContext,
  fetchCommunityIncidents,
  fetchCommunityResidents,
  type AccessLogRow,
  type CommunityContext,
  type CommunityIncidentRow,
} from '@/api/facility'
import type { PublicUser } from '@/api/types'

const CHART_BLUE = '#3B82F6'
const CHART_PURPLE = '#C4B5FD'

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string
  value: string | number
  icon: typeof Users
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}

function TotalActiveResidentGauge({
  active,
  inactive,
  total,
}: {
  active: number
  inactive: number
  total: number
}) {
  const data = useMemo(() => {
    const a = Math.max(0, active)
    const i = Math.max(0, inactive)
    if (a === 0 && i === 0) {
      return [{ name: 'Active', value: 1 }]
    }
    if (i === 0) {
      return [{ name: 'Active', value: a }]
    }
    return [
      { name: 'Active', value: a },
      { name: 'Inactive', value: i },
    ]
  }, [active, inactive])

  return (
    <div className="flex h-full min-h-[220px] flex-col rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h2 className="text-sm font-semibold text-gray-900">Total Active Resident</h2>
      <div className="relative mt-2 flex flex-1 flex-col items-center justify-end">
        <div className="relative h-[150px] w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius={58}
                outerRadius={88}
                stroke="none"
                paddingAngle={1}
              >
                {data.map((d, idx) => (
                  <Cell
                    key={d.name}
                    fill={idx === 0 ? CHART_BLUE : CHART_PURPLE}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1 pt-8 text-center">
            <p className="text-xs text-gray-500">Total Resident</p>
            <p className="text-2xl font-bold text-gray-900">{total || '—'}</p>
          </div>
        </div>
        <div className="mt-3 flex w-full justify-center gap-6 text-xs text-gray-600">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: CHART_BLUE }} />
            Active {active}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: CHART_PURPLE }} />
            Inactive: {inactive}
          </span>
        </div>
      </div>
    </div>
  )
}

function ThIcon({
  icon: Icon,
  label,
}: {
  icon: typeof Calendar
  label: string
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
      <span className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
        {label}
      </span>
    </th>
  )
}

export function FacilityDashboard() {
  const [ctx, setCtx] = useState<CommunityContext | null>(null)
  const [residents, setResidents] = useState<PublicUser[] | null>(null)
  const [logs, setLogs] = useState<AccessLogRow[]>([])
  const [incidents, setIncidents] = useState<CommunityIncidentRow[]>([])
  const [err, setErr] = useState<string | null>(null)

  const [activityPage, setActivityPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchCommunityContext().catch(() => null),
      fetchCommunityResidents().catch(() => []),
      fetchCommunityAccessLogs().catch(() => []),
      fetchCommunityIncidents().catch(() => []),
    ])
      .then(([c, r, l, inc]) => {
        if (cancelled) return
        setCtx(c)
        setResidents(r)
        setLogs(l)
        setIncidents(inc)
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totalResidents = residents?.length ?? 0
  const activeResidents = useMemo(
    () => residents?.filter((u) => u.isActive).length ?? 0,
    [residents],
  )
  const inactiveResidents = useMemo(
    () => residents?.filter((u) => !u.isActive).length ?? 0,
    [residents],
  )

  const newResidentCount = useMemo(() => {
    if (!residents?.length) return 0
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return residents.filter((r) => r.createdAt && new Date(r.createdAt).getTime() > cutoff).length
  }, [residents])

  const existingResidentCount = useMemo(() => {
    if (!totalResidents) return 0
    return Math.max(0, totalResidents - newResidentCount)
  }, [totalResidents, newResidentCount])

  const totalApartments = useMemo(() => {
    if (!residents?.length) return 0
    const units = new Set(
      residents.map((r) => r.unitLabel?.trim()).filter((u): u is string => Boolean(u)),
    )
    return units.size > 0 ? units.size : totalResidents
  }, [residents, totalResidents])

  const residentById = useMemo(() => {
    const m = new Map<string, PublicUser>()
    residents?.forEach((r) => m.set(r.id, r))
    return m
  }, [residents])

  const privilegeRows = useMemo(() => (residents ?? []).slice(0, 3), [residents])

  const activityRows = useMemo(() => {
    type Row = {
      id: string
      dateStr: string
      timeStr: string
      residentName: string
      apartment: string
      description: string
      sortTime: number
    }
    const logRows: Row[] = [...logs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((log) => {
        const res = log.userId ? residentById.get(log.userId) : undefined
        const d = new Date(log.createdAt)
        const t = d.getTime()
        return {
          id: log.id,
          dateStr: isNaN(t) ? '—' : d.toLocaleDateString(undefined, { dateStyle: 'short' }),
          timeStr: isNaN(t)
            ? '—'
            : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          residentName: res?.fullName ?? '—',
          apartment: res?.unitLabel ?? ctx?.community?.name ?? '—',
          description: humanizeAction(log.action),
          sortTime: isNaN(t) ? 0 : t,
        }
      })

    const incidentRows: Row[] = incidents.map((inc) => {
      const d = new Date(inc.createdAt)
      const t = d.getTime()
      const note = inc.notes?.trim()
      return {
        id: `incident-${inc.id}`,
        dateStr: isNaN(t) ? '—' : d.toLocaleDateString(undefined, { dateStyle: 'short' }),
        timeStr: isNaN(t)
          ? '—'
          : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        residentName: inc.residentName,
        apartment: inc.unitLabel ?? '—',
        description:
          `Emergency alert: ${inc.category}` + (note ? ` — ${note}` : ''),
        sortTime: isNaN(t) ? 0 : t,
      }
    })

    return [...logRows, ...incidentRows]
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime: _s, ...row }) => row)
  }, [logs, incidents, residentById, ctx?.community?.name])

  const totalActivityRows = activityRows.length
  const totalPages = Math.max(1, Math.ceil(totalActivityRows / rowsPerPage))
  const page = Math.min(activityPage, totalPages)
  const start = (page - 1) * rowsPerPage
  const pageRows = activityRows.slice(start, start + rowsPerPage)
  const rangeLabel = (() => {
    if (totalActivityRows === 0) return '0 of 0'
    const from = String(start + 1).padStart(2, '0')
    const to = String(Math.min(start + rowsPerPage, totalActivityRows)).padStart(2, '0')
    const tot = String(totalActivityRows).padStart(2, '0')
    return `${from} - ${to} of ${tot}`
  })()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {ctx?.community?.name ? `${ctx.community.name} · ` : ''}
          Overview and activity
        </p>
      </div>

      {err && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Some data could not be loaded: {err}
        </div>
      )}

      {/* Top summary — matches design: 4 cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Resident"
          value={totalResidents || '—'}
          icon={Users}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          title="New Resident"
          value={newResidentCount}
          icon={Package}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Existing Resident"
          value={existingResidentCount || '—'}
          icon={LineChart}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Apartment"
          value={totalApartments || '—'}
          icon={LineChart}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Middle row — semi-donut | privileges | alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TotalActiveResidentGauge
          active={activeResidents}
          inactive={inactiveResidents}
          total={totalResidents}
        />

        <div className="flex flex-col rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between border-b border-[#E8E8ED] px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Privileges</h2>
            <Link
              to="/facility/residents"
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              Manage
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8E8ED] bg-gray-50/90 text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8ED]">
                {privilegeRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No residents yet.
                    </td>
                  </tr>
                ) : (
                  privilegeRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-3">
                          <Link
                            to={`/facility/residents/${r.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
                            title="Remove privilege (coming soon)"
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
        </div>

        <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-semibold text-gray-900">Alerts</h2>
          <p className="mt-3 border-b border-red-200 pb-1 text-sm font-medium text-red-700">
            Emergency (resident app)
          </p>
          <p className="mt-2 text-xs text-gray-500">
            When residents tap <span className="font-medium">Call for help</span> on the Alarms
            screen, alerts appear here and in Recent activities below.
          </p>
          <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
            {incidents.length}
            <span className="ml-2 text-sm font-normal text-gray-500">total logged</span>
          </p>
          <ul className="mt-4 max-h-[220px] space-y-3 overflow-y-auto text-sm text-gray-700">
            {incidents.length === 0 ? (
              <li className="text-gray-500">No emergency alerts yet.</li>
            ) : (
              incidents.slice(0, 8).map((inc) => {
                const d = new Date(inc.createdAt)
                const when = isNaN(d.getTime())
                  ? '—'
                  : d.toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                return (
                  <li key={inc.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <span className="font-semibold text-red-800">{inc.category}</span>
                    <span className="block text-xs text-gray-500">{when}</span>
                    <span className="block text-gray-800">{inc.residentName}</span>
                    {inc.unitLabel && (
                      <span className="text-xs text-gray-600">{inc.unitLabel}</span>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>

      {/* Recent activities — full width + pagination */}
      <div className="overflow-hidden rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#E8E8ED] px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8E8ED] bg-gray-50/90">
                <ThIcon icon={Calendar} label="Date" />
                <ThIcon icon={Clock} label="Time" />
                <ThIcon icon={User} label="Resident Name" />
                <ThIcon icon={Building2} label="Apartment" />
                <ThIcon icon={FileText} label="Activity Description" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8ED]">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No activities yet.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.dateStr}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.timeStr}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.residentName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.apartment}</td>
                    <td className="px-4 py-3 text-gray-700">{row.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-[#E8E8ED] px-5 py-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <span>Row per page:</span>
            <select
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setActivityPage(1)
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
                disabled={page <= 1}
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setActivityPage((p) => Math.min(totalPages, p + 1))}
                className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
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

function humanizeAction(action: string): string {
  const a = action.trim()
  if (!a) return '—'
  const map: Record<string, string> = {
    SIGN_IN: 'Signed In',
    PAYMENT: 'Made Payment',
    GENERATE_TOKEN: 'Generate Access Token',
    CREATE_USER: 'Created new user account',
  }
  if (map[a]) return map[a]
  return a
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}
