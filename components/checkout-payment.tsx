"use client"

import React from "react"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_CART_ITEMS, PAYMENT_METHODS } from "@/lib/constants"
import { COUNTRIES, getCurrencyForLocale, getCountryCodeForLocale } from "@/lib/country-data"
import { calculateOrderSummary, formatCurrency } from "@/lib/utils"
import type { PaymentData } from "@/types"
import { useKlarna } from "@/hooks/use-klarna"
import { useKlarnaLogger } from "@/hooks/use-klarna-logger"
import { KlarnaDebugAlert } from "@/components/klarna-debug-alert"
import {
  CurrencyLocaleSelector,
  CurrencyLocaleDisplay,
} from "@/components/currency-locale-selector"


// Generic Klarna Component Wrapper - handles mounting any Klarna presentation component
const KlarnaComponent = ({
  paymentPresentation,
  componentPath,
  containerId,
  componentName,
  className = "min-h-[20px]",
  onLog,
}: {
  paymentPresentation: any
  componentPath: string // e.g., "icon.component", "header.component", "subheader.enriched.component"
  containerId: string
  componentName: string
  className?: string
  onLog?: (
    type: "info" | "success" | "warning" | "error",
    title: string,
    message: string,
    data?: any
  ) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const componentRef = useRef<any>(null)
  const mountAttempted = useRef(false)

  // Helper to get nested component from path
  const getComponent = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  const logInfo = useCallback(
    (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      data?: any
    ) => {
      onLog?.(type, title, message, data);
    },
    [onLog]
  );

  // Removed visibility observer - all components now mount when SDK is ready

  useEffect(() => {
    mountAttempted.current = false;

    if (!paymentPresentation) {
      logInfo("info", `${componentName} Mount Skipped`, "Payment presentation not available");
      return;
    }

    if (!containerRef.current) {
      logInfo("info", `${componentName} Mount Skipped`, "Container ref not available");
      return;
    }

    if (mountAttempted.current) {
      logInfo("info", `${componentName} Mount Skipped`, "Mount already attempted");
      return;
    }

    const component = getComponent(paymentPresentation, componentPath);
    if (!component) {
      logInfo("warning", `${componentName} Mount`, "Component not available in presentation");
      return;
    }

    if (componentRef.current) {
      try {
        componentRef.current.unmount();
        componentRef.current = null;
      } catch (error) {
        logInfo("error", `${componentName} Unmount Error`, "Failed to unmount component", error);
      }
    }

    logInfo("info", `${componentName} Mount`, "Attempting to mount component");

    try {
      mountAttempted.current = true;
      containerRef.current.innerHTML = "";
      const componentInstance = component();
      logInfo("info", `${componentName} Created`, "Component instance created");

      if (componentInstance.mount) {
        componentInstance.mount(`#${containerId}`);
        logInfo("success", `${componentName} Mounted`, "Mounted via mount method");
      } else if (componentInstance.htmlElement) {
        containerRef.current.appendChild(componentInstance.htmlElement);
        logInfo("success", `${componentName} Mounted`, "Mounted via htmlElement");

        const originalUnmount = componentInstance.unmount;
        componentInstance.unmount = () => {
          try {
            if (componentInstance.htmlElement?.parentNode) {
              componentInstance.htmlElement.parentNode.removeChild(componentInstance.htmlElement);
            }
            originalUnmount?.call(componentInstance);
          } catch (error) {
            logInfo("error", `${componentName} Custom Unmount Error`, "Failed to unmount component", error);
          }
        };
      } else {
        throw new Error("Component has neither mount method nor htmlElement property");
      }

      componentRef.current = componentInstance;
    } catch (error) {
      mountAttempted.current = false;
      logInfo("error", `${componentName} Error`, "Failed to mount component", error);
    }

    return () => {
      if (componentRef.current) {
        try {
          componentRef.current.unmount();
          componentRef.current = null;
        } catch (error) {
          logInfo("error", `${componentName} Cleanup Error`, "Failed to unmount component", error);
        }
      }
    };
  }, [componentName, componentPath, containerId, paymentPresentation, logInfo]);

  return <div id={containerId} ref={containerRef} className={className} />
}

// Specific component wrappers for better type safety and consistency
const KlarnaIcon = React.memo(
  (props: {
    paymentPresentation: any
    onLog?: (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      data?: any
    ) => void
  }) => (
    <KlarnaComponent
      paymentPresentation={props.paymentPresentation}
      componentPath="icon.component"
      containerId="klarna-icon-container"
      componentName="Icon"
      className="max-w-9 max-h-9 w-auto h-auto flex items-center justify-center [&>*]:max-w-full [&>*]:max-h-full [&>*]:w-auto [&>*]:h-auto [&>*]:object-contain"
      onLog={props.onLog}
    />
  )
)

const KlarnaHeader = React.memo(
  (props: {
    paymentPresentation: any
    onLog?: (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      data?: any
    ) => void
  }) => (
    <KlarnaComponent
      paymentPresentation={props.paymentPresentation}
      componentPath="header.component"
      containerId="klarna-header-container"
      componentName="Header"
      className="flex items-center text-sm font-medium leading-tight"
      onLog={props.onLog}
    />
  )
)

const KlarnaShortSubheader = React.memo(
  (props: {
    paymentPresentation: any
    onLog?: (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      data?: any
    ) => void
  }) => (
    <KlarnaComponent
      paymentPresentation={props.paymentPresentation}
      componentPath="subheader.short.component"
      containerId="klarna-short-subheader-container"
      componentName="Short Subheader"
      className="flex items-center text-xs text-muted-foreground leading-tight mt-0.5"
      onLog={props.onLog}
    />
  )
)

const KlarnaEnrichedSubheader = React.memo(
  (props: {
    paymentPresentation: any
    onLog?: (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      data?: any
    ) => void
  }) => (
    <KlarnaComponent
      paymentPresentation={props.paymentPresentation}
      componentPath="subheader.enriched.component"
      containerId="klarna-enriched-subheader-container"
      componentName="Enriched Subheader"
      className="min-h-[40px]"
      onLog={props.onLog}
    />
  ),
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.paymentPresentation === nextProps.paymentPresentation
  }
)

