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
