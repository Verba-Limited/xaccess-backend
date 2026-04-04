import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createCommunityAdmin, fetchCommunities } from '@/api/admin'
import type { Community } from '@/api/types'

export function CreateAdmin() {
  const navigate = useNavigate()
  const [communities, setCommunities] = useState<Community[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCommunities()
      .then(setCommunities)
      .catch(() => setError('Could not load facilities'))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!communityId) {
      setError('Select a facility')
      return
    }
    setBusy(true)
    try {
      await createCommunityAdmin({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        communityId,
        phone: phone.trim() || undefined,
      })
      navigate('/admin-management')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/admin-management"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Create Admin Account</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-8 rounded-xl border border-surface-border bg-white p-8 shadow-card"
      >
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Details</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-brand focus:ring-2"
              placeholder="Full name"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              placeholder="email@example.com"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              placeholder="Optional"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Assigned Facility</label>
            <select
              required
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            >
              <option value="">Select facility…</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              placeholder="Display only (not saved to API yet)"
              disabled
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm outline-none ring-brand focus:ring-2"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type={show ? 'text' : 'password'}
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create Admin'}
        </button>
      </form>
    </div>
  )
}
