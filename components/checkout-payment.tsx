"use client"

import type React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Wallet, Building2, ShoppingBag } from "lucide-react"
import { MOCK_CART_ITEMS, PAYMENT_METHODS } from "@/lib/constants"
import { calculateOrderSummary, formatCurrency } from "@/lib/utils"
import type { PaymentData } from "@/types"

export default function CheckoutPayment() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentData["method"]>(PAYMENT_METHODS.CARD)
  const [differentBilling, setDifferentBilling] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const orderSummary = useMemo(() => calculateOrderSummary(MOCK_CART_ITEMS), [])

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

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Processing..."
    if (paymentMethod === PAYMENT_METHODS.KLARNA) return "Continue with Klarna"
    return "Complete Order"
  }

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
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentData["method"])}
                  aria-label="Select payment method"
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      Credit or Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={PAYMENT_METHODS.PAYPAL} id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-4 w-4" aria-hidden="true" />
                      PayPal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={PAYMENT_METHODS.KLARNA} id="klarna" />
                    <Label htmlFor="klarna" className="flex items-center gap-2 cursor-pointer flex-1">
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      Klarna
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={PAYMENT_METHODS.BANK} id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      Bank Transfer
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

                {paymentMethod === PAYMENT_METHODS.KLARNA && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg" role="region" aria-labelledby="klarna-info">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
                      <h3 id="klarna-info" className="font-semibold">
                        Pay with Klarna
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Split your purchase into 4 interest-free payments. No fees when you pay on time.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-xs" role="list" aria-label="Payment schedule">
                      <div className="text-center p-2 bg-background rounded border" role="listitem">
                        <div className="font-semibold">{formatCurrency(orderSummary.total / 4)}</div>
                        <div className="text-muted-foreground">Today</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded border" role="listitem">
                        <div className="font-semibold">{formatCurrency(orderSummary.total / 4)}</div>
                        <div className="text-muted-foreground">2 weeks</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded border" role="listitem">
                        <div className="font-semibold">{formatCurrency(orderSummary.total / 4)}</div>
                        <div className="text-muted-foreground">4 weeks</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded border" role="listitem">
                        <div className="font-semibold">{formatCurrency(orderSummary.total / 4)}</div>
                        <div className="text-muted-foreground">6 weeks</div>
                      </div>
                    </div>
                  </div>
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
                      onCheckedChange={setDifferentBilling}
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
                  {MOCK_CART_ITEMS.map((item) => (
                    <div key={item.id} className="flex items-center gap-3" role="listitem">
                      <div className="relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border"
                          loading="lazy"
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
                  {getSubmitButtonText()}
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
    </div>
  )
}
