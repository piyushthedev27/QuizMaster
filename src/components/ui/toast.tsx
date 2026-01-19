'use client'

import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering toasts to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    // Use a more stable ID generation that works on both server and client
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      {mounted && <ToastContainer />}
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: () => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[toast.type]

  const variants = {
    initial: { opacity: 0, x: 300, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 300, scale: 0.8 }
  }

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        typeStyles[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconStyles[toast.type])} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">
            {toast.title}
          </div>
        )}
        <div className="text-sm">
          {toast.message}
        </div>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string) => {
    addToast({ type: 'success', message, title })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string, action?: Toast['action']) => {
    addToast({ type: 'error', message, title, action, duration: 0 }) // Error toasts don't auto-dismiss
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', message, title })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  return useCallback((message: string, title?: string) => {
    addToast({ type: 'info', message, title })
  }, [addToast])
}