export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  address2?: string
  city: string
  state: string
  zip: string
  phone: string
}

export interface BillingAddress extends ShippingAddress {}

export interface PaymentData {
  method: "card" | "paypal" | "klarna" | "bank"
  cardNumber?: string
  expiry?: string
  cvc?: string
  cardName?: string
}

export interface OrderSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface KlarnaSDKConfig {
  environment: "sandbox" | "production"
  region: "eu" | "na" | "oc"
  theme?: "light" | "dark"
}

// Klarna SDK Component Types
export interface KlarnaComponent {
  mount: (selector: string | HTMLElement) => void
  unmount: () => void
  htmlElement?: HTMLElement
}

export interface KlarnaComponentFactory {
  (): KlarnaComponent
}

export interface KlarnaSubheader {
  short?: {
    component: KlarnaComponentFactory
  }
  enriched?: {
    component: KlarnaComponentFactory
  }
}

export interface KlarnaPresentation {
  icon?: {
    component: KlarnaComponentFactory
  }
  header?: {
    component: KlarnaComponentFactory
  }
  subheader?: KlarnaSubheader
  paymentButton?: {
    component: (config: any) => KlarnaComponent
  }
}

export interface KlarnaSDK {
  Payment?: {
    presentation: (config: {
      amount: number
      currency: string
      locale: string
    }) => Promise<KlarnaPresentation>
  }
  presentation?: (config: {
    amount: number
    currency: string
    locale: string
  }) => Promise<KlarnaPresentation>
}

export interface KlarnaPaymentMethodCategory {
  identifier: string
  name: string
  asset_urls: {
    descriptive: string
    standard: string
  }
}

export interface KlarnaSessionData {
  session_id: string
  client_token: string
  payment_method_categories: KlarnaPaymentMethodCategory[]
  session_intent: string
  expires_at: string
}

// Currency and Locale Types
export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface Locale {
  code: string
  name: string
  country: string
  countryCode: string
}

export interface Country {
  code: string
  name: string
  currency: string
  locales: string[]
}

export interface CurrencyLocaleSelection {
  currency: string
  locale: string
}

// Type for the supported countries from constants
export type SupportedCountry = (typeof import("@/lib/constants").SUPPORTED_COUNTRIES)[number]
export type SupportedCurrency = (typeof import("@/lib/constants").SUPPORTED_CURRENCIES)[number]
export type SupportedLocale = (typeof import("@/lib/constants").SUPPORTED_LOCALES)[number]
