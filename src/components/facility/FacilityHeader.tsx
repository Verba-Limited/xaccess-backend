import { useAuth } from '@/context/AuthContext'

export function FacilityHeader() {
  const { user } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-surface-border bg-white px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-amber-100 text-sm font-semibold text-brand">
            {user?.fullName
              ?.split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() ?? '?'}
          </div>
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
            title="Online"
          />
        </div>
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-gray-900">{user?.fullName ?? '—'}</p>
          <p className="text-xs text-gray-500">{user?.email ?? ''}</p>
        </div>
      </div>
    </header>
  )
}
