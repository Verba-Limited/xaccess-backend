import { Outlet, useLocation } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FacilityMessagesLayout() {
  const location = useLocation()
  const isCompose = location.pathname.endsWith('/messages/compose')

  if (isCompose) {
    return <Outlet />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Messaging</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            View messages received by estate management and messages you have sent to residents.
          </p>
        </div>
        <Link
          to="/facility/messages/compose"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        >
          <PenLine className="h-4 w-4" strokeWidth={2} />
          Compose message
        </Link>
      </div>
      <Outlet />
    </div>
  )
}
