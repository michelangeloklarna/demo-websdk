import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CartItem, OrderSummary } from "@/types"
import { SHIPPING_COST, TAX_RATE } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateOrderSummary(items: CartItem[]): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = SHIPPING_COST
  const tax = subtotal * TAX_RATE
  const total = subtotal + shipping + tax

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Legacy function for backwards compatibility
export function formatCurrencyUSD(amount: number): string {
  return formatCurrency(amount, "USD", "en-US")
}
