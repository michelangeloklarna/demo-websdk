import type { CartItem } from "@/types"

// Re-export geographic data from centralized module
export {
  // Main data exports
  COUNTRIES as SUPPORTED_COUNTRIES,
  CURRENCIES as SUPPORTED_CURRENCIES,
  LOCALES as SUPPORTED_LOCALES,

  // Helper functions
  getCurrencyForLocale,
  getDefaultLocaleForCurrency,
  getLocalesForCurrency,
  getCountryName,
  getCurrencyName,
  getCurrencySymbol,
  getLocaleDisplayName,

  // Validation functions
  isValidCountryCode,
  isValidCurrencyCode,
  isValidLocale,

  // Types
  type Country,
  type Currency,
  type Locale,
  type CountryCode,
  type CurrencyCode,
} from "@/lib/country-data"

export const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    quantity: 1,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "USB-C Charging Cable",
    price: 24.99,
    quantity: 2,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Laptop Stand",
    price: 45.0,
    quantity: 1,
    image: "/placeholder.svg?height=80&width=80",
  },
]

export const SHIPPING_COST = 9.99
export const TAX_RATE = 0.08

export const PAYMENT_METHODS = {
  CARD: "card",
  PAYPAL: "paypal",
  KLARNA: "klarna",
  BANK: "bank",
} as const
