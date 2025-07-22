"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Minus, Plus, X } from "lucide-react"
import { useCartContext } from "@/components/cart-context"
import { useCurrencyLocale } from "@/components/currency-locale-context"
import { formatCurrency, calculateOrderSummary } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface MiniCartProps {
  className?: string
}

export function MiniCart({ className }: MiniCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { items, updateQuantity, removeItem, totalItems, isEmpty } = useCartContext()
  const { currency, locale } = useCurrencyLocale()
  const { toast } = useToast()

  const orderSummary = calculateOrderSummary(items)

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      const item = items.find(i => i.id === productId)
      if (item) {
        removeItem(productId)
        toast({
          title: "Item removed",
          description: `${item.name} has been removed from your cart.`,
          duration: 3000,
        })
      }
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: number) => {
    const item = items.find(i => i.id === productId)
    if (item) {
      removeItem(productId)
      toast({
        title: "Item removed",
        description: `${item.name} has been removed from your cart.`,
        duration: 3000,
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={`relative ${className}`}>
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Shopping cart</span>
          {totalItems > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground"
              variant="default"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mb-6">Add some products to get started</p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover rounded border"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate mb-1">{item.name}</h4>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center border rounded bg-background">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted rounded-l rounded-r-none border-r"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="px-2 text-xs font-medium min-w-[1.5rem] text-center bg-muted/30 h-6 flex items-center justify-center border-r">
                            {item.quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted rounded-r rounded-l-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity, currency, locale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
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

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(orderSummary.total, currency, locale)}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 w-full">
                <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                  <Link href="/checkout">View Cart & Checkout</Link>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
