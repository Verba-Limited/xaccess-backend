import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { DemoLoginHint } from '@/components/DemoLoginHint'
import { DEMO_SUPER_ADMIN, showDemoLoginHint } from '@/constants/demoCredentials'
import { fetchMe, login } from '@/api/auth'
import { useAuth } from '@/context/AuthContext'

export function Login() {
  const navigate = useNavigate()
  const { refreshUser, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (loading || !user) return
    if (user.role === 'SUPER_ADMIN') {
      void navigate('/dashboard', { replace: true })
    }
    if (user.role === 'COMMUNITY_ADMIN') {
      void navigate('/facility/dashboard', { replace: true })
    }
  }, [loading, user, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email.trim(), password)
      await refreshUser()
      const u = await fetchMe()
      if (u.role === 'COMMUNITY_ADMIN') {
        navigate('/facility/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center bg-brand px-8 py-12">
        <img
          src="/logo.png"
          alt="Xaccess"
          className="h-16 w-auto max-w-[280px] object-contain"
        />
        <p className="mt-6 max-w-xs text-center text-sm text-white/90">
          Secure access management for residential communities
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-surface-border bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back! Log In</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access your account
          </p>

          {showDemoLoginHint && (
            <div className="mt-4">
              <DemoLoginHint
                title="Demo — super admin (seeded API)"
                lines={[
                  { label: 'Email', value: DEMO_SUPER_ADMIN.email },
                  { label: 'Password', value: DEMO_SUPER_ADMIN.password },
                ]}
              />
            </div>
          )}

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-brand focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium uppercase tracking-wide text-gray-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none ring-brand focus:ring-2"
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me for 30 days
              </label>
              <button type="button" className="text-sm font-medium text-brand">
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white shadow hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Log into Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/create-account" className="font-semibold text-brand">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-gray-500">
            Facility admin?{' '}
            <Link to="/facility/login" className="font-semibold text-brand hover:underline">
              Facility login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
