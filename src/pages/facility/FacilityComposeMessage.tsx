import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { createCommunityMessage } from '@/api/messages'
import { fetchCommunityResidents } from '@/api/facility'
import type { PublicUser } from '@/api/types'

type ComposeState = {
  subject?: string
  recipientId?: string | null
}

export function FacilityComposeMessage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [residents, setResidents] = useState<PublicUser[]>([])
  const [to, setTo] = useState<string>('estate')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetchCommunityResidents()
      .then(setResidents)
      .catch(() => setResidents([]))
  }, [])

  useEffect(() => {
    const st = location.state as ComposeState | null
    if (st?.subject) setSubject(st.subject)
    if (st?.recipientId !== undefined) {
      setTo(st.recipientId === null || st.recipientId === '' ? 'estate' : st.recipientId)
    }
  }, [location.state])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const sub = subject.trim()
    const msg = body.trim()
    if (!sub || !msg) {
      setErr('Subject and message are required.')
      return
    }
    setSending(true)
    setErr(null)
    const recipientId = to === 'estate' ? null : to
    try {
      await createCommunityMessage({ subject: sub, body: msg, recipientId })
      void navigate('/facility/messages', { replace: true })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/facility/messages"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E8ED] bg-white text-[#111827] shadow-sm hover:bg-[#F9FAFB]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Compose message</h1>
          <p className="text-sm text-[#6B7280]">Send a message to a resident or estate management.</p>
        </div>
      </div>

      <form
        onSubmit={send}
        className="space-y-6 rounded-2xl border border-[#E8E8ED] bg-white p-6 shadow-card sm:p-8"
      >
        {err && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {err}
          </p>
        )}

        <div>
          <label htmlFor="msg-to" className="block text-sm font-medium text-[#374151]">
            To
          </label>
          <select
            id="msg-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#E8E8ED] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          >
            <option value="estate">Estate Management</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fullName}
                {r.unitLabel ? ` — ${r.unitLabel}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="msg-subject" className="block text-sm font-medium text-[#374151]">
            Subject
          </label>
          <input
            id="msg-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="mt-2 w-full rounded-xl border border-[#E8E8ED] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>

        <div>
          <label htmlFor="msg-body" className="block text-sm font-medium text-[#374151]">
            Message
          </label>
          <textarea
            id="msg-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your message"
            rows={8}
            className="mt-2 w-full resize-y rounded-xl border border-[#E8E8ED] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-10"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
