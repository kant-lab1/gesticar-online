import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppSidebar } from './AppSidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-5 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
