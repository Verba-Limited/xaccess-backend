import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Reply } from 'lucide-react'
import { fetchCommunityMessage, type MessageRow } from '@/api/messages'
import { useAuth } from '@/context/AuthContext'

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

export function FacilityMessageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [row, setRow] = useState<MessageRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    setErr(null)
    fetchCommunityMessage(id)
      .then((r) => {
        setRow(r)
      })
      .catch((e: Error) => {
        setErr(e.message || 'Could not load message')
        setRow(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const reply = () => {
    if (!row || !user) return
    const subject = row.subject.startsWith('Re:') ? row.subject : `Re: ${row.subject}`
    let recipientId: string | null | undefined
    if (row.senderId !== user.id) {
      recipientId = row.senderId
    } else if (row.recipientId) {
      recipientId = row.recipientId
    } else {
      recipientId = null
    }
    void navigate('/facility/messages/compose', {
      state: { subject, recipientId },
    })
  }

  if (!id) return null

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#6B7280]">
        Loading…
      </div>
    )
  }

  if (err || !row) {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {err ?? 'Message not found.'}
      </div>
    )
  }

  const { date, time } = formatParts(row.createdAt)
  const fromLine = `From: ${row.senderName ?? 'Unknown'}`
  const toLine =
    row.recipientId === null
      ? 'To: Estate Management'
      : `To: ${row.recipientName ?? 'Resident'}`

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8E8ED] pb-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-[#6B7280]">{fromLine}</p>
          <p className="text-xs text-[#6B7280]">{toLine}</p>
          <h2 className="mt-2 text-lg font-bold text-[#111827]">{row.subject}</h2>
        </div>
        <div className="shrink-0 text-right text-xs tabular-nums text-[#6B7280]">
          <p>{date}</p>
          <p className="mt-0.5">{time}</p>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{row.body}</p>
      </div>

      <div className="mt-6 border-t border-[#E8E8ED] pt-4">
        <button
          type="button"
          onClick={reply}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark sm:w-auto sm:min-w-[200px] sm:px-8"
        >
          <Reply className="h-4 w-4" strokeWidth={2} />
          Reply
        </button>
      </div>
    </div>
  )
}
