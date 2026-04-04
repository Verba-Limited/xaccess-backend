import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { DemoLoginHint } from '@/components/DemoLoginHint'
import { DEMO_FACILITY_ADMIN, showDemoLoginHint } from '@/constants/demoCredentials'
import { fetchMe, login } from '@/api/auth'
import { clearToken } from '@/api/client'
import { fetchPublicCommunities } from '@/api/public'
import { useAuth } from '@/context/AuthContext'
import type { Community } from '@/api/types'

export function FacilityLogin() {
  const navigate = useNavigate()
  const { refreshUser, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [communities, setCommunities] = useState<Pick<Community, 'id' | 'name'>[]>([])
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchPublicCommunities()
      .then((rows) => {
        setCommunities(rows)
        if (rows.length === 1) setCommunityId(rows[0].id)
      })
      .catch(() => setError('Could not load facilities'))
  }, [])

  useEffect(() => {
    if (loading || !user) return
    if (user.role === 'COMMUNITY_ADMIN') {
      void navigate('/facility/dashboard', { replace: true })
    } else if (user.role === 'SUPER_ADMIN') {
      void navigate('/dashboard', { replace: true })
    }
  }, [loading, user, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!communityId) {
      setError('Select a facility')
      return
    }
    setBusy(true)
    try {
      await login(email.trim(), password)
      await refreshUser()
      const u = await fetchMe()
      if (u.role !== 'COMMUNITY_ADMIN') {
        setError('Use the super admin login for platform access.')
        clearToken()
        await refreshUser()
        return
      }
      if (u.communityId !== communityId) {
        setError('This account is not assigned to the selected facility.')
        clearToken()
        await refreshUser()
        return
      }
      if (remember) {
        try {
          localStorage.setItem('xaccess_facility_remember', '1')
        } catch {
          /* ignore */
        }
      }
      void navigate('/facility/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center bg-brand px-8 py-12">
        <img src="/logo.png" alt="Xaccess" className="h-16 w-auto max-w-[280px] object-contain" />
        <p className="mt-6 max-w-xs text-center text-sm text-white/90">
          Facility administration for residential communities
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-surface-border bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back! Log In</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access your Facility Admin account
          </p>

          {showDemoLoginHint && (
            <div className="mt-4">
              <DemoLoginHint
                title="Demo — facility admin (seeded API)"
                lines={[
                  { label: 'Email', value: DEMO_FACILITY_ADMIN.email },
                  { label: 'Password', value: DEMO_FACILITY_ADMIN.password },
                  {
                    label: 'Facility',
                    value: `${DEMO_FACILITY_ADMIN.facilityName} (choose in dropdown)`,
                  },
                ]}
                footnote="Requires the API running with seed data (see api database seed)."
              />
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-brand focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Select Facility</label>
              <select
                required
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand focus:ring-2"
              >
                <option value="">Choose facility…</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none ring-brand focus:ring-2"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                Remember me for 30 days
              </label>
              <span className="text-brand">Forgot Password?</span>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Log into Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Platform admin?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Super admin login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
