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

export interface KlarnaSDK {
  init: (config: KlarnaSDKConfig) => Promise<void>
  load: (options: {
    container: string
    session_token: string
    payment_method_category?: string
    on_load?: (loadEvent: any) => void
    on_load_payment_review?: (loadEvent: any) => void
    on_authorize?: (authorizeEvent: any) => void
    on_finalize?: (finalizeEvent: any) => void
    on_error?: (error: any) => void
    on_shipping_address_change?: (event: any) => void
    on_shipping_option_change?: (event: any) => void
    on_billing_address_change?: (event: any) => void
  }) => Promise<void>
  authorize: () => Promise<void>
  reauthorize: () => Promise<void>
  finalize: () => Promise<void>
}
