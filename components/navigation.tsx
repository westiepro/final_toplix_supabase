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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LogIn, User, Building2, Shield, Menu } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/dashboard/admin') || false
  const [sidebarWidth, setSidebarWidth] = useState(64) // Start collapsed
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="flex items-center space-x-3">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-2 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {/* Logo */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C62828] shadow-sm transition-transform duration-300 group-hover:scale-110">
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
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
                  {/* Navigation Links */}
                  <nav className="flex-1 p-4 space-y-2">
                    <Link
                      href="/buy"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium",
                        pathname.includes('/buy')
                          ? "bg-blue-100 text-blue-700 shadow-md hover:bg-blue-200"
                          : "hover:bg-blue-50 hover:text-blue-600 text-foreground"
                      )}
                    >
                      Buy
                    </Link>
                    <Link
                      href="/rent"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium",
                        pathname.includes('/rent')
                          ? "bg-blue-100 text-blue-700 shadow-md hover:bg-blue-200"
                          : "hover:bg-blue-50 hover:text-blue-400 text-foreground"
                      )}
                    >
                      Rent
                    </Link>
                  </nav>

                  {/* Login Section */}
                  <div className="border-t p-4 space-y-2">
                    <div className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </div>
                    <Link
                      href="/dashboard/user"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-accent text-foreground"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <span className="text-base font-medium">User Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/agent"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-accent text-foreground"
                    >
                      <Building2 className="mr-3 h-5 w-5" />
                      <span className="text-base font-medium">Agent Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-accent text-foreground"
                    >
                      <Shield className="mr-3 h-5 w-5" />
                      <span className="text-base font-medium">Admin Panel</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Visible on all screens */}
            <Link href="/" className="flex items-center space-x-2 group">
              {/* Logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C62828] shadow-sm transition-transform duration-300 group-hover:scale-110">
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

            {/* Desktop Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 ml-4">
              <Link href="/buy">
                <Button
                  variant="ghost"
                  className={cn(
                    "transition-all duration-200 font-medium",
                    pathname.includes('/buy') 
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-md" 
                      : "hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  Buy
                </Button>
              </Link>
              <Link href="/rent">
                <Button
                  variant="ghost"
                  className={cn(
                    "transition-all duration-200 font-medium",
                    pathname.includes('/rent') 
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-md" 
                      : "hover:bg-blue-50 hover:text-blue-400"
                  )}
                >
                  Rent
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Login Button - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
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


