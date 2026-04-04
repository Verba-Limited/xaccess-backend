import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchCommunityInvoices,
  type CommunityInvoiceApiRow,
} from '@/api/facility'
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import {
  getPaymentHistoryRows,
  PAYMENT_CONFIG_ROWS,
  type PaymentHistoryRow,
} from '@/pages/facility/invoiceFacilityMock'

const DEMO_PAID = 950
const DEMO_NOT_PAID = 50
const DEMO_TOTAL = DEMO_PAID + DEMO_NOT_PAID

const DEMO_DONUT_DATA = [
  { name: 'Paid', value: DEMO_PAID, fill: '#3B82F6' },
  { name: 'Not Paid', value: DEMO_NOT_PAID, fill: '#DDD6FE' },
]

function mapInvoiceToPaymentRow(inv: CommunityInvoiceApiRow): PaymentHistoryRow {
  const n = inv.amountMinor / 100
  const amount = `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  let status: PaymentHistoryRow['status'] = 'Pending'
  if (inv.status === 'PAID') status = 'Successful'
  else if (inv.status === 'OVERDUE') status = 'Failed'
  const date = inv.paidAt ? inv.paidAt.slice(0, 10) : inv.dueDate
  return {
    id: inv.id,
    residentName: inv.residentName,
    apartment: inv.unitLabel ?? '—',
    paymentDetails: `${inv.invoiceNumber} · ${inv.title}`,
    amount,
    status,
    date,
  }
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

function TopStatCard({
  value,
  label,
  iconClass,
}: {
  value: string | number
  label: string
  iconClass: string
}) {
  return (
    <div className="rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tabular-nums text-gray-900">{value}</p>
          <p className="mt-2 text-sm font-medium text-gray-800">{label}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClass}`}
        >
          <CircleDollarSign className="h-6 w-6 text-white" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: PaymentHistoryRow['status'] }) {
  const styles =
    status === 'Successful'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'Pending'
        ? 'bg-gray-100 text-gray-700'
        : 'bg-red-50 text-red-700'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  )
}

