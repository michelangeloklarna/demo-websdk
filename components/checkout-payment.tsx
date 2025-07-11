"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { MOCK_CART_ITEMS, PAYMENT_METHODS } from "@/lib/constants"
import { calculateOrderSummary, formatCurrency } from "@/lib/utils"
import type { PaymentData } from "@/types"
import { useKlarna } from "@/hooks/use-klarna"
import { useKlarnaLogger } from "@/hooks/use-klarna-logger"
import { KlarnaDebugAlert } from "@/components/klarna-debug-alert"

export default function CheckoutPayment() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentData["method"]>(PAYMENT_METHODS.CARD)
  const [differentBilling, setDifferentBilling] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mountingStatus, setMountingStatus] = useState({
    selectionMounted: false,
    detailedMounted: false,
    shortSubheaderSelectionMounted: false,
  })

  const orderSummary = useMemo(() => calculateOrderSummary(MOCK_CART_ITEMS), [])
  
  // Memoize expensive calculations
  const cartItems = useMemo(() => MOCK_CART_ITEMS, [])
  const submitButtonText = useMemo(() => {
    if (isSubmitting) return "Processing..."
    if (paymentMethod === PAYMENT_METHODS.KLARNA) return "Continue with Klarna"
    return "Complete Order"
  }, [isSubmitting, paymentMethod])

  // Refs for Klarna presentation components
  const klarnaHeaderSelectionRef = useRef<{ unmount: () => void } | null>(null)
  const klarnaIconSelectionRef = useRef<{ unmount: () => void } | null>(null)
  const klarnaSubheaderSelectionRef = useRef<{ unmount: () => void } | null>(null)
  const klarnaEnrichedSubheaderRef = useRef<{ unmount: () => void } | null>(null)

  // Initialize Klarna logging
  const { logs, addLog, clearLogs } = useKlarnaLogger()

  // Load Klarna WebSDK with logging
  const { klarnaPresentation, isLoading: klarnaLoading, error: klarnaError, retry } = useKlarna({
    amount: orderSummary.total,
    currency: "USD",
    locale: "en-US",
    onLog: addLog
  })

  // Memoize mounting functions for better performance
  const mountKlarnaComponents = useCallback(() => {
    if (!klarnaPresentation) return
    
    // Mount header in selection area (always visible)
    if (klarnaPresentation.header && klarnaPresentation.header.component) {
      try {
        const container = document.querySelector("#klarna-header-container-selection")
        if (!container) {
          addLog("warning", "Header Mount Warning (Selection)", "Container element not found: #klarna-header-container-selection")
          return
        }
        
        const headerComponent = klarnaPresentation.header.component()
        if (headerComponent && headerComponent.mount) {
          klarnaHeaderSelectionRef.current = headerComponent.mount("#klarna-header-container-selection")
          addLog("success", "Header Mounted (Selection)", "Klarna header component mounted in selection area")
          setMountingStatus(prev => ({ ...prev, selectionMounted: true }))
        }
      } catch (error) {
        addLog("error", "Header Mount Error (Selection)", "Failed to mount Klarna header component in selection area", error)
      }
    }

    // Mount short subheader in selection area (always visible)
    if (klarnaPresentation.subheader) {
      addLog("info", "Subheader Debug", "Subheader object structure", klarnaPresentation.subheader)
      
      const subheaderContainer = document.querySelector("#klarna-subheader-container-selection")
      if (!subheaderContainer) {
        addLog("warning", "Subheader Mount Warning (Selection)", "Container element not found: #klarna-subheader-container-selection")
        return
      }
      
      // Try different possible structures
      let subheaderComponent = null
      
      // Check if subheader has direct component method
      if (klarnaPresentation.subheader.component) {
        subheaderComponent = klarnaPresentation.subheader.component()
        addLog("info", "Subheader Found", "Direct component method available")
      }
      // Check if subheader.short has component method
      else if (klarnaPresentation.subheader.short && klarnaPresentation.subheader.short.component) {
        subheaderComponent = klarnaPresentation.subheader.short.component()
        addLog("info", "Subheader Found", "Short component method available")
      }
      // Check if subheader.enriched has component method
      else if (klarnaPresentation.subheader.enriched && klarnaPresentation.subheader.enriched.component) {
        subheaderComponent = klarnaPresentation.subheader.enriched.component()
        addLog("info", "Subheader Found", "Enriched component method available")
      }
      else {
        addLog("warning", "Subheader Structure", "No component method found", klarnaPresentation.subheader)
      }
      
      if (subheaderComponent && subheaderComponent.mount) {
        try {
          klarnaSubheaderSelectionRef.current = subheaderComponent.mount("#klarna-subheader-container-selection")
          addLog("success", "Subheader Mounted (Selection)", "Klarna subheader component mounted in selection area")
          setMountingStatus(prev => ({ ...prev, shortSubheaderSelectionMounted: true }))
        } catch (error) {
          addLog("error", "Subheader Mount Error (Selection)", "Failed to mount Klarna subheader component in selection area", error)
        }
      }
    }

    // Mount icon in selection area (always visible)
    if (klarnaPresentation.icon && klarnaPresentation.icon.component) {
      try {
        const container = document.querySelector("#klarna-icon-container-selection")
        if (!container) {
          addLog("warning", "Icon Mount Warning (Selection)", "Container element not found: #klarna-icon-container-selection")
          return
        }
        
        const iconComponent = klarnaPresentation.icon.component()
        if (iconComponent && iconComponent.mount) {
          klarnaIconSelectionRef.current = iconComponent.mount("#klarna-icon-container-selection")
          addLog("success", "Icon Mounted (Selection)", "Klarna icon component mounted in selection area")
        }
      } catch (error) {
        addLog("error", "Icon Mount Error (Selection)", "Failed to mount Klarna icon component in selection area", error)
      }
    }
  }, [klarnaPresentation, addLog])

  const mountKlarnaDetailedComponents = useCallback(() => {
    if (!klarnaPresentation || paymentMethod !== PAYMENT_METHODS.KLARNA) return
    
    // Only mount enriched subheader in detailed area (only when Klarna is selected)
    if (klarnaPresentation.subheader && klarnaPresentation.subheader.enriched && klarnaPresentation.subheader.enriched.component) {
      try {
        const container = document.querySelector("#klarna-enriched-subheader-container")
        if (!container) {
          addLog("warning", "Enriched Subheader Mount Warning", "Container element not found: #klarna-enriched-subheader-container")
          return
        }
        
        const enrichedSubheaderComponent = klarnaPresentation.subheader.enriched.component()
        if (enrichedSubheaderComponent && enrichedSubheaderComponent.mount) {
          klarnaEnrichedSubheaderRef.current = enrichedSubheaderComponent.mount("#klarna-enriched-subheader-container")
          addLog("success", "Enriched Subheader Mounted", "Klarna enriched subheader component mounted in detailed area")
          setMountingStatus(prev => ({ ...prev, detailedMounted: true }))
        }
      } catch (error) {
        addLog("error", "Enriched Subheader Mount Error", "Failed to mount Klarna enriched subheader component", error)
      }
    }
  }, [klarnaPresentation, paymentMethod, addLog])

  const unmountKlarnaComponents = useCallback(() => {
    // Cleanup selection area components
    if (klarnaHeaderSelectionRef.current) {
      try {
        klarnaHeaderSelectionRef.current.unmount()
        addLog("info", "Header Unmounted (Selection)", "Klarna header component unmounted from selection area")
      } catch (error) {
        addLog("error", "Header Unmount Error (Selection)", "Failed to unmount Klarna header component from selection area", error)
      }
      klarnaHeaderSelectionRef.current = null
      setMountingStatus(prev => ({ ...prev, selectionMounted: false }))
    }
    
    if (klarnaSubheaderSelectionRef.current) {
      try {
        klarnaSubheaderSelectionRef.current.unmount()
        addLog("info", "Subheader Unmounted (Selection)", "Klarna subheader component unmounted from selection area")
      } catch (error) {
        addLog("error", "Subheader Unmount Error (Selection)", "Failed to unmount Klarna subheader component from selection area", error)
      }
      klarnaSubheaderSelectionRef.current = null
      setMountingStatus(prev => ({ ...prev, shortSubheaderSelectionMounted: false }))
    }
    
    if (klarnaIconSelectionRef.current) {
      try {
        klarnaIconSelectionRef.current.unmount()
        addLog("info", "Icon Unmounted (Selection)", "Klarna icon component unmounted from selection area")
      } catch (error) {
        addLog("error", "Icon Unmount Error (Selection)", "Failed to unmount Klarna icon component from selection area", error)
      }
      klarnaIconSelectionRef.current = null
    }

    // Cleanup detailed area components - only enriched subheader
    if (klarnaEnrichedSubheaderRef.current) {
      try {
        klarnaEnrichedSubheaderRef.current.unmount()
        addLog("info", "Enriched Subheader Unmounted", "Klarna enriched subheader component unmounted from detailed area")
      } catch (error) {
        addLog("error", "Enriched Subheader Unmount Error", "Failed to unmount Klarna enriched subheader component", error)
      }
      klarnaEnrichedSubheaderRef.current = null
      setMountingStatus(prev => ({ ...prev, detailedMounted: false }))
    }
  }, [addLog])

  // Mount/unmount Klarna header and icon when presentation is available
  useEffect(() => {
    if (!klarnaPresentation) return
    
    // Use requestAnimationFrame to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        mountKlarnaComponents()
      })
    }, 100) // Small delay to ensure DOM elements are rendered
    
    return () => {
      clearTimeout(timeoutId)
      unmountKlarnaComponents()
    }
  }, [klarnaPresentation, mountKlarnaComponents, unmountKlarnaComponents])

  // Mount detailed components when Klarna is selected
  useEffect(() => {
    if (paymentMethod === PAYMENT_METHODS.KLARNA && klarnaPresentation) {
      // Use requestAnimationFrame to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          mountKlarnaDetailedComponents()
        })
      }, 100) // Small delay to ensure DOM elements are rendered
      
      return () => clearTimeout(timeoutId)
    } else {
      // Reset detailed mounting status when Klarna is not selected
      setMountingStatus(prev => ({ 
        ...prev, 
        detailedMounted: false
      }))
    }
  }, [paymentMethod, klarnaPresentation, mountKlarnaDetailedComponents])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // Handle successful submission
      console.log("Order submitted successfully")
    } catch (error) {
      console.error("Order submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // getSubmitButtonText function removed - now using useMemo submitButtonText

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
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
        <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground mt-3 text-lg">Complete your purchase securely</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Payment and Shipping Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <img 
                      src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/card.png" 
                      alt="Payment Methods" 
                      className="max-w-9 max-h-9 w-auto h-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentData["method"])}
                  aria-label="Select payment method"
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px]">
                    <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/card.png" 
                          alt="Credit or Debit Card" 
                          className="max-w-9 max-h-9 w-auto h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Credit or Debit Card</span>
                        <span className="text-sm text-muted-foreground">Visa, Mastercard, American Express</span>
                      </div>
                    </Label>
                  </div>
                  {/* Klarna payment option with expandable details INSIDE the same box */}
                  <div className="border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px] relative flex flex-col">
                    {/* Klarna selector row */}
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value={PAYMENT_METHODS.KLARNA} id="klarna" />
                      <Label htmlFor="klarna" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                          <div id="klarna-icon-container-selection" className="max-w-9 max-h-9 w-auto h-auto flex items-center justify-center [&>*]:max-w-full [&>*]:max-h-full [&>*]:w-auto [&>*]:h-auto [&>*]:object-contain">
                            {/* Klarna icon will be mounted here */}
                            {klarnaLoading && <Skeleton className="w-9 h-9" />}
                            {!klarnaLoading && !klarnaPresentation && <div className="w-9 h-9 bg-muted/50 rounded-sm" />}
                          </div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div id="klarna-header-container-selection" className="flex items-center text-sm font-medium leading-tight">
                            {/* Klarna header will be mounted here */}
                            {klarnaLoading && <Skeleton className="h-4 w-20" />}
                          </div>
                          <div id="klarna-subheader-container-selection" className="flex items-center text-xs text-muted-foreground leading-tight mt-0.5">
                            {/* Klarna subheader will be mounted here */}
                            {klarnaLoading && <Skeleton className="h-3 w-24" />}
                          </div>
                        </div>
                      </Label>
                    </div>
                    {/* Klarna expanded details below selector row, inside the same box */}
                    {paymentMethod === PAYMENT_METHODS.KLARNA && (
                      <div className="border-t border-border pt-4 pb-4 px-8">
                        {klarnaLoading && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                            Loading Klarna payment options...
                          </div>
                        )}
                        {klarnaError && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">
                              Failed to load Klarna payment options: {klarnaError.message}
                            </p>
                            <button
                              onClick={retry}
                              className="mt-2 text-sm text-primary hover:underline"
                            >
                              Try again
                            </button>
                          </div>
                        )}
                        
                        {/* Only show enriched subheader from Klarna presentation */}
                        <div id="klarna-enriched-subheader-container" className="min-h-[24px]">
                          {/* Klarna enriched subheader will be mounted here */}
                          {klarnaLoading && <Skeleton className="h-6 w-64" />}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px]">
                    <RadioGroupItem value={PAYMENT_METHODS.PAYPAL} id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/paypal.png" 
                          alt="PayPal" 
                          className="max-w-10 max-h-9 w-auto h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">PayPal</span>
                        <span className="text-sm text-muted-foreground">Pay with your PayPal account</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors min-h-[64px]">
                    <RadioGroupItem value={PAYMENT_METHODS.BANK} id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/medium/bank.png" 
                          alt="Bank Transfer" 
                          className="max-w-9 max-h-9 w-auto h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Bank Transfer</span>
                        <span className="text-sm text-muted-foreground">Direct bank account transfer</span>
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
                <fieldset className="space-y-4">
                  <legend className="sr-only">Shipping address information</legend>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        autoComplete="given-name"
                        required
                        aria-describedby="firstName-error"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        autoComplete="family-name"
                        required
                        aria-describedby="lastName-error"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main Street"
                      autoComplete="street-address"
                      required
                      aria-describedby="address-error"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      name="address2"
                      placeholder="Apartment, suite, etc."
                      autoComplete="address-line2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="New York"
                        autoComplete="address-level2"
                        required
                        aria-describedby="city-error"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="NY"
                        autoComplete="address-level1"
                        required
                        aria-describedby="state-error"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        placeholder="10001"
                        autoComplete="postal-code"
                        required
                        aria-describedby="zip-error"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                      required
                      aria-describedby="phone-error"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="differentBilling"
                      checked={differentBilling}
                      onCheckedChange={(checked) => setDifferentBilling(checked === true)}
                      aria-describedby="differentBilling-description"
                    />
                    <Label htmlFor="differentBilling">Billing address is different from shipping address</Label>
                  </div>

                  {differentBilling && (
                    <div className="mt-8 p-6 border border-border rounded-lg bg-muted/30">
                      <fieldset className="space-y-4">
                        <legend className="font-semibold mb-6 text-lg">Billing Address</legend>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingFirstName">First Name</Label>
                            <Input
                              id="billingFirstName"
                              name="billingFirstName"
                              placeholder="John"
                              autoComplete="billing given-name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingLastName">Last Name</Label>
                            <Input
                              id="billingLastName"
                              name="billingLastName"
                              placeholder="Doe"
                              autoComplete="billing family-name"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="billingAddress">Address</Label>
                          <Input
                            id="billingAddress"
                            name="billingAddress"
                            placeholder="456 Oak Avenue"
                            autoComplete="billing street-address"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              name="billingCity"
                              placeholder="Boston"
                              autoComplete="billing address-level2"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingState">State</Label>
                            <Input
                              id="billingState"
                              name="billingState"
                              placeholder="MA"
                              autoComplete="billing address-level1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingZip">ZIP Code</Label>
                            <Input
                              id="billingZip"
                              name="billingZip"
                              placeholder="02101"
                              autoComplete="billing postal-code"
                              required
                            />
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  )}
                </fieldset>
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
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3" role="listitem">
                      <div className="relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border"
                          loading="lazy"
                          decoding="async"
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
                      <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{formatCurrency(orderSummary.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(orderSummary.tax)}</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(orderSummary.total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  size="lg"
                  disabled={isSubmitting}
                  aria-describedby="submit-description"
                >
                  {submitButtonText}
                </Button>

                <p id="submit-description" className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
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
      <KlarnaDebugAlert 
        logs={logs} 
        onClearLogs={clearLogs}
        className="border-primary/20" 
      />
    </div>
  )
}
