import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Filter, Search } from 'lucide-react'
import { fetchCommunityMessagesInbox, fetchCommunityMessagesSent, type MessageRow } from '@/api/messages'

type Tab = 'received' | 'sent'

function formatParts(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '—', time: '—' }
  return {
    date: d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  }
}

function rowLabel(tab: Tab, row: MessageRow): string {
  if (tab === 'received') {
    return `From: ${row.senderName ?? 'Unknown'}`
  }
  return row.recipientId ? `To: ${row.recipientName ?? 'Resident'}` : 'To: Estate Management'
}

function mapToListItem(tab: Tab, row: MessageRow) {
  const { date, time } = formatParts(row.createdAt)
  const preview =
    row.body.length > 100 ? `${row.body.slice(0, 100)}…` : row.body
  return {
    id: row.id,
    subject: row.subject,
    label: rowLabel(tab, row),
    preview,
    date,
    time,
  }
}

export function FacilityMessagesHub() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('received')
  const [inbox, setInbox] = useState<MessageRow[]>([])
  const [sent, setSent] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    Promise.all([fetchCommunityMessagesInbox(), fetchCommunityMessagesSent()])
      .then(([inRows, outRows]) => {
        setInbox(inRows)
        setSent(outRows)
      })
      .catch((e: Error) => {
        setErr(e.message || 'Could not load messages')
        setInbox([])
        setSent([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const rawList = tab === 'received' ? inbox : sent
  const items = useMemo(() => {
    const list = rawList.map((r) => ({ row: r, ...mapToListItem(tab, r) }))
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (m) =>
        m.subject.toLowerCase().includes(s) ||
        m.label.toLowerCase().includes(s) ||
        m.preview.toLowerCase().includes(s),
    )
  }, [rawList, tab, q])

  const selectedId = location.pathname.match(/\/messages\/([^/]+)$/)?.[1]
  const isDetailRoute = selectedId && selectedId !== 'compose'

  return (
    <>
      <div className="flex gap-0 rounded-t-xl border border-b-0 border-[#E8E8ED] bg-white px-1 pt-1">
        {(
          [
            ['received', 'Messages received'],
            ['sent', 'Messages sent'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key)
              if (location.pathname !== '/facility/messages') {
                void navigate('/facility/messages', { replace: true })
              }
            }}
            className={`relative flex-1 rounded-t-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
              tab === key
                ? 'bg-[#FFF4E0] text-brand-dark'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {label}
            {tab === key && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-b-xl border border-[#E8E8ED] bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
              strokeWidth={2}
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-full rounded-xl border border-[#E8E8ED] bg-[#F9FAFB] py-2.5 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8E8ED] bg-white text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
            aria-label="Filter"
          >
            <Filter className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {err && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
        )}
        {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-[#E8E8ED] rounded-xl border border-[#E8E8ED] bg-[#FAFAFA]">
              {!loading && items.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-[#6B7280]">No messages.</li>
              )}
              {items.map((m) => {
                const active = isDetailRoute && selectedId === m.id
                return (
                  <li key={m.id}>
                    <Link
                      to={`/facility/messages/${m.id}`}
                      className={`block px-4 py-4 transition-colors hover:bg-white ${
                        active ? 'bg-white ring-1 ring-inset ring-brand/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#111827]">{m.subject}</p>
                          <p className="mt-1 text-xs text-[#6B7280]">{m.label}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4B5563]">
                            {m.preview}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-xs text-[#6B7280]">
                          <p className="tabular-nums">{m.date}</p>
                          <p className="mt-0.5 tabular-nums">{m.time}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="min-h-[280px] rounded-xl border border-[#E8E8ED] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
