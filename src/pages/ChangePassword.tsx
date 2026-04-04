import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { changePassword } from '@/api/auth'

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    if (newPassword !== confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setOk(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        to="/admin-management"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-xl border border-surface-border bg-white p-8 shadow-card"
      >
        {ok && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Password updated successfully.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
          <label className="text-sm font-medium text-gray-600">Current password</label>
          <input
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr] sm:items-center">
          <label className="text-sm font-medium text-gray-600">New password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm outline-none ring-brand focus:ring-2"
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
          <label className="text-sm font-medium text-gray-600">Confirm new password</label>
          <input
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
