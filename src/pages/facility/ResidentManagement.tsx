import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { fetchCommunityResidents } from '@/api/facility'
import type { PublicUser } from '@/api/types'

const PURPLE_ACTIVE = '#7C3AED'
const LAVENDER_INACTIVE = '#DDD6FE'
const NAVY_DECLINE = '#1E3A5F'

function formatPhoneDisplay(phone: string | null | undefined) {
  if (!phone?.trim()) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function TotalActiveResidentRing({
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
    if (a === 0 && i === 0) return [{ name: 'Active', value: 1 }]
    if (i === 0) return [{ name: 'Active', value: a }]
    return [
      { name: 'Active', value: a },
      { name: 'Inactive', value: i },
    ]
  }, [active, inactive])

  return (
    <div className="flex h-full min-h-[260px] flex-col rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h2 className="text-sm font-semibold text-gray-900">Total Active Resident</h2>
      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
        <div className="relative h-[200px] w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={92}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={0}
              >
                {data.map((d, idx) => (
                  <Cell
                    key={d.name}
                    fill={idx === 0 ? PURPLE_ACTIVE : LAVENDER_INACTIVE}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-gray-500">Total Resident</p>
            <p className="text-3xl font-bold tabular-nums text-gray-900">
              {total > 0 ? total.toLocaleString() : '—'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-center gap-8 text-xs text-gray-600">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PURPLE_ACTIVE }} />
            Active {active}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: LAVENDER_INACTIVE }} />
            Inactive: {inactive}
          </span>
        </div>
      </div>
    </div>
  )
}

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

export function ResidentManagement() {
  const [rows, setRows] = useState<PublicUser[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [deleteInfoOpen, setDeleteInfoOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)

  const load = useCallback(() => {
    fetchCommunityResidents()
      .then(setRows)
      .catch((e: Error) => setErr(e.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalResidents = rows.length
  const activeResidents = useMemo(
    () => rows.filter((u) => u.isActive).length,
    [rows],
  )
  const inactiveResidents = useMemo(
    () => rows.filter((u) => !u.isActive).length,
    [rows],
  )

  const newResidentsPool = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    const withDate = rows.filter((r) => r.createdAt && new Date(r.createdAt).getTime() > cutoff)
    if (withDate.length >= 2) return withDate.slice(0, 2)
    return [...rows]
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta
      })
      .slice(0, 2)
  }, [rows])

  const privilegeRows = useMemo(() => rows.slice(0, 3), [rows])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        (r.phone ?? '').toLowerCase().includes(s) ||
        (r.unitLabel ?? '').toLowerCase().includes(s),
    )
  }, [rows, q])

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

  useEffect(() => {
    setPage(1)
  }, [q, rowsPerPage])

  return (
    <div className="space-y-8">
      {deleteInfoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              Removing a resident from the directory is not available in this release.
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

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Resident Management
        </h1>
      </div>

      {err && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      )}

      {/* Top: three equal cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TotalActiveResidentRing
          active={activeResidents}
          inactive={inactiveResidents}
          total={totalResidents}
        />

        <div className="flex flex-col rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between border-b border-[#E8E8ED] px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Privileges</h2>
            <button
              type="button"
              onClick={() =>
                document.getElementById('list-of-all-residents')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              Manage
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8E8ED] bg-gray-50/90 text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {privilegeRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No residents yet.
                    </td>
                  </tr>
                ) : (
                  privilegeRows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-3">
                          <Link
                            to={`/facility/residents/${r.id}`}
                            className="text-sm text-gray-500 hover:text-gray-800"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteInfoOpen(true)}
                            className="text-gray-900 hover:text-gray-700"
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

        <div className="flex flex-col rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between border-b border-[#E8E8ED] px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">New Residents</h2>
            <Link
              to="/facility/residents/new"
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-4 p-5">
            {newResidentsPool.length === 0 ? (
              <p className="text-sm text-gray-500">No new residents to show.</p>
            ) : (
              newResidentsPool.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <p className="font-semibold text-gray-900">{r.fullName}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {r.unitLabel?.trim() || '—'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/facility/residents/${r.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark"
                    >
                      Accept
                    </Link>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold text-white opacity-80"
                      style={{ backgroundColor: NAVY_DECLINE }}
                      title="Decline is not available until registration workflow is connected"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* List of All Residents */}
      <section id="list-of-all-residents" className="scroll-mt-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">List of All Residents</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search admins..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none ring-brand focus:ring-2"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8E8ED] bg-gray-50/90">
                  <ThWithIcon icon={User} label="Resident Name" />
                  <ThWithIcon icon={Mail} label="Email" />
                  <ThWithIcon icon={Phone} label="Phone Number" />
                  <ThWithIcon icon={MapPin} label="Apartment" />
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No residents found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3.5 font-medium text-gray-900">{u.fullName}</td>
                      <td className="px-4 py-3.5 text-gray-700">{u.email}</td>
                      <td className="px-4 py-3.5 text-gray-700">{formatPhoneDisplay(u.phone)}</td>
                      <td className="px-4 py-3.5 text-gray-700">{u.unitLabel?.trim() || '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-3">
                          <Link
                            to={`/facility/residents/${u.id}`}
                            className="text-sm font-semibold text-brand hover:underline"
                          >
                            View
                          </Link>
                          <Link
                            to={`/facility/residents/${u.id}`}
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
                className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
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
      </section>
    </div>
  )
}
