import { useState, useCallback } from "react"

export interface FormData {
  firstName: string
  lastName: string
  address: string
  address2: string
  city: string
  state: string
  zip: string
  country: string // Country code (e.g., "US", "CA", "GB")
  phone: string
  email: string
  cardNumber: string
  expiry: string
  cvc: string
  cardName: string
  billingFirstName: string
  billingLastName: string
  billingAddress: string
  billingAddress2: string
  billingCity: string
  billingState: string
  billingZip: string
  billingCountry: string // Country code (e.g., "US", "CA", "GB")
  billingPhone: string
  billingEmail: string
}

// Helper function to get prefilled address data based on locale
const getPrefilledAddressData = (locale: string) => {
  // Only prefill for en-US or es-US locales
  if (locale === "en-US" || locale === "es-US") {
    return {
      firstName: "Test",
      lastName: "Person-us",
      address: "509 Amsterdam Ave",
      address2: "",
      city: "New York",
      state: "NY",
      zip: "10024-3941",
      country: "US",
      phone: "+13106683312",
      email: "customer@email.us",
    }
  }
  // Return empty data for other locales
  return {
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
    email: "",
  }
}

const createInitialFormData = (locale: string): FormData => {
  const prefilledData = getPrefilledAddressData(locale)
  return {
    ...prefilledData,
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardName: "",
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingAddress2: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "",
    billingPhone: "",
    billingEmail: "",
  }
}

export function useCheckoutForm(initialLocale: string) {
  const [formData, setFormData] = useState<FormData>(() => createInitialFormData(initialLocale))
  const [differentBilling, setDifferentBilling] = useState(false)

  // Handle form field changes - simplified without debouncing for better UX
  const handleFieldChange = useCallback((field: keyof FormData | string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field as keyof FormData]: value,
    }))
  }, [])

  // Update form data when locale changes
  const updateFormDataForLocale = useCallback((newLocale: string, newCountry: string) => {
    const prefilledData = getPrefilledAddressData(newLocale)
    setFormData(prev => ({
      ...prev,
      ...prefilledData,
      country: newCountry,
    }))
  }, [])

  // Validate form on submit
  const validateFormOnSubmit = useCallback(() => {
    const requiredFields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "zip",
      "country",
      "phone",
      "email",
    ]
    return requiredFields.every(field => formData[field]?.trim() !== "")
  }, [formData])

  // Get shipping and billing addresses for API calls
  const getAddresses = useCallback(() => {
    const shipping = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: formData.country,
      phone: formData.phone,
      email: formData.email,
    }

    const billing = {
      firstName: formData.billingFirstName,
      lastName: formData.billingLastName,
      address: formData.billingAddress,
      address2: formData.billingAddress2,
      city: formData.billingCity,
      state: formData.billingState,
      zip: formData.billingZip,
      country: formData.billingCountry,
      phone: formData.billingPhone,
      email: formData.billingEmail,
    }

    // Simple logic: use different billing if checkbox is checked and billing fields are filled
    const useDifferentBilling =
      differentBilling &&
      billing.firstName &&
      billing.address &&
      billing.city &&
      billing.zip &&
      billing.country

    return {
      shipping,
      billing,
      useDifferentBilling,
    }
  }, [formData, differentBilling])

  return {
    formData,
    differentBilling,
    setDifferentBilling,
    handleFieldChange,
    updateFormDataForLocale,
    validateFormOnSubmit,
    getAddresses,
  }
}
