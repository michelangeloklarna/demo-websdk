"use client"

import React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PAYMENT_METHODS } from "@/lib/constants"
import { KlarnaContent, KlarnaEnrichedSubheaderManager } from "@/components/klarna-components"
import type { PaymentData } from "@/types"
import type { FormData } from "@/hooks/use-checkout-form"

interface PaymentMethodSelectionProps {
  // Payment method state
  paymentMethod: PaymentData["method"]
  onPaymentMethodChange: (method: PaymentData["method"]) => void

  // UX settings
  paymentOrder: string[]
  showOtherSubheader: boolean
  showKlarnaSubheader: boolean
  staggeredLoading: boolean
  useStaticKlarna: boolean
  paymentMethodsVisible: boolean
  hydrated: boolean

  // Klarna state
  klarnaLoading: boolean
  klarnaPresentation: any

  // Form state
  formData: FormData
  onFieldChange: (field: keyof FormData | string, value: string) => void
}

export function PaymentMethodSelection({
  paymentMethod,
  onPaymentMethodChange,
  paymentOrder,
  showOtherSubheader,
  showKlarnaSubheader,
  staggeredLoading,
  useStaticKlarna,
  paymentMethodsVisible,
  hydrated,
  klarnaLoading,
  klarnaPresentation,
  formData,
  onFieldChange,
}: PaymentMethodSelectionProps) {
  // Debug: Log when presentation changes
  React.useEffect(() => {
    if (klarnaPresentation) {
      console.log("[PaymentMethodSelection] Klarna presentation available:", {
        hasPresentation: !!klarnaPresentation,
        hasSubheader: !!klarnaPresentation?.subheader,
        hasEnriched: !!klarnaPresentation?.subheader?.enriched,
        keys: Object.keys(klarnaPresentation || {}),
      })
    }
  }, [klarnaPresentation])
  const renderPaymentMethod = (method: string, index: number) => {
    const itemStyle = staggeredLoading
      ? {
          transitionDelay: `${index * 100}ms`,
          transform: paymentMethodsVisible ? "translateY(0)" : "translateY(10px)",
          opacity: paymentMethodsVisible ? 1 : 0,
        }
      : {}

    if (method === PAYMENT_METHODS.CARD) {
      return (
        <div
          key={method}
          className={`flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 ${
            staggeredLoading ? "transition-all duration-300" : "transition-colors"
          } min-h-[64px]`}
          style={staggeredLoading ? itemStyle : {}}
        >
          <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
          <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <Image
                src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/card.png"
                alt="Credit or Debit Card"
                width={36}
                height={36}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Credit or Debit Card</span>
              {showOtherSubheader && (
                <span className="text-sm text-muted-foreground">
                  Visa, Mastercard, American Express
                </span>
              )}
            </div>
          </Label>
        </div>
      )
    }

    if (method === PAYMENT_METHODS.KLARNA) {
      return (
        <div
          key={method}
          className={`border border-border rounded-lg hover:bg-muted/50 ${
            staggeredLoading ? "transition-all duration-300" : "transition-colors"
          } min-h-[64px] relative flex flex-col`}
          style={staggeredLoading ? itemStyle : {}}
        >
          <div className="flex items-center space-x-3 p-4">
            <RadioGroupItem value={PAYMENT_METHODS.KLARNA} id="klarna" />
            <Label htmlFor="klarna" className="flex items-center gap-3 cursor-pointer flex-1">
              <KlarnaContent
                isLoading={klarnaLoading}
                staggeredLoading={staggeredLoading}
                useStaticKlarna={useStaticKlarna}
                klarnaPresentation={klarnaPresentation}
                showSubheader={showKlarnaSubheader}
              />
            </Label>
          </div>
          {/* Use the new enriched subheader manager for proper SDK lifecycle management */}
          <KlarnaEnrichedSubheaderManager
            klarnaPresentation={klarnaPresentation}
            isVisible={paymentMethod === PAYMENT_METHODS.KLARNA && showKlarnaSubheader}
            isLoading={klarnaLoading}
            staggeredLoading={staggeredLoading}
          />
        </div>
      )
    }

    if (method === PAYMENT_METHODS.PAYPAL) {
      return (
        <div
          key={method}
          className={`flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 ${
            staggeredLoading ? "transition-all duration-300" : "transition-colors"
          } min-h-[64px]`}
          style={staggeredLoading ? itemStyle : {}}
        >
          <RadioGroupItem value={PAYMENT_METHODS.PAYPAL} id="paypal" />
          <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <Image
                src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/paypal.png"
                alt="PayPal"
                width={40}
                height={36}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">PayPal</span>
              {showOtherSubheader && (
                <span className="text-sm text-muted-foreground">Pay with your PayPal account</span>
              )}
            </div>
          </Label>
        </div>
      )
    }

    if (method === PAYMENT_METHODS.BANK) {
      return (
        <div
          key={method}
          className={`flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 ${
            staggeredLoading ? "transition-all duration-300" : "transition-colors"
          } min-h-[64px]`}
          style={staggeredLoading ? itemStyle : {}}
        >
          <RadioGroupItem value={PAYMENT_METHODS.BANK} id="bank" />
          <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <Image
                src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/bank.png"
                alt="Bank Transfer"
                width={36}
                height={36}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Bank Transfer</span>
              {showOtherSubheader && (
                <span className="text-sm text-muted-foreground">Direct bank account transfer</span>
              )}
            </div>
          </Label>
        </div>
      )
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center">
            <Image
              src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/card.png"
              alt="Payment Methods"
              width={36}
              height={36}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={value => onPaymentMethodChange(value as PaymentData["method"])}
          aria-label="Select payment method"
          className="space-y-3"
        >
          {paymentOrder.map((method, index) => renderPaymentMethod(method, index))}
        </RadioGroup>

        {hydrated && paymentMethod === PAYMENT_METHODS.CARD && (
          <fieldset className="mt-6 space-y-4">
            <legend className="sr-only">Credit card information</legend>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                  required
                  aria-describedby="cardNumber-error"
                  value={formData.cardNumber}
                  onChange={e => onFieldChange("cardNumber", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  name="expiry"
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  required
                  aria-describedby="expiry-error"
                  value={formData.expiry}
                  onChange={e => onFieldChange("expiry", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  name="cvc"
                  placeholder="123"
                  autoComplete="cc-csc"
                  required
                  aria-describedby="cvc-error"
                  value={formData.cvc}
                  onChange={e => onFieldChange("cvc", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                name="cardName"
                placeholder="John Doe"
                autoComplete="cc-name"
                required
                aria-describedby="cardName-error"
                value={formData.cardName}
                onChange={e => onFieldChange("cardName", e.target.value)}
              />
            </div>
          </fieldset>
        )}
      </CardContent>
    </Card>
  )
}
