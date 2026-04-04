import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import {
  fetchCommunities,
  fetchCommunityAdmin,
  updateCommunityAdmin,
} from '@/api/admin'
import type { Community, CommunityAdminRow } from '@/api/types'

export function EditAdmin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [communities, setCommunities] = useState<Community[]>([])
  const [row, setRow] = useState<CommunityAdminRow | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [active, setActive] = useState(true)
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([fetchCommunities(), fetchCommunityAdmin(id)])
      .then(([coms, admin]) => {
        setCommunities(coms)
        setRow(admin)
        setFullName(admin.fullName)
        setEmail(admin.email)
        setPhone(admin.phone === '—' ? '' : admin.phone)
        setCommunityId(admin.communityId ?? '')
        setActive(admin.isActive)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)
    if (password && password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await updateCommunityAdmin(id, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        communityId,
        isActive: active,
        ...(password ? { password } : {}),
      })
      navigate(`/admin-management/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  if (!row) {
    return <p className="text-red-600">Admin not found.</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to={`/admin-management/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Admin Information</h1>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-emerald-500"
            />
            Active
          </label>
          <Link
            to="/admin-management/change-password"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Change Password
          </Link>
          <button
            type="submit"
            form="edit-admin-form"
            disabled={busy}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Done'}
          </button>
        </div>
      </div>

      <form
        id="edit-admin-form"
        onSubmit={onSubmit}
        className="space-y-8 rounded-xl border border-surface-border bg-white p-8 shadow-card"
      >
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Details</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Admin Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
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
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
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
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
          <p className="text-xs text-gray-500">
            Leave password blank to keep the current password.
          </p>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
            <label className="text-sm font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm outline-none ring-brand focus:ring-2"
                placeholder="••••••••"
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
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            />
          </div>
        </section>
      </form>
    </div>
  )
}
