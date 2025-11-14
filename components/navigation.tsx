'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogIn, User, Building2, Shield } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/dashboard/admin') || false
  const [sidebarWidth, setSidebarWidth] = useState(64) // Start collapsed

  useEffect(() => {
    if (!isAdminPage) return

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
  }, [isAdminPage])

  return (
    <nav 
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out",
        isAdminPage && "fixed top-0 left-0 right-0 z-50"
      )}
      style={isAdminPage ? { marginLeft: `${sidebarWidth}px}` } : {}}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              {/* Logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C62828] shadow-sm">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* House outline */}
                  <path
                    d="M12 3L3 10V20H9V14H15V20H21V10L12 3Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Door */}
                  <rect
                    x="10"
                    y="14"
                    width="4"
                    height="6"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-primary">Toplix</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Link href="/buy">
                <Button
                  variant={pathname.includes('/buy') ? 'default' : 'ghost'}
                  className="hidden sm:flex"
                >
                  Buy
                </Button>
              </Link>
              <Link href="/rent">
                <Button
                  variant={pathname.includes('/rent') ? 'default' : 'ghost'}
                  className="hidden sm:flex"
                >
                  Rent
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href="/dashboard/user">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    User Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/agent">
                  <DropdownMenuItem className="cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    Agent Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/admin">
                  <DropdownMenuItem className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}


