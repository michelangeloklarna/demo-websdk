"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MOCK_CART_ITEMS, PAYMENT_METHODS } from "@/lib/constants"
import { getCurrencyForLocale, getCountryCodeForLocale } from "@/lib/country-data"
import { calculateOrderSummary } from "@/lib/utils"
import type { PaymentData } from "@/types"
import { useKlarna } from "@/hooks/use-klarna"
import { useCurrencyLocale } from "@/components/currency-locale-context"
import { useUXSettings } from "@/hooks/use-ux-settings"
import { useCheckoutForm } from "@/hooks/use-checkout-form"
import { useAdmin } from "@/components/preferences-context"
import { AdvancedSettingsPanel } from "@/components/checkout-sections/preferences-panel"
import { PaymentMethodSelection } from "@/components/checkout-sections/payment-method-selection"
import { ShippingAddress } from "@/components/checkout-sections/shipping-address"
import { OrderSummarySection } from "@/components/checkout-sections/order-summary"


// All Klarna components and form helpers have been moved to separate files

export default function CheckoutPayment() {
  const router = useRouter()
  
  // Extract state management to custom hooks
  const uxSettings = useUXSettings()
  const { currency, setCurrency, locale, setLocale } = useCurrencyLocale()
  const checkoutForm = useCheckoutForm(locale)
  const { isAdvancedModeEnabled } = useAdmin()
  
  // Local state
  const [paymentMethod, setPaymentMethod] = useState<PaymentData["method"]>(PAYMENT_METHODS.CARD)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize payment method from UX settings
  useState(() => {
    if (uxSettings.hydrated) {
      setPaymentMethod(uxSettings.defaultPayment as PaymentData["method"])
    }
  })

  const orderSummary = useMemo(() => calculateOrderSummary(MOCK_CART_ITEMS), [])

  // Load Klarna WebSDK
  const { klarnaPresentation, isLoading: klarnaLoading } = useKlarna({
    amount: orderSummary.total,
    currency: currency,
    locale: locale,
  })

  // Handlers
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setCurrency(newCurrency)
    console.log("Currency changed to:", newCurrency)
  }, [setCurrency])

  const handleLocaleChange = useCallback((newLocale: string) => {
    setLocale(newLocale)
    console.log("Locale changed to:", newLocale)

    const newCurrency = getCurrencyForLocale(newLocale)
    setCurrency(newCurrency)
    console.log("Currency auto-selected to:", newCurrency, "for locale", newLocale)

    const newCountry = getCountryCodeForLocale(newLocale)
    checkoutForm.updateFormDataForLocale(newLocale, newCountry)
    console.log("Shipping address country auto-selected to:", newCountry, "for locale", newLocale)
  }, [setLocale, setCurrency, checkoutForm])

  // Memoize the Klarna button configuration
  const buttonConfig = useMemo(() => ({
    shape: "default" as const,
    theme: "default" as const,
    locale: locale,
    id: "klarna-payment-button",
    initiationMode: "DEVICE_BEST" as const,
    initiate: () => {
      const { shipping, billing, useDifferentBilling } = checkoutForm.getAddresses()

      console.log("🚀 Payment Data:")
      console.log("  Use different billing:", useDifferentBilling)
      console.log("  Shipping:", shipping)
      console.log("  Billing:", billing)

      const payload = {
        currency,
        locale,
        orderSummary,
        cartItems: MOCK_CART_ITEMS,
        shippingAddress: shipping,
        billingAddress: billing,
        useDifferentBilling,
      }

      return fetch("/api/klarna-authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error)
          }

          if (
            data?.payment_transaction_response?.result === "STEP_UP_REQUIRED" &&
            data?.payment_request?.payment_request_id
          ) {
            return Promise.resolve({
              paymentRequestId: data.payment_request.payment_request_id,
            })
          }

          if (data?.payment_transaction_response?.result === "APPROVED") {
            router.push("/confirmation")
            return Promise.resolve({})
          }

          if (data?.payment_transaction_response?.result === "DECLINED") {
            router.push("/failure")
            return Promise.resolve({})
          }

          throw new Error("Unexpected payment result")
        })
        .catch((error) => {
          throw error
        })
    },
  }), [locale, currency, orderSummary, checkoutForm, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (paymentMethod !== PAYMENT_METHODS.KLARNA) {
        if (!checkoutForm.validateFormOnSubmit()) {
          throw new Error("Please fill in all required fields")
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNonKlarnaSubmit = () => {
    const form = document.querySelector('form')
    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(event)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="/cart"
            className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
          >
            Cart
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Checkout
          </span>
        </nav>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground mt-3 text-lg">Complete your purchase securely</p>
          </div>
        </div>
      </div>

      {/* UX Settings Panel - UX Settings tab hidden by default, shown after clicking Returns 3 times */}
      <AdvancedSettingsPanel
        currency={currency}
        locale={locale}
        onCurrencyChange={handleCurrencyChange}
        onLocaleChange={handleLocaleChange}
        hydrated={uxSettings.hydrated}
        paymentOrder={uxSettings.paymentOrder}
        defaultPayment={uxSettings.defaultPayment}
        showOtherSubheader={uxSettings.showOtherSubheader}
        showKlarnaSubheader={uxSettings.showKlarnaSubheader}
        staggeredLoading={uxSettings.staggeredLoading}
        useStaticKlarna={uxSettings.useStaticKlarna}
        onPaymentOrderChange={uxSettings.movePayment}
        onDefaultPaymentChange={(payment) => uxSettings.updateSetting('defaultPayment', payment)}
        onShowOtherSubheaderChange={(show) => uxSettings.updateSetting('showOtherSubheader', show)}
        onShowKlarnaSubheaderChange={(show) => uxSettings.updateSetting('showKlarnaSubheader', show)}
        onStaggeredLoadingChange={(enabled) => uxSettings.updateSetting('staggeredLoading', enabled)}
        onUseStaticKlarnaChange={(enabled) => uxSettings.updateSetting('useStaticKlarna', enabled)}
        showUXSettingsTab={isAdvancedModeEnabled}
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Payment and Shipping Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <PaymentMethodSelection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              paymentOrder={uxSettings.paymentOrder}
              showOtherSubheader={uxSettings.showOtherSubheader}
              showKlarnaSubheader={uxSettings.showKlarnaSubheader}
              staggeredLoading={uxSettings.staggeredLoading}
              useStaticKlarna={uxSettings.useStaticKlarna}
              paymentMethodsVisible={uxSettings.paymentMethodsVisible}
              hydrated={uxSettings.hydrated}
              klarnaLoading={klarnaLoading}
              klarnaPresentation={klarnaPresentation}
              formData={checkoutForm.formData}
              onFieldChange={checkoutForm.handleFieldChange}
            />

            {/* Shipping Address */}
            <ShippingAddress
              formData={checkoutForm.formData}
              differentBilling={checkoutForm.differentBilling}
              onFieldChange={checkoutForm.handleFieldChange}
              onDifferentBillingChange={checkoutForm.setDifferentBilling}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummarySection
              cartItems={MOCK_CART_ITEMS}
              orderSummary={orderSummary}
              currency={currency}
              locale={locale}
              paymentMethod={paymentMethod}
              isSubmitting={isSubmitting}
              submitError={submitError}
              klarnaPresentation={klarnaPresentation}
              klarnaLoading={klarnaLoading}
              buttonConfig={buttonConfig}
              onNonKlarnaSubmit={handleNonKlarnaSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