export function FacilityInvoices() {
  const [invoiceList, setInvoiceList] = useState<
    CommunityInvoiceApiRow[] | undefined
  >(undefined)
  const [useDemoHistory, setUseDemoHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void fetchCommunityInvoices()
      .then((list) => {
        if (!cancelled) setInvoiceList(list)
      })
      .catch(() => {
        if (!cancelled) {
          setUseDemoHistory(true)
          setInvoiceList([])
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    if (useDemoHistory) return getPaymentHistoryRows()
    if (invoiceList === undefined) return []
    if (invoiceList.length === 0) return []
    return invoiceList.map(mapInvoiceToPaymentRow)
  }, [invoiceList, useDemoHistory])

  const donutBlock = useMemo(() => {
    if (useDemoHistory) {
      return {
        data: DEMO_DONUT_DATA,
        totalCenter: DEMO_TOTAL,
        paidLabel: DEMO_PAID,
        unpaidLabel: DEMO_NOT_PAID,
      }
    }
    if (invoiceList === undefined) {
      return {
        data: DEMO_DONUT_DATA,
        totalCenter: DEMO_TOTAL,
        paidLabel: DEMO_PAID,
        unpaidLabel: DEMO_NOT_PAID,
      }
    }
    if (invoiceList.length === 0) {
      return {
        data: [
          { name: 'Paid', value: 0, fill: '#3B82F6' },
          { name: 'Not Paid', value: 0, fill: '#DDD6FE' },
        ],
        totalCenter: 0,
        paidLabel: 0,
        unpaidLabel: 0,
      }
    }
    const paid = invoiceList.filter((i) => i.status === 'PAID').length
    const unpaid = invoiceList.filter((i) => i.status !== 'PAID').length
    const total = paid + unpaid || 1
    return {
      data: [
        { name: 'Paid', value: paid, fill: '#3B82F6' },
        { name: 'Not Paid', value: unpaid, fill: '#DDD6FE' },
      ],
      totalCenter: total,
      paidLabel: paid,
      unpaidLabel: unpaid,
    }
  }, [invoiceList, useDemoHistory])

  const amountStats = useMemo(() => {
    if (useDemoHistory) {
      return { received: '—', expected: '—', remaining: '—' }
    }
    if (invoiceList === undefined) {
      return { received: '—', expected: '—', remaining: '—' }
    }
    if (invoiceList.length === 0) {
      const z = '₦0.00'
      return { received: z, expected: z, remaining: z }
    }
    const receivedMinor = invoiceList
      .filter((i) => i.status === 'PAID')
      .reduce((s, i) => s + i.amountMinor, 0)
    const pendingMinor = invoiceList
      .filter((i) => i.status !== 'PAID')
      .reduce((s, i) => s + i.amountMinor, 0)
    const fmt = (minor: number) =>
      `₦${(minor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return {
      received: fmt(receivedMinor),
      expected: fmt(receivedMinor + pendingMinor),
      remaining: fmt(pendingMinor),
    }
  }, [invoiceList, useDemoHistory])

  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [deletePlanOpen, setDeletePlanOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.residentName.toLowerCase().includes(s) ||
        r.apartment.toLowerCase().includes(s) ||
        r.paymentDetails.toLowerCase().includes(s) ||
        r.amount.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.date.includes(s),
    )
  }, [rows, q])

  useEffect(() => {
    if (!exportOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [exportOpen])

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

  return (
    <div className="space-y-6 pb-8">
      {deletePlanOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm leading-relaxed text-gray-700">
              Delete is not wired to the API in this release.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark"
              onClick={() => setDeletePlanOpen(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoice Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of collections, invoice configuration, and payment history.
          {useDemoHistory && (
            <span className="ml-2 text-amber-700">Showing demo payment history — API unavailable.</span>
          )}
          {!useDemoHistory && invoiceList !== undefined && invoiceList.length > 0 && (
            <span className="ml-2 text-emerald-700">Live invoices from the API.</span>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TopStatCard value={amountStats.received} label="Total Amount Received" iconClass="bg-emerald-500" />
        <TopStatCard value={amountStats.expected} label="Expected (all invoices)" iconClass="bg-brand" />
        <TopStatCard value={amountStats.remaining} label="Outstanding" iconClass="bg-violet-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex h-full min-h-[280px] flex-col rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-gray-900">Total Active Resident</h2>
            <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
              <div className="relative h-[200px] w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutBlock.data}
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
                      {donutBlock.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-gray-500">Total Resident</p>
                  <p className="text-xl font-bold tabular-nums text-gray-900">
                    {donutBlock.totalCenter.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex w-full justify-center gap-8 text-xs text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
                  Paid {donutBlock.paidLabel}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#DDD6FE]" />
                  Not Paid {donutBlock.unpaidLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between border-b border-[#E8E8ED] px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Payment Invoice</h2>
              <Link
                to="/facility/invoices/plans"
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark"
              >
                Manage
              </Link>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8E8ED] text-xs uppercase tracking-wide text-gray-500">
                    <th className="pb-2 pr-2 font-medium">Type</th>
                    <th className="pb-2 pr-2 font-medium">Amount</th>
                    <th className="pb-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYMENT_CONFIG_ROWS.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-gray-800">{row.type}</td>
                      <td className="py-3 text-gray-600">{row.amount}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-3">
                          <Link
                            to={`/facility/invoices/plans/${row.id}/edit`}
                            className="text-sm font-semibold text-brand hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletePlanOpen(true)}
                            className="text-brand hover:opacity-80"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-xl border border-[#E8E8ED] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-semibold text-gray-900">Alerts</h2>
            <p className="mt-1 text-xs text-gray-500">Recent Payments</p>
            <ul className="mt-4 space-y-3 border-t border-[#E8E8ED] pt-4">
              {invoiceList &&
                invoiceList
                  .filter((i) => i.status === 'PAID')
                  .slice(0, 5)
                  .map((i) => (
                    <li key={i.id} className="text-sm text-gray-700">
                      {i.title} — paid {i.paidAt?.slice(0, 10) ?? '—'}
                    </li>
                  ))}
              {(!invoiceList ||
                invoiceList.filter((i) => i.status === 'PAID').length === 0) && (
                <li className="text-sm text-gray-500">No recent paid invoices.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E8E8ED] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-3 border-b border-[#E8E8ED] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Received Payment History</h2>
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-brand shadow-sm hover:bg-gray-50"
              aria-expanded={exportOpen}
              aria-haspopup="menu"
              aria-label="Download export options"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              Export
              <ChevronDown
                className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>
            {exportOpen && (
              <div
                role="menu"
                className="absolute right-0 z-20 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-[#E8E8ED] bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
                  onClick={() => {
                    void import('@/pages/facility/paymentHistoryExport').then(({ exportPaymentHistoryExcel }) => {
                      exportPaymentHistoryExcel(filtered)
                      setExportOpen(false)
                    })
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                  Download Excel (.xlsx)
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
                  onClick={() => {
                    void import('@/pages/facility/paymentHistoryExport').then(({ exportPaymentHistoryPdf }) => {
                      exportPaymentHistoryPdf(filtered)
                      setExportOpen(false)
                    })
                  }}
                >
                  <FileText className="h-4 w-4 text-red-600" strokeWidth={2} />
                  Download PDF (.pdf)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-[#E8E8ED] px-4 py-3">
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
        </div>

        <div className="overflow-x-auto">
          {historyLoading && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Loading payment history…</p>
          )}
          {!historyLoading && (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8E8ED] bg-gray-50/90">
                <ThWithIcon icon={User} label="Resident Name" />
                <ThWithIcon icon={Building2} label="Apartment" />
                <ThWithIcon icon={FileText} label="Payment Details" />
                <ThWithIcon icon={CircleDollarSign} label="Amount" />
                <ThWithIcon icon={RefreshCw} label="Status" />
                <ThWithIcon icon={Calendar} label="Date" />
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
                pageRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{row.residentName}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.apartment}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.paymentDetails}</td>
                    <td className="px-4 py-3.5 text-gray-900">{row.amount}</td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
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
