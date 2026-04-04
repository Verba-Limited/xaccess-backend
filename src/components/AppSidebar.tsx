import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Warehouse,
} from 'lucide-react'
import { BrandLogo } from './BrandLogo'
import { ConfirmLogoutModal } from '@/components/modals/ConfirmLogoutModal'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin-management', label: 'Admin Management', icon: Users },
  { to: '/communities', label: 'Communities', icon: Building2 },
  { to: '/subscription', label: 'Subscription Management', icon: BarChart3 },
  { to: '/facilities', label: 'Facility Overview', icon: Warehouse },
  { to: '/activity', label: 'Recent Activities', icon: Activity },
]

export function AppSidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
          navigate('/login', { replace: true })
        }}
      />
    <aside className="flex w-64 flex-col border-r border-surface-border bg-white">
      <div className="border-b border-surface-border px-4 py-5">
        <BrandLogo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 py-4">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              linkClass({
                isActive:
                  isActive ||
                  (to === '/subscription' &&
                    location.pathname.startsWith('/subscription')) ||
                  (to === '/facilities' && location.pathname.startsWith('/facilities')) ||
                  (to === '/communities' && location.pathname.startsWith('/communities')),
              })
            }
            end={to === '/dashboard'}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-surface-border py-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 ${
              isActive ? 'text-brand' : ''
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
