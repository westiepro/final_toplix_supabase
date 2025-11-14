'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  userEmail?: string
  actionButton?: React.ReactNode
}

export function AdminHeader({ title, userEmail = 'admin@toplix.com', actionButton }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        {actionButton}
        <span className="text-sm text-muted-foreground">{userEmail}</span>
        <Button variant="ghost" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}

