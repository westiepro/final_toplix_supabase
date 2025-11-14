'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarWidth, setSidebarWidth] = useState(64) // Start collapsed (w-16 = 64px)

  useEffect(() => {
    // Check initial state from localStorage
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    const isCollapsed = saved !== 'false' // Default to collapsed if not set
    setSidebarWidth(isCollapsed ? 64 : 256)

    // Listen for sidebar toggle events (from hover)
    const handleToggle = (event: CustomEvent) => {
      setSidebarWidth(event.detail.collapsed ? 64 : 256)
    }

    window.addEventListener('sidebar-toggle', handleToggle as EventListener)
    return () => {
      window.removeEventListener('sidebar-toggle', handleToggle as EventListener)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out" style={{ marginLeft: `${sidebarWidth}px`, paddingTop: '64px' }}>
        {children}
      </main>
    </div>
  )
}

