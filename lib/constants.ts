import type { CartItem } from "@/types"

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

// Country/Locale/Currency Data
export const SUPPORTED_COUNTRIES = [
  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    locales: ["en-AU"] as const,
  },
  {
    code: "AT",
    name: "Austria",
    currency: "EUR",
    locales: ["de-AT", "en-AT"] as const,
  },
  {
    code: "BE",
    name: "Belgium",
    currency: "EUR",
    locales: ["nl-BE", "fr-BE", "en-BE"] as const,
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    locales: ["en-CA", "fr-CA"] as const,
  },
  {
    code: "CZ",
    name: "Czech Republic",
    currency: "CZK",
    locales: ["cs-CZ", "en-CZ"] as const,
  },
  {
    code: "DK",
    name: "Denmark",
    currency: "DKK",
    locales: ["da-DK", "en-DK"] as const,
  },
  {
    code: "FI",
    name: "Finland",
    currency: "EUR",
    locales: ["fi-FI", "sv-FI", "en-FI"] as const,
  },
  {
    code: "FR",
    name: "France",
    currency: "EUR",
    locales: ["fr-FR", "en-FR"] as const,
  },
  {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    locales: ["de-DE", "en-DE"] as const,
  },
  {
    code: "GR",
    name: "Greece",
    currency: "EUR",
    locales: ["el-GR", "en-GR"] as const,
  },
  {
    code: "HU",
    name: "Hungary",
    currency: "HUF",
    locales: ["hu-HU", "en-HU"] as const,
  },
  {
    code: "IE",
    name: "Ireland",
    currency: "EUR",
    locales: ["en-IE"] as const,
  },
  {
    code: "IT",
    name: "Italy",
    currency: "EUR",
    locales: ["it-IT", "en-IT"] as const,
  },
  {
    code: "MX",
    name: "Mexico",
    currency: "MXN",
    locales: ["en-MX", "es-MX"] as const,
  },
  {
    code: "NL",
    name: "Netherlands",
    currency: "EUR",
    locales: ["nl-NL", "en-NL"] as const,
  },
  {
    code: "NZ",
    name: "New Zealand",
    currency: "NZD",
    locales: ["en-NZ"] as const,
  },
  {
    code: "NO",
    name: "Norway",
    currency: "NOK",
    locales: ["nb-NO", "en-NO"] as const,
  },
  {
    code: "PL",
    name: "Poland",
    currency: "PLN",
    locales: ["pl-PL", "en-PL"] as const,
  },
  {
    code: "PT",
    name: "Portugal",
    currency: "EUR",
    locales: ["pt-PT", "en-PT"] as const,
  },
  {
    code: "RO",
    name: "Romania",
    currency: "RON",
    locales: ["ro-RO", "en-RO"] as const,
  },
  {
    code: "SK",
    name: "Slovakia",
    currency: "EUR",
    locales: ["sk-SK", "en-SK"] as const,
  },
  {
    code: "ES",
    name: "Spain",
    currency: "EUR",
    locales: ["es-ES", "en-ES"] as const,
  },
  {
    code: "SE",
    name: "Sweden",
    currency: "SEK",
    locales: ["sv-SE", "en-SE"] as const,
  },
  {
    code: "CH",
    name: "Switzerland",
    currency: "CHF",
    locales: ["de-CH", "fr-CH", "it-CH", "en-CH"] as const,
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    locales: ["en-GB"] as const,
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    locales: ["en-US", "es-US"] as const,
  },
] as const

// Extract unique currencies
export const SUPPORTED_CURRENCIES = Array.from(
  new Set(SUPPORTED_COUNTRIES.map(country => country.currency))
).map(currency => ({
  code: currency,
  name: getCurrencyName(currency),
  symbol: getCurrencySymbol(currency),
}))

// Extract all locales with their display names
export const SUPPORTED_LOCALES = SUPPORTED_COUNTRIES.flatMap(country =>
  country.locales.map(locale => ({
    code: locale,
    name: getLocaleDisplayName(locale),
    country: country.name,
    countryCode: country.code,
  }))
)

