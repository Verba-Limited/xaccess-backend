import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/** Sends authenticated users to the right home; unknown paths → role default. */
export function RoleHomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted text-gray-600">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'COMMUNITY_ADMIN') {
    return <Navigate to="/facility/dashboard" replace />
  }

  return <Navigate to="/dashboard" replace />
}
