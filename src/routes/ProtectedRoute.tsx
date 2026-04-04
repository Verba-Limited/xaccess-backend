import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type Role = 'SUPER_ADMIN' | 'COMMUNITY_ADMIN'

type ProtectedRouteProps = {
  roles: Role[]
  /** Where to send unauthenticated users (facility vs super-admin login). */
  loginPath?: string
}

export function ProtectedRoute({
  roles,
  loginPath = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted text-gray-600">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to={loginPath} replace />
  }

  const r = user.role as Role
  if (!roles.includes(r)) {
    if (r === 'COMMUNITY_ADMIN') {
      return <Navigate to="/facility/dashboard" replace />
    }
    if (r === 'SUPER_ADMIN') {
      return <Navigate to="/dashboard" replace />
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted p-6">
        <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
        <p className="max-w-md text-center text-gray-600">
          Your account does not have access to this console.
        </p>
      </div>
    )
  }

  return <Outlet />
}
