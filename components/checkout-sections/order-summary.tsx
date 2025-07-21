"use client"

import React, { useRef, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Minus, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PAYMENT_METHODS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
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
  
  // Cart management handlers
  onUpdateQuantity?: (productId: number, quantity: number) => void
  onRemoveItem?: (productId: number) => void
  
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
  onUpdateQuantity,
  onRemoveItem,
  onNonKlarnaSubmit,
}: OrderSummaryProps) {
  // Refs for Klarna payment button
  const klarnaButtonContainerRef = useRef<HTMLDivElement>(null)
  const klarnaButtonRef = useRef<any>(null)
  const [isRemoving, setIsRemoving] = useState<number | null>(null)
  const { toast } = useToast()

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
            <div key={item.id} className="flex items-start gap-3" role="listitem">
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="object-cover rounded-md border"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate mb-2">{item.name}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {onUpdateQuantity && onRemoveItem ? (
                        <div className="flex items-center border rounded-md bg-background shadow-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted rounded-l-md rounded-r-none border-r transition-colors"
                            onClick={() => {
                              const newQuantity = Math.max(0, item.quantity - 1)
                              onUpdateQuantity(item.id, newQuantity)
                              if (newQuantity === 0) {
                                toast({
                                  title: "Item removed",
                                  description: `${item.name} has been removed from your cart.`,
                                  duration: 3000,
                                })
                              }
                            }}
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className={`h-3 w-3 transition-colors ${item.quantity <= 1 ? 'text-muted-foreground' : 'text-foreground'}`} />
                          </Button>
                          <span className="px-3 text-sm font-medium min-w-[2.5rem] text-center bg-muted/30 h-8 flex items-center justify-center border-r">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted rounded-r-md rounded-l-none transition-colors"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.price * item.quantity, currency, locale)}
                    </p>
                  </div>
                  {onUpdateQuantity && onRemoveItem && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive underline-offset-4 transition-colors duration-200 justify-start"
                          disabled={isRemoving === item.id}
                        >
                          {isRemoving === item.id ? (
                            <span className="flex items-center gap-1">
                              <div className="animate-spin h-3 w-3 border border-destructive border-t-transparent rounded-full" />
                              Removing...
                            </span>
                          ) : (
                            "Remove"
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove <strong>{item.name}</strong> from your cart? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep item</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
                            onClick={() => {
                              setIsRemoving(item.id)
                              // Add a small delay for better UX feedback
                              setTimeout(() => {
                                onRemoveItem(item.id)
                                setIsRemoving(null)
                                toast({
                                  title: "Item removed",
                                  description: `${item.name} has been removed from your cart.`,
                                  duration: 3000,
                                })
                              }, 300)
                            }}
                          >
                            Remove item
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
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