// KlarnaEnrichedSubheader wrapper component now exists for consistency


// Helper function to get prefilled address data based on locale
const getPrefilledAddressData = (locale: string) => {
  // Only prefill for en-US or es-US locales
  if (locale === "en-US" || locale === "es-US") {
    return {
      firstName: "Test",
      lastName: "Person-us",
      address: "509 Amsterdam Ave",
      address2: "",
      city: "New York",
      state: "NY",
      zip: "10024-3941",
      country: "US",
      phone: "+13106683312",
      email: "customer@email.us",
    }
  }
  // Return empty data for other locales
  return {
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
    email: "",
  }
}

interface FormData {
  firstName: string
  lastName: string
  address: string
  address2: string
  city: string
  state: string
  zip: string
  country: string // Country code (e.g., "US", "CA", "GB")
  phone: string
  email: string
  cardNumber: string
  expiry: string
  cvc: string
  cardName: string
  billingFirstName: string
  billingLastName: string
  billingAddress: string
  billingAddress2: string
  billingCity: string
  billingState: string
  billingZip: string
  billingCountry: string // Country code (e.g., "US", "CA", "GB")
  billingPhone: string
  billingEmail: string
}

export default function CheckoutPayment() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PaymentData["method"]>(PAYMENT_METHODS.CARD)
  const [differentBilling, setDifferentBilling] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Currency and locale state
  const [currency, setCurrency] = useState("USD")
  const [locale, setLocale] = useState("en-US")

  const [formData, setFormData] = useState<FormData>(() => {
    const prefilledData = getPrefilledAddressData(locale)
    return {
      ...prefilledData,
      cardNumber: "",
      expiry: "",
      cvc: "",
      cardName: "",
      billingFirstName: "",
      billingLastName: "",
      billingAddress: "",
      billingAddress2: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      billingCountry: "",
      billingPhone: "",
      billingEmail: "",
    }
  })

  const orderSummary = useMemo(() => calculateOrderSummary(MOCK_CART_ITEMS), [])

  // Cart items are constant, no need to memoize
  const cartItems = MOCK_CART_ITEMS
  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return "Processing..."
    }
    if (paymentMethod === PAYMENT_METHODS.KLARNA) {
      return "Continue with Klarna"
    }
    return "Complete Order"
  }, [isSubmitting, paymentMethod])

  // Remove real-time validation for better performance - only validate on submit
  const validateFormOnSubmit = useCallback(() => {
    const requiredFields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "zip",
      "country",
      "phone",
      "email",
    ]
    return requiredFields.every(field => formData[field]?.trim() !== "")
  }, [formData])

  // Handle form field changes - simplified without debouncing for better UX
  const handleFieldChange = useCallback((field: keyof FormData | string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field as keyof FormData]: value,
    }))
  }, [])

  // Refs for Klarna payment button (still uses old pattern)
  const klarnaButtonContainerRef = useRef<HTMLDivElement>(null)
  const klarnaButtonRef = useRef<any>(null)

  // Initialize Klarna logging
  const { logs, addLog, clearLogs } = useKlarnaLogger()

  // Load Klarna WebSDK with logging - now uses selected currency and locale
  const { klarnaPresentation, isLoading: klarnaLoading } = useKlarna({
    amount: orderSummary.total,
    currency: currency,
    locale: locale,
    onLog: addLog,
  })

  // Handle currency change - optimized to reduce re-renders
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setCurrency(newCurrency)
    // Use console.log instead of addLog to avoid re-render dependencies
    console.log("Currency changed to:", newCurrency)
  }, [])

  // Handle locale change - optimized to reduce re-renders
  const handleLocaleChange = useCallback((newLocale: string) => {
    setLocale(newLocale)
    console.log("Locale changed to:", newLocale)

    // Auto-select appropriate currency for the new locale
    const newCurrency = getCurrencyForLocale(newLocale)
    setCurrency(newCurrency)
    console.log("Currency auto-selected to:", newCurrency, "for locale", newLocale)

    // Auto-select appropriate shipping address country for the new locale
    const newCountry = getCountryCodeForLocale(newLocale)
    
    // Update form data with prefilled address data (only for en-US or es-US)
    const prefilledData = getPrefilledAddressData(newLocale)
    setFormData(prev => ({
      ...prev,
      ...prefilledData,
      country: newCountry,
    }))
    console.log("Shipping address country auto-selected to:", newCountry, "for locale", newLocale)
    console.log("Form data updated with prefilled address data:", prefilledData)
  }, [])

  // Note: All Klarna component mounting is now handled by individual wrapper components:
  // KlarnaIcon, KlarnaHeader, KlarnaShortSubheader, and KlarnaEnrichedSubheader

  // Memoize the button configuration to prevent unnecessary remounts
  const buttonConfig = useMemo(
    () => ({
      // Button appearance configuration
      shape: "default" as const,
      theme: "default" as const,
      locale: locale,

      // Button identification
      id: "klarna-payment-button",

      // Payment flow configuration
      initiationMode: "DEVICE_BEST" as const,

      // Payment initiation function
      initiate: () => {
        addLog("info", "Payment Button Initiated", "Starting payment process")

        // Extract addresses from form state
        const shipping = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
        }

        const billing = {
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          address: formData.billingAddress,
          address2: formData.billingAddress2,
          city: formData.billingCity,
          state: formData.billingState,
          zip: formData.billingZip,
          country: formData.billingCountry,
          phone: formData.billingPhone,
          email: formData.billingEmail,
        }

        // Simple logic: use different billing if checkbox is checked and billing fields are filled
        const useDifferentBilling = differentBilling && billing.firstName && billing.address && billing.city && billing.zip && billing.country

        console.log("🚀 Payment Data:")
        console.log("  Checkbox checked:", differentBilling)
        console.log("  Use different billing:", useDifferentBilling)
        console.log("  Current formData state:", formData)
        console.log("  Shipping:", shipping)
        console.log("  Billing:", billing)

        // API request
        const payload = {
          currency,
          locale,
          orderSummary,
          cartItems,
          shippingAddress: shipping,
          billingAddress: billing,
          useDifferentBilling,
        }
        const requestBody = JSON.stringify(payload)

        addLog("info", "API Request", "Sending payment authorization request", {
          url: "/api/klarna-authorize",
          method: "POST",
          requestSize: new Blob([requestBody]).size,
          payload: payload,
        })

        return fetch("/api/klarna-authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              addLog("error", "API Error", data.error, data.details);
              throw new Error(data.error);
            }

            addLog("success", "API Response", "Klarna authorization successful", data);

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

            throw new Error("Unexpected payment result");
          })
          .catch((error) => {
            addLog("error", "Payment Error", "Error in payment process", error);
            throw error;
          });
      },
    }),
    [locale, addLog, currency, orderSummary, cartItems, formData, differentBilling]
  )

  // Effect to handle Klarna payment button mounting/unmounting - optimized
  useEffect(() => {
    // Only mount Klarna button when:
    // 1. Klarna is selected
    // 2. Payment presentation is available
    // 3. Container ref is available
    if (
      paymentMethod === PAYMENT_METHODS.KLARNA &&
      klarnaPresentation?.paymentButton &&
      klarnaButtonContainerRef.current
    ) {
      // Clean up previous button
      if (klarnaButtonRef.current) {
        try {
          console.log("Unmounting previous payment button")
          klarnaButtonRef.current.unmount()
        } catch (error) {
          console.error("Error unmounting previous button:", error)
        }
        klarnaButtonRef.current = null
      }

      try {
        console.log("Mounting payment button")

        // Clear container before mounting
        if (klarnaButtonContainerRef.current) {
          klarnaButtonContainerRef.current.innerHTML = ""
        }

        // Create and mount the button
        const presentationPaymentButton = klarnaPresentation.paymentButton
          .component(buttonConfig)
          .mount(klarnaButtonContainerRef.current)

        // Store reference for cleanup
        klarnaButtonRef.current = presentationPaymentButton
        console.log("Payment button mounted successfully")
      } catch (error) {
        console.error("Error mounting payment button:", error)
      }
    }

    // Cleanup function
    return () => {
      if (klarnaButtonRef.current) {
        try {
          console.log("Unmounting payment button on cleanup")
          klarnaButtonRef.current.unmount()
        } catch (error) {
          console.error("Error unmounting payment button during cleanup:", error)
        }
        klarnaButtonRef.current = null
      }
    }
  }, [paymentMethod, klarnaPresentation, buttonConfig])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Only handle non-Klarna payments here
      if (paymentMethod !== PAYMENT_METHODS.KLARNA) {
        // Validate form data
        if (!validateFormOnSubmit()) {
          throw new Error("Please fill in all required fields")
        }

        // Simulate API call for other payment methods
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Handle successful submission
        addLog("success", "Order Submitted", "Order submitted successfully")
        // Redirect to success page or show success message
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setSubmitError(errorMessage)
      addLog("error", "Order Submission Error", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // getSubmitButtonText function removed - now using useMemo submitButtonText

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
          <div className="flex flex-col gap-2">
            <CurrencyLocaleDisplay currency={currency} locale={locale} className="lg:justify-end" />
          </div>
        </div>
      </div>

      {/* Currency and Locale Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Region & Currency Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyLocaleSelector
            currency={currency}
            locale={locale}
            onCurrencyChange={handleCurrencyChange}
            onLocaleChange={handleLocaleChange}
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Payment and Shipping Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
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
                    />
                  </div>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={value => setPaymentMethod(value as PaymentData["method"])}
                  aria-label="Select payment method"
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px]">
                    <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/card.png"
                          alt="Credit or Debit Card"
                          width={36}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Credit or Debit Card</span>
                        <span className="text-sm text-muted-foreground">
                          Visa, Mastercard, American Express
                        </span>
                      </div>
                    </Label>
                  </div>
                  {/* Klarna payment option with expandable details INSIDE the same box */}
                  <div className="border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px] relative flex flex-col">
                    {/* Klarna selector row */}
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value={PAYMENT_METHODS.KLARNA} id="klarna" />
                      <Label
                        htmlFor="klarna"
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                          {klarnaLoading && <Skeleton className="w-9 h-9 rounded" />}
                          {!klarnaLoading && klarnaPresentation && (
                            <KlarnaIcon paymentPresentation={klarnaPresentation} onLog={addLog} />
                          )}
                          {!klarnaLoading && !klarnaPresentation && (
                            <div className="w-9 h-9 bg-muted/50 rounded-sm" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center text-sm font-medium leading-tight">
                            {klarnaLoading && <Skeleton className="h-4 w-20" />}
                            {!klarnaLoading && klarnaPresentation && (
                              <KlarnaHeader
                                paymentPresentation={klarnaPresentation}
                                onLog={addLog}
                              />
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground leading-tight mt-0.5">
                            {klarnaLoading && <Skeleton className="h-3 w-24" />}
                            {!klarnaLoading && klarnaPresentation && (
                              <KlarnaShortSubheader
                                paymentPresentation={klarnaPresentation}
                                onLog={addLog}
                              />
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Mount enriched subheader immediately but keep it hidden - positioned below the radio button */}
                    <div
                      className={`transition-opacity duration-200 px-4 pb-2 ${
                        paymentMethod === PAYMENT_METHODS.KLARNA
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none absolute -z-10"
                      }`}
                    >
                      {klarnaLoading && <Skeleton className="h-6 w-64" />}
                      {!klarnaLoading && klarnaPresentation && (
                        <KlarnaEnrichedSubheader
                          paymentPresentation={klarnaPresentation}
                          onLog={addLog}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px]">
                    <RadioGroupItem value={PAYMENT_METHODS.PAYPAL} id="paypal" />
                    <Label
                      htmlFor="paypal"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/paypal.png"
                          alt="PayPal"
                          width={40}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">PayPal</span>
                        <span className="text-sm text-muted-foreground">
                          Pay with your PayPal account
                        </span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px]">
                    <RadioGroupItem value={PAYMENT_METHODS.BANK} id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/bank.png"
                          alt="Bank Transfer"
                          width={36}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Bank Transfer</span>
                        <span className="text-sm text-muted-foreground">
                          Direct bank account transfer
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === PAYMENT_METHODS.CARD && (
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
                          onChange={(e) => handleFieldChange("cardNumber", e.target.value)}
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
                          onChange={(e) => handleFieldChange("expiry", e.target.value)}
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
                          onChange={(e) => handleFieldChange("cvc", e.target.value)}
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
                        onChange={(e) => handleFieldChange("cardName", e.target.value)}
                      />
                    </div>
                  </fieldset>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleFieldChange("firstName", e.target.value)}
                        placeholder="John"
                        autoComplete="given-name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleFieldChange("lastName", e.target.value)}
                        placeholder="Doe"
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      autoComplete="street-address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        placeholder="New York"
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        placeholder="NY"
                        autoComplete="address-level1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={(e) => handleFieldChange("zip", e.target.value)}
                        placeholder="10001"
                        autoComplete="postal-code"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={value => handleFieldChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        placeholder="john@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="differentBilling"
                      checked={differentBilling}
                      onCheckedChange={checked => setDifferentBilling(checked === true)}
                    />
                    <Label htmlFor="differentBilling">
                      Billing address is different from shipping address
                    </Label>
                  </div>

                  {differentBilling && (
                    <div className="mt-6 p-6 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold mb-4">Billing Address</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingFirstName">First Name</Label>
                            <Input
                              id="billingFirstName"
                              name="billingFirstName"
                              value={formData.billingFirstName}
                              onChange={(e) => handleFieldChange("billingFirstName", e.target.value)}
                              placeholder="John"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingLastName">Last Name</Label>
                            <Input
                              id="billingLastName"
                              name="billingLastName"
                              value={formData.billingLastName}
                              onChange={(e) => handleFieldChange("billingLastName", e.target.value)}
                              placeholder="Doe"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="billingAddress">Address</Label>
                          <Input
                            id="billingAddress"
                            name="billingAddress"
                            value={formData.billingAddress}
                            onChange={(e) => handleFieldChange("billingAddress", e.target.value)}
                            placeholder="456 Oak Avenue"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              name="billingCity"
                              value={formData.billingCity}
                              onChange={(e) => handleFieldChange("billingCity", e.target.value)}
                              placeholder="Boston"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingState">State</Label>
                            <Input
                              id="billingState"
                              name="billingState"
                              value={formData.billingState}
                              onChange={(e) => handleFieldChange("billingState", e.target.value)}
                              placeholder="MA"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingZip">ZIP Code</Label>
                            <Input
                              id="billingZip"
                              name="billingZip"
                              value={formData.billingZip}
                              onChange={(e) => handleFieldChange("billingZip", e.target.value)}
                              placeholder="02101"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="billingCountry">Country</Label>
                          <Select value={formData.billingCountry} onValueChange={value => handleFieldChange("billingCountry", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map(country => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingPhone">Phone</Label>
                            <Input
                              id="billingPhone"
                              name="billingPhone"
                              type="tel"
                              value={formData.billingPhone}
                              onChange={(e) => handleFieldChange("billingPhone", e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingEmail">Email</Label>
                            <Input
                              id="billingEmail"
                              name="billingEmail"
                              type="email"
                              value={formData.billingEmail}
                              onChange={(e) => handleFieldChange("billingEmail", e.target.value)}
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-4" role="list" aria-label="Cart items">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3" role="listitem">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover rounded-md border"
                        />
                        {item.quantity > 1 && (
                          <span
                            className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                            aria-label={`Quantity: ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity, currency, locale)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(orderSummary.subtotal, currency, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {formatCurrency(orderSummary.shipping, currency, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(orderSummary.tax, currency, locale)}
                    </span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(orderSummary.total, currency, locale)}</span>
                  </div>
                </div>

                {/* Conditionally render either Klarna payment button or standard button */}
                {paymentMethod === PAYMENT_METHODS.KLARNA ? (
                  <div
                    ref={klarnaButtonContainerRef}
                    className="w-full mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 overflow-hidden"
                    style={{
                      maxHeight: "44px",
                      minHeight: "44px",
                      pointerEvents: "auto",
                    }}
                  />
                ) : (
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isSubmitting}
                    aria-describedby="submit-description"
                  >
                    {submitButtonText}
                  </Button>
                )}

                {submitError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                <p
                  id="submit-description"
                  className="text-xs text-muted-foreground text-center mt-4 leading-relaxed"
                >
                  By completing your order, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Klarna Debug Console */}
      <KlarnaDebugAlert logs={logs} onClearLogs={clearLogs} className="border-primary/20" />
    </div>
  )
}
