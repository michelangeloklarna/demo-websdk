"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronUp, ChevronDown } from "lucide-react"
import { CurrencyLocaleSelector } from "@/components/currency-locale-selector"

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Credit or Debit Card",
  klarna: "Klarna",
  paypal: "PayPal",
  bank: "Bank Transfer",
}

interface UXSettingsPanelProps {
  // Currency and locale props
  currency: string
  locale: string
  onCurrencyChange: (currency: string) => void
  onLocaleChange: (locale: string) => void

  // UX settings props
  hydrated: boolean
  paymentOrder: string[]
  defaultPayment: string
  showOtherSubheader: boolean
  showKlarnaSubheader: boolean
  staggeredLoading: boolean
  useStaticKlarna: boolean

  // UX settings handlers
  onPaymentOrderChange: (idx: number, dir: -1 | 1) => void
  onDefaultPaymentChange: (payment: string) => void
  onShowOtherSubheaderChange: (show: boolean) => void
  onShowKlarnaSubheaderChange: (show: boolean) => void
  onStaggeredLoadingChange: (enabled: boolean) => void
  onUseStaticKlarnaChange: (enabled: boolean) => void

  // Secret feature props
  showUXSettingsTab?: boolean
}

export function AdvancedSettingsPanel({
  currency,
  locale,
  onCurrencyChange,
  onLocaleChange,
  hydrated,
  paymentOrder,
  defaultPayment,
  showOtherSubheader,
  showKlarnaSubheader,
  staggeredLoading,
  useStaticKlarna,
  onPaymentOrderChange,
  onDefaultPaymentChange,
  onShowOtherSubheaderChange,
  onShowKlarnaSubheaderChange,
  onStaggeredLoadingChange,
  onUseStaticKlarnaChange,
  showUXSettingsTab = false,
}: UXSettingsPanelProps) {
  return (
    <Card className="mb-6">
      <Tabs defaultValue="region-currency" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="region-currency">Region & Currency Settings</TabsTrigger>
          {showUXSettingsTab && <TabsTrigger value="ux-settings">UX Settings</TabsTrigger>}
          <TabsTrigger value="interop-data">Interoperability Data</TabsTrigger>
        </TabsList>

        <TabsContent value="region-currency">
          <CardHeader>
            <CardTitle>Region & Currency Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyLocaleSelector
              currency={currency}
              locale={locale}
              onCurrencyChange={onCurrencyChange}
              onLocaleChange={onLocaleChange}
            />
          </CardContent>
        </TabsContent>

        {showUXSettingsTab && (
          <TabsContent value="ux-settings">
            <CardHeader>
              <CardTitle>UX Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {hydrated && (
                <div className="md:grid md:grid-cols-2 gap-6 space-y-4 md:space-y-0">
                  {/* Payment Method Order */}
                  <div>
                    <div className="font-medium mb-1 text-base">Payment Method Order</div>
                    <ul className="space-y-1">
                      {paymentOrder.map((method, idx) => (
                        <li key={method} className="flex items-center gap-1 py-1">
                          <span className="flex-1 text-sm text-foreground/90">
                            {PAYMENT_METHOD_LABELS[method]}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => onPaymentOrderChange(idx, -1)}
                              disabled={idx === 0}
                              aria-label="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => onPaymentOrderChange(idx, 1)}
                              disabled={idx === paymentOrder.length - 1}
                              aria-label="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Default Payment Method & Toggles */}
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium mb-1 text-base">Default Payment Method</div>
                      <Select value={defaultPayment} onValueChange={onDefaultPaymentChange}>
                        <SelectTrigger className="w-full text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentOrder.map(method => (
                            <SelectItem key={method} value={method} className="text-sm">
                              {PAYMENT_METHOD_LABELS[method]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex flex-row-reverse justify-between items-center">
                        <Switch
                          id="other-subheader-toggle"
                          checked={showOtherSubheader}
                          onCheckedChange={onShowOtherSubheaderChange}
                        />
                        <label
                          htmlFor="other-subheader-toggle"
                          className="text-sm font-medium cursor-pointer select-none truncate"
                          title="Display other payment methods sub-header"
                        >
                          Display other payment methods sub-header
                        </label>
                      </div>

                      <div className="flex flex-row-reverse justify-between items-center">
                        <Switch
                          id="klarna-subheader-toggle"
                          checked={showKlarnaSubheader}
                          onCheckedChange={onShowKlarnaSubheaderChange}
                        />
                        <label
                          htmlFor="klarna-subheader-toggle"
                          className="text-sm font-medium cursor-pointer select-none truncate"
                          title="Display Klarna sub-header"
                        >
                          Display Klarna sub-header
                        </label>
                      </div>

                      <div className="flex flex-row-reverse justify-between items-center">
                        <Switch
                          id="staggered-loading-toggle"
                          checked={staggeredLoading}
                          onCheckedChange={onStaggeredLoadingChange}
                        />
                        <label
                          htmlFor="staggered-loading-toggle"
                          className="text-sm font-medium cursor-pointer select-none truncate"
                          title="Enable staggered loading animation for payment methods"
                        >
                          Staggered payment methods load
                        </label>
                      </div>

                      <div className="flex flex-row-reverse justify-between items-center">
                        <Switch
                          id="static-klarna-toggle"
                          checked={useStaticKlarna}
                          onCheckedChange={onUseStaticKlarnaChange}
                        />
                        <label
                          htmlFor="static-klarna-toggle"
                          className="text-sm font-medium cursor-pointer select-none truncate"
                          title="Use static Klarna logo and text instead of SDK components"
                        >
                          Static Icon and Header
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </TabsContent>
        )}

        <TabsContent value="interop-data">
          <CardHeader>
            <CardTitle>Interoperability Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              This section will display interoperability data relevant to the checkout process.
              (Placeholder)
            </p>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
