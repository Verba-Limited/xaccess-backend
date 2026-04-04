import { Outlet } from 'react-router-dom'
import { FacilitySidebar } from './FacilitySidebar'
import { FacilityHeader } from './FacilityHeader'

export function FacilityLayout() {
  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      <FacilitySidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <FacilityHeader />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