// Helper functions
function getCurrencyName(currency: string): string {
  const currencyNames: Record<string, string> = {
    AUD: "Australian Dollar",
    EUR: "Euro",
    CAD: "Canadian Dollar",
    CZK: "Czech Koruna",
    DKK: "Danish Krone",
    HUF: "Hungarian Forint",
    MXN: "Mexican Peso",
    NZD: "New Zealand Dollar",
    NOK: "Norwegian Krone",
    PLN: "Polish Złoty",
    RON: "Romanian Leu",
    SEK: "Swedish Krona",
    CHF: "Swiss Franc",
    GBP: "British Pound",
    USD: "US Dollar",
  }
  return currencyNames[currency] || currency
}

function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
    AUD: "A$",
    EUR: "€",
    CAD: "C$",
    CZK: "Kč",
    DKK: "kr",
    HUF: "Ft",
    MXN: "$",
    NZD: "NZ$",
    NOK: "kr",
    PLN: "zł",
    RON: "lei",
    SEK: "kr",
    CHF: "CHF",
    GBP: "£",
    USD: "$",
  }
  return currencySymbols[currency] || currency
}

function getLocaleDisplayName(locale: string): string {
  const localeNames: Record<string, string> = {
    "en-AU": "English (Australia)",
    "de-AT": "German (Austria)",
    "en-AT": "English (Austria)",
    "nl-BE": "Dutch (Belgium)",
    "fr-BE": "French (Belgium)",
    "en-BE": "English (Belgium)",
    "en-CA": "English (Canada)",
    "fr-CA": "French (Canada)",
    "cs-CZ": "Czech (Czech Republic)",
    "en-CZ": "English (Czech Republic)",
    "da-DK": "Danish (Denmark)",
    "en-DK": "English (Denmark)",
    "fi-FI": "Finnish (Finland)",
    "sv-FI": "Swedish (Finland)",
    "en-FI": "English (Finland)",
    "fr-FR": "French (France)",
    "en-FR": "English (France)",
    "de-DE": "German (Germany)",
    "en-DE": "English (Germany)",
    "el-GR": "Greek (Greece)",
    "en-GR": "English (Greece)",
    "hu-HU": "Hungarian (Hungary)",
    "en-HU": "English (Hungary)",
    "en-IE": "English (Ireland)",
    "it-IT": "Italian (Italy)",
    "en-IT": "English (Italy)",
    "en-MX": "English (Mexico)",
    "es-MX": "Spanish (Mexico)",
    "nl-NL": "Dutch (Netherlands)",
    "en-NL": "English (Netherlands)",
    "en-NZ": "English (New Zealand)",
    "nb-NO": "Norwegian (Norway)",
    "en-NO": "English (Norway)",
    "pl-PL": "Polish (Poland)",
    "en-PL": "English (Poland)",
    "pt-PT": "Portuguese (Portugal)",
    "en-PT": "English (Portugal)",
    "ro-RO": "Romanian (Romania)",
    "en-RO": "English (Romania)",
    "sk-SK": "Slovak (Slovakia)",
    "en-SK": "English (Slovakia)",
    "es-ES": "Spanish (Spain)",
    "en-ES": "English (Spain)",
    "sv-SE": "Swedish (Sweden)",
    "en-SE": "English (Sweden)",
    "de-CH": "German (Switzerland)",
    "fr-CH": "French (Switzerland)",
    "it-CH": "Italian (Switzerland)",
    "en-CH": "English (Switzerland)",
    "en-GB": "English (United Kingdom)",
    "en-US": "English (United States)",
    "es-US": "Spanish (United States)",
  }
  return localeNames[locale] || locale
}

// Helper function to get currency for a given locale
export function getCurrencyForLocale(locale: string): string {
  const country = SUPPORTED_COUNTRIES.find(c => 
    (c.locales as readonly string[]).includes(locale)
  )
  return country?.currency || "USD"
}

// Helper function to get default locale for a given currency
export function getDefaultLocaleForCurrency(currency: string): string {
  const country = SUPPORTED_COUNTRIES.find(c => c.currency === currency)
  return country?.locales[0] || "en-US"
}

// Helper function to get available locales for a currency
export function getLocalesForCurrency(currency: string): string[] {
  return SUPPORTED_COUNTRIES
    .filter(c => c.currency === currency)
    .flatMap(c => c.locales as readonly string[])
}
