import { z } from "zod"

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  address: z.string().min(1, "Address is required").max(100, "Address too long"),
  address2: z.string().max(100, "Address line 2 too long").optional(),
  city: z.string().min(1, "City is required").max(50, "City name too long"),
  state: z.string().min(1, "State is required").max(50, "State name too long"),
  zip: z.string().min(1, "ZIP code is required").regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  phone: z.string().min(1, "Phone number is required").regex(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/, "Invalid phone number"),
})

export const billingAddressSchema = shippingAddressSchema

export const cardPaymentSchema = z.object({
  cardNumber: z.string().min(1, "Card number is required").regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Invalid card number"),
  expiry: z.string().min(1, "Expiry date is required").regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvc: z.string().min(1, "CVC is required").regex(/^\d{3,4}$/, "Invalid CVC"),
  cardName: z.string().min(1, "Name on card is required").max(100, "Name too long"),
})

export const checkoutFormSchema = z.object({
  paymentMethod: z.enum(["card", "paypal", "klarna", "bank"], {
    required_error: "Payment method is required",
  }),
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema.optional(),
  cardPayment: cardPaymentSchema.optional(),
  differentBilling: z.boolean().default(false),
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>
export type BillingAddressData = z.infer<typeof billingAddressSchema>
export type CardPaymentData = z.infer<typeof cardPaymentSchema>