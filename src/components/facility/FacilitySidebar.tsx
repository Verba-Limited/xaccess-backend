import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  DollarSign,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { ConfirmLogoutModal } from '@/components/modals/ConfirmLogoutModal'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { to: '/facility/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/facility/residents', label: 'Resident Management', icon: Users, end: false },
  { to: '/facility/security', label: 'Security Management', icon: Shield, end: false },
  { to: '/facility/access', label: 'Access control', icon: Link2, end: false },
  { to: '/facility/messages', label: 'Messaging', icon: MessageSquare, end: false },
  { to: '/facility/invoices', label: 'Invoice Management', icon: DollarSign, end: false },
]

export function FacilitySidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-r-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'border-l-4 border-brand bg-brand-light text-brand'
        : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50'
    }`

  return (
    <>
      <ConfirmLogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false)
          logout()
          navigate('/facility/login', { replace: true })
        }}
      />
      <aside className="flex w-64 shrink-0 flex-col border-r border-surface-border bg-white">
        <div className="border-b border-surface-border px-4 py-5">
          <BrandLogo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 py-4">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} className={linkClass} end={end}>
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-surface-border py-4">
          <NavLink
            to="/facility/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                isActive ? 'text-brand' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
            Settings
          </NavLink>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
