import { Link } from 'react-router-dom'
import { KeyRound, User } from 'lucide-react'

export function FacilitySettings() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Account and security for your facility console</p>
      </div>

      <div className="divide-y divide-surface-border rounded-xl border border-surface-border bg-white shadow-card">
        <Link
          to="/facility/settings/password"
          className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-gray-50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Change password</p>
            <p className="text-sm text-gray-500">Update your facility admin credentials</p>
          </div>
          <span className="text-sm text-gray-400">→</span>
        </Link>

        <div className="flex items-center gap-4 px-6 py-5 opacity-60">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Profile</p>
            <p className="text-sm text-gray-500">Name and contact — coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
