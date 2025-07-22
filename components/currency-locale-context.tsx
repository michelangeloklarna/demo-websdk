"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface CurrencyLocaleContextType {
  currency: string
  setCurrency: (currency: string) => void
  locale: string
  setLocale: (locale: string) => void
}

const CurrencyLocaleContext = createContext<CurrencyLocaleContextType | undefined>(undefined)

export function useCurrencyLocale() {
  const ctx = useContext(CurrencyLocaleContext)
  if (!ctx) {
    throw new Error("useCurrencyLocale must be used within a CurrencyLocaleProvider")
  }
  return ctx
}

export function CurrencyLocaleProvider({
  children,
  defaultCurrency = "USD",
  defaultLocale = "en-US",
}: {
  children: ReactNode
  defaultCurrency?: string
  defaultLocale?: string
}) {
  const [currency, setCurrency] = useState(defaultCurrency)
  const [locale, setLocale] = useState(defaultLocale)

  // Optionally, persist to localStorage here if desired

  const setCurrencySafe = useCallback((c: string) => setCurrency(c), [])
  const setLocaleSafe = useCallback((l: string) => setLocale(l), [])

  return (
    <CurrencyLocaleContext.Provider
      value={{ currency, setCurrency: setCurrencySafe, locale, setLocale: setLocaleSafe }}
    >
      {children}
    </CurrencyLocaleContext.Provider>
  )
}
