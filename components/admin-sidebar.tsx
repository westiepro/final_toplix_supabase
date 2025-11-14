'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Home,
  Building2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string | number
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
  { title: 'All properties', icon: Home, href: '/dashboard/admin/properties' },
  { title: 'Real Estate Companies', icon: Building2, href: '/dashboard/admin/companies' },
  { title: 'Site Users', icon: Users, href: '/dashboard/admin/users' },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true) // Start collapsed by default
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    } else if (saved === 'false') {
      setIsCollapsed(false)
    }
  }, [])

  // Update collapsed state based on hover
  useEffect(() => {
    setIsCollapsed(!isHovered)
    // Dispatch custom event to update layout
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: !isHovered } }))
  }, [isHovered])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-center border-b px-4">
          {/* Empty header - Admin Menu text removed */}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center rounded-lg py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
                style={{
                  paddingLeft: '12px',
                  paddingRight: isCollapsed ? '12px' : '12px'
                }}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-blue-600 group-hover:text-primary"
                )} 
                style={{
                  position: 'relative',
                  left: 0
                }}
                />
                <span 
                  className={cn(
                    'whitespace-nowrap transition-all duration-300 ease-in-out',
                    isCollapsed 
                      ? 'w-0 opacity-0 -translate-x-2.5 overflow-hidden ml-0' 
                      : 'w-auto opacity-100 translate-x-0 ml-3'
                  )}
                  style={{
                    transitionDelay: isCollapsed ? '0ms' : '100ms'
                  }}
                >
                  {item.title}
                </span>
                {item.badge && (
                  <span 
                    className={cn(
                      'rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary whitespace-nowrap transition-all duration-300 ease-in-out',
                      isCollapsed 
                        ? 'w-0 opacity-0 -translate-x-2.5 overflow-hidden ml-0' 
                        : 'w-auto opacity-100 translate-x-0 ml-2'
                    )}
                    style={{
                      transitionDelay: isCollapsed ? '0ms' : '150ms'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

