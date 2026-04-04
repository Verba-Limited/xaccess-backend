import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
} from 'lucide-react'
import { fetchCommunityResidents } from '@/api/facility'
import type { PublicUser } from '@/api/types'

const NAVY_DECLINE = '#1E3A5F'

type NewResidentRow = {
  id: string
  fullName: string
  email: string
  phone: string
  apartment: string
  placeholder?: boolean
}

const PLACEHOLDER_ROWS: Omit<NewResidentRow, 'placeholder'>[] = Array.from({ length: 7 }, (_, i) => ({
  id: `placeholder-${i}`,
  fullName: 'Admin Name',
  email: 'Email@mail.com',
  phone: 'Phone Number',
  apartment: 'Location',
}))

function formatPhoneDisplay(phone: string | null | undefined) {
  if (!phone?.trim()) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function toRows(residents: PublicUser[]): NewResidentRow[] {
  if (residents.length === 0) {
    return PLACEHOLDER_ROWS.map((r) => ({ ...r, placeholder: true }))
  }
  const sorted = [...residents].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return tb - ta
  })
  return sorted.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: formatPhoneDisplay(u.phone),
    apartment: u.unitLabel?.trim() || '—',
    placeholder: false,
  }))
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

export function ResidentNew() {
  const navigate = useNavigate()
  const [raw, setRaw] = useState<PublicUser[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)

  const load = useCallback(() => {
    fetchCommunityResidents()
      .then(setRaw)
      .catch((e: Error) => setErr(e.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const tableRows = useMemo(() => toRows(raw), [raw])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return tableRows
    return tableRows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s) ||
        r.apartment.toLowerCase().includes(s),
    )
  }, [tableRows, q])

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
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">New Resident</h1>

      {err && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      )}

      <div className="relative">
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
                    No results.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{row.fullName}</td>
                    <td className="px-4 py-3.5 text-gray-700">{row.email}</td>
                    <td className="px-4 py-3.5 text-gray-700">{row.phone}</td>
                    <td className="px-4 py-3.5 text-gray-700">{row.apartment}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        {row.placeholder ? (
                          <>
                            <span className="inline-flex rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white opacity-60">
                              Accept
                            </span>
                            <span
                              className="inline-flex rounded-lg px-4 py-2 text-xs font-semibold text-white opacity-60"
                              style={{ backgroundColor: NAVY_DECLINE }}
                            >
                              Decline
                            </span>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/facility/residents/${row.id}`}
                              className="inline-flex rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark"
                            >
                              Accept
                            </Link>
                            <button
                              type="button"
                              disabled
                              className="inline-flex rounded-lg px-4 py-2 text-xs font-semibold text-white opacity-90"
                              style={{ backgroundColor: NAVY_DECLINE }}
                              title="Decline is not available until registration workflow is connected"
                            >
                              Decline
                            </button>
                          </>
                        )}
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
