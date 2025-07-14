"use client"

import React, { useCallback } from "react"
import { Globe, DollarSign } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
} from "@/lib/constants"

interface CurrencyLocaleSelectorProps {
  currency: string
  locale: string
  onCurrencyChange: (currency: string) => void
  onLocaleChange: (locale: string) => void
  className?: string
}

export function CurrencyLocaleSelector({
  currency,
  locale,
  onCurrencyChange,
  onLocaleChange,
  className = "",
}: CurrencyLocaleSelectorProps) {
  // Show all locales, not filtered by currency
  const allLocales = SUPPORTED_LOCALES

  // Handle currency change - user can override, don't change locale
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    onCurrencyChange(newCurrency)
  }, [onCurrencyChange])

  // Handle locale change - let parent handle currency auto-selection
  const handleLocaleChange = useCallback((newLocale: string) => {
    onLocaleChange(newLocale)
  }, [onLocaleChange])

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {/* Locale Selector */}
      <div className="space-y-2">
        <Label htmlFor="locale-selector" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Language & Region
        </Label>
        <Select value={locale} onValueChange={handleLocaleChange}>
          <SelectTrigger id="locale-selector">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {allLocales.map(loc => (
              <SelectItem key={loc.code} value={loc.code}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{loc.code}</span>
                  <span className="text-muted-foreground">- {loc.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Currency Selector */}
      <div className="space-y-2">
        <Label htmlFor="currency-selector" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Currency
        </Label>
        <Select value={currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger id="currency-selector">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map(curr => (
              <SelectItem key={curr.code} value={curr.code}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{curr.symbol}</span>
                  <span>{curr.code}</span>
                  <span className="text-muted-foreground">- {curr.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Helper component for displaying current selection
export function CurrencyLocaleDisplay({
  currency,
  locale,
  className = "",
}: {
  currency: string
  locale: string
  className?: string
}) {
  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency)
  const localeInfo = SUPPORTED_LOCALES.find(l => l.code === locale)

  return (
    <div className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        <span>{currencyInfo?.symbol} {currencyInfo?.code}</span>
      </div>
      <div className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        <span>{localeInfo?.name}</span>
      </div>
    </div>
  )
} 
