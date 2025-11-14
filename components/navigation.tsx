'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Toplix</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/buy">
              <Button
                variant={pathname === '/buy' ? 'default' : 'ghost'}
                className="hidden sm:flex"
              >
                Buy
              </Button>
            </Link>
            <Link href="/rent">
              <Button
                variant={pathname === '/rent' ? 'default' : 'ghost'}
                className="hidden sm:flex"
              >
                Rent
              </Button>
            </Link>

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


