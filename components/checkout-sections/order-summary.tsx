"use client"

import React, { useRef, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { PAYMENT_METHODS } from "@/lib/constants"
import type { PaymentData } from "@/types"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface OrderSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

interface OrderSummaryProps {
  cartItems: OrderItem[]
  orderSummary: OrderSummary
  currency: string
  locale: string
  paymentMethod: PaymentData["method"]
  isSubmitting: boolean
  submitError: string | null
  
  // Klarna-specific props
  klarnaPresentation: any
  klarnaLoading: boolean
  buttonConfig: any
  
  // Handlers
  onNonKlarnaSubmit: () => void
}

export function OrderSummarySection({
  cartItems,
  orderSummary,
  currency,
  locale,
  paymentMethod,
  isSubmitting,
  submitError,
  klarnaPresentation,
  klarnaLoading,
  buttonConfig,
  onNonKlarnaSubmit,
}: OrderSummaryProps) {
  // Refs for Klarna payment button
  const klarnaButtonContainerRef = useRef<HTMLDivElement>(null)
  const klarnaButtonRef = useRef<any>(null)

  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return "Processing..."
    }
    if (paymentMethod === PAYMENT_METHODS.KLARNA) {
      return "Continue with Klarna"
    }
    return "Complete Order"
  }, [isSubmitting, paymentMethod])

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

  return (
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
          <div className="w-full mt-6 relative">
            <div
              ref={klarnaButtonContainerRef}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 overflow-hidden"
              style={{
                maxHeight: "44px",
                minHeight: "44px",
                pointerEvents: "auto",
              }}
            />
            {klarnaLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-pink-600 rounded-md flex items-center justify-center text-white text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Loading Klarna...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            type="submit"
            className="w-full mt-6"
            size="lg"
            disabled={isSubmitting}
            aria-describedby="submit-description"
            onClick={onNonKlarnaSubmit}
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
  )
} 
