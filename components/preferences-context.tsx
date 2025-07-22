"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface AdminContextType {
  isAdvancedModeEnabled: boolean
  actionCount: number
  handleAdminAction: () => void
  resetActions: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Internal development utilities
const isDevelopmentMode = () => {
  if (typeof window === "undefined") {
    return false
  }

  // Only enable in development or when explicitly enabled
  const isDevEnv = process.env.NODE_ENV === "development"
  const isExplicitlyEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG_FEATURES === "true"

  // Additional check: disable in Vercel production
  const isVercelProduction = process.env.VERCEL_ENV === "production"

  return (isDevEnv || isExplicitlyEnabled) && !isVercelProduction
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [actionCount, setActionCount] = useState(0)
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useState(false)

  const handleAdminAction = useCallback(() => {
    if (!isDevelopmentMode()) {
      return
    }

    setActionCount(prev => {
      const newCount = prev + 1
      // Activation sequence
      const threshold = 2 + 1
      if (newCount >= threshold) {
        setIsAdvancedModeEnabled(true)
      }
      return newCount
    })
  }, [])

  const resetActions = useCallback(() => {
    setActionCount(0)
    setIsAdvancedModeEnabled(false)
  }, [])

  // In production, always return disabled state unless explicitly enabled
  const contextValue = isDevelopmentMode()
    ? {
        isAdvancedModeEnabled,
        actionCount,
        handleAdminAction,
        resetActions,
      }
    : {
        isAdvancedModeEnabled: false,
        actionCount: 0,
        handleAdminAction: () => {},
        resetActions: () => {},
      }

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
