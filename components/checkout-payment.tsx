"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PAYMENT_METHODS } from "@/lib/constants"
import { useCartContext } from "@/components/cart-context"
import { getCurrencyForLocale, getCountryCodeForLocale } from "@/lib/country-data"
import { calculateOrderSummary } from "@/lib/utils"
import type { PaymentData } from "@/types"
import { useKlarna } from "@/hooks/use-klarna"
import { useCurrencyLocale } from "@/components/currency-locale-context"
import { useUXSettings } from "@/hooks/use-ux-settings"
import { useCheckoutForm } from "@/hooks/use-checkout-form"
import { UXSettingsPanel } from "@/components/checkout-sections/ux-settings-panel"
import { PaymentMethodSelection } from "@/components/checkout-sections/payment-method-selection"
import { ShippingAddress } from "@/components/checkout-sections/shipping-address"
import { OrderSummarySection } from "@/components/checkout-sections/order-summary"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"


// All Klarna components and form helpers have been moved to separate files

export default function CheckoutPayment() {
  const router = useRouter()
  
  // Extract state management to custom hooks
  const uxSettings = useUXSettings()
  const { currency, setCurrency, locale, setLocale } = useCurrencyLocale()
  const checkoutForm = useCheckoutForm(locale)
  const { items: cartItems, isEmpty: isCartEmpty } = useCartContext()
  
  // Local state
  const [paymentMethod, setPaymentMethod] = useState<PaymentData["method"]>(PAYMENT_METHODS.CARD)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize payment method from UX settings
  useEffect(() => {
    if (uxSettings.hydrated) {
      setPaymentMethod(uxSettings.defaultPayment as PaymentData["method"])
    }
  }, [uxSettings.hydrated, uxSettings.defaultPayment])

  const orderSummary = useMemo(() => calculateOrderSummary(cartItems), [cartItems])

  // Load Klarna WebSDK
  const { klarnaPresentation, isLoading: klarnaLoading } = useKlarna({
    amount: orderSummary.total,
    currency: currency,
    locale: locale,
  })

  // Handlers
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setCurrency(newCurrency)
  }, [setCurrency])

  const handleLocaleChange = useCallback((newLocale: string) => {
    setLocale(newLocale)

    const newCurrency = getCurrencyForLocale(newLocale)
    setCurrency(newCurrency)

    const newCountry = getCountryCodeForLocale(newLocale)
    checkoutForm.updateFormDataForLocale(newLocale, newCountry)
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

      const payload = {
        currency,
        locale,
        orderSummary,
        cartItems,
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
  }), [locale, currency, orderSummary, cartItems, checkoutForm, router])

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

  // Show empty cart state if no items
  if (isCartEmpty) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-8">
          <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Add some products to your cart to proceed with checkout
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            href="/products"
            className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
          >
            Products
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="/checkout"
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

      {/* UX Settings Panel */}
      <UXSettingsPanel
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
              cartItems={cartItems}
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
