"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface SecretUXContextType {
  isUXSettingsVisible: boolean
  clickCount: number
  handleDebugAction: () => void
  resetClicks: () => void
}

const SecretUXContext = createContext<SecretUXContextType | undefined>(undefined)

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

export function SecretUXProvider({ children }: { children: React.ReactNode }) {
  const [clickCount, setClickCount] = useState(0)
  const [isUXSettingsVisible, setIsUXSettingsVisible] = useState(false)

  const handleDebugAction = useCallback(() => {
    if (!isDevelopmentMode()) {
      return
    }

    setClickCount(prev => {
      const newCount = prev + 1
      // Obfuscated activation sequence
      const threshold = 2 + 1 // 3 clicks, but less obvious
      if (newCount >= threshold) {
        setIsUXSettingsVisible(true)
      }
      return newCount
    })
  }, [])

  const resetClicks = useCallback(() => {
    setClickCount(0)
    setIsUXSettingsVisible(false)
  }, [])

  // In production, always return disabled state unless explicitly enabled
  const contextValue = isDevelopmentMode()
    ? {
        isUXSettingsVisible,
        clickCount,
        handleDebugAction,
        resetClicks,
      }
    : {
        isUXSettingsVisible: false,
        clickCount: 0,
        handleDebugAction: () => {},
        resetClicks: () => {},
      }

  return <SecretUXContext.Provider value={contextValue}>{children}</SecretUXContext.Provider>
}

export function useSecretUX() {
  const context = useContext(SecretUXContext)
  if (context === undefined) {
    throw new Error("useSecretUX must be used within a SecretUXProvider")
  }
  return context
}
