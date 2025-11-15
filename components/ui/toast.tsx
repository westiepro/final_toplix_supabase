'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg animate-in slide-in-from-bottom-5',
        type === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950',
        type === 'error' && 'border-red-500 bg-red-50 dark:bg-red-950',
        type === 'info' && 'border-blue-500 bg-blue-50 dark:bg-blue-950'
      )}
    >
      {type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
      <p
        className={cn(
          'text-sm font-medium',
          type === 'success' && 'text-green-800 dark:text-green-200',
          type === 'error' && 'text-red-800 dark:text-red-200',
          type === 'info' && 'text-blue-800 dark:text-blue-200'
        )}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className={cn(
          'ml-auto rounded-md p-1 hover:bg-black/10',
          type === 'success' && 'text-green-600',
          type === 'error' && 'text-red-600',
          type === 'info' && 'text-blue-600'
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null

  return { showToast, ToastComponent }
}

