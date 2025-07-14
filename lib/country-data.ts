/**
 * Central repository for Country, Locale, and Currency data
 * This module provides a single source of truth for all geographic and currency information
 * used throughout the application, particularly for Klarna payment integration.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Country {
  /** ISO 3166-1 alpha-2 country code */
  code: string
  /** Full country name */
  name: string
  /** ISO 4217 currency code */
  currency: CurrencyCode
  /** Supported locales for this country */
  locales: readonly string[]
}

export interface Currency {
  /** ISO 4217 currency code */
  code: CurrencyCode
  /** Full currency name */
  name: string
  /** Currency symbol */
  symbol: string
}

export interface Locale {
  /** IETF language tag */
  code: string
  /** Display name for the locale */
  name: string
  /** Country this locale belongs to */
  country: string
  /** Country code */
  countryCode: string
}

export type CurrencyCode =
  | "AUD"
  | "EUR"
  | "CAD"
  | "CZK"
  | "DKK"
  | "HUF"
  | "MXN"
  | "NZD"
  | "NOK"
  | "PLN"
  | "RON"
  | "SEK"
  | "CHF"
  | "GBP"
  | "USD"

export type CountryCode =
  | "AU"
  | "AT"
  | "BE"
  | "CA"
  | "CZ"
  | "DK"
  | "FI"
  | "FR"
  | "DE"
  | "GR"
  | "HU"
  | "IE"
  | "IT"
  | "MX"
  | "NL"
  | "NZ"
  | "NO"
  | "PL"
  | "PT"
  | "RO"
  | "SK"
  | "ES"
  | "SE"
  | "CH"
  | "GB"
  | "US"

// ============================================================================
// COUNTRY DATA
// ============================================================================

export const COUNTRIES: readonly Country[] = [
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

// ============================================================================
// CURRENCY DATA
// ============================================================================

export const CURRENCIES: readonly Currency[] = [
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "USD", name: "US Dollar", symbol: "$" },
] as const

// ============================================================================
// LOCALE DATA
// ============================================================================

export const LOCALES: readonly Locale[] = COUNTRIES.flatMap(country =>
  country.locales.map(locale => ({
    code: locale,
    name: getLocaleDisplayName(locale),
    country: country.name,
    countryCode: country.code,
  }))
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get country by country code
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code)
}

/**
 * Get country by country name
 */
export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find(country => country.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get currency by currency code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(currency => currency.code === code)
}

/**
 * Get locale by locale code
 */
export function getLocaleByCode(code: string): Locale | undefined {
  return LOCALES.find(locale => locale.code === code)
}

/**
 * Get currency for a given locale
 */
export function getCurrencyForLocale(locale: string): CurrencyCode {
  const localeData = getLocaleByCode(locale)
  if (!localeData) {
    return "USD" // Default fallback
  }

  const country = getCountryByCode(localeData.countryCode)
  return country?.currency ?? "USD"
}

/**
 * Get country code for a given locale
 */
export function getCountryCodeForLocale(locale: string): CountryCode {
  const localeData = getLocaleByCode(locale)
  if (!localeData) {
    return "US" // Default fallback
  }

  return localeData.countryCode as CountryCode
}

/**
 * Get default locale for a currency
 */
export function getDefaultLocaleForCurrency(currency: string): string {
  const country = COUNTRIES.find(c => c.currency === currency)
  return country?.locales[0] ?? "en-US"
}

/**
 * Get all locales for a specific currency
 */
export function getLocalesForCurrency(currency: string): string[] {
  return COUNTRIES.filter(country => country.currency === currency).flatMap(
    country => country.locales
  )
}

/**
 * Get all countries that use a specific currency
 */
export function getCountriesForCurrency(currency: string): Country[] {
  return COUNTRIES.filter(country => country.currency === currency)
}

/**
 * Check if a country supports a specific locale
 */
export function countrySupportsLocale(countryCode: string, locale: string): boolean {
  const country = getCountryByCode(countryCode)
  return country?.locales.includes(locale as never) ?? false
}

/**
 * Get supported locales for a country
 */
export function getLocalesForCountry(countryCode: string): string[] {
  const country = getCountryByCode(countryCode)
  return country ? [...country.locales] : []
}

/**
 * Convert country code to country name
 */
export function getCountryName(countryCode: string): string {
  const country = getCountryByCode(countryCode)
  return country?.name ?? countryCode
}

/**
 * Convert currency code to currency name
 */
export function getCurrencyName(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode)
  return currency?.name ?? currencyCode
}

/**
 * Convert currency code to currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode)
  return currency?.symbol ?? currencyCode
}

/**
 * Get display name for a locale
 */
export function getLocaleDisplayName(locale: string): string {
  const localeNames: Record<string, string> = {
    "en-AU": "English (Australia)",
    "de-AT": "Deutsch (Österreich)",
    "en-AT": "English (Austria)",
    "nl-BE": "Nederlands (België)",
    "fr-BE": "Français (Belgique)",
    "en-BE": "English (Belgium)",
    "en-CA": "English (Canada)",
    "fr-CA": "Français (Canada)",
    "cs-CZ": "Čeština (Česká republika)",
    "en-CZ": "English (Czech Republic)",
    "da-DK": "Dansk (Danmark)",
    "en-DK": "English (Denmark)",
    "fi-FI": "Suomi (Suomi)",
    "sv-FI": "Svenska (Finland)",
    "en-FI": "English (Finland)",
    "fr-FR": "Français (France)",
    "en-FR": "English (France)",
    "de-DE": "Deutsch (Deutschland)",
    "en-DE": "English (Germany)",
    "el-GR": "Ελληνικά (Ελλάδα)",
    "en-GR": "English (Greece)",
    "hu-HU": "Magyar (Magyarország)",
    "en-HU": "English (Hungary)",
    "en-IE": "English (Ireland)",
    "it-IT": "Italiano (Italia)",
    "en-IT": "English (Italy)",
    "en-MX": "English (Mexico)",
    "es-MX": "Español (México)",
    "nl-NL": "Nederlands (Nederland)",
    "en-NL": "English (Netherlands)",
    "en-NZ": "English (New Zealand)",
    "nb-NO": "Norsk bokmål (Norge)",
    "en-NO": "English (Norway)",
    "pl-PL": "Polski (Polska)",
    "en-PL": "English (Poland)",
    "pt-PT": "Português (Portugal)",
    "en-PT": "English (Portugal)",
    "ro-RO": "Română (România)",
    "en-RO": "English (Romania)",
    "sk-SK": "Slovenčina (Slovensko)",
    "en-SK": "English (Slovakia)",
    "es-ES": "Español (España)",
    "en-ES": "English (Spain)",
    "sv-SE": "Svenska (Sverige)",
    "en-SE": "English (Sweden)",
    "de-CH": "Deutsch (Schweiz)",
    "fr-CH": "Français (Suisse)",
    "it-CH": "Italiano (Svizzera)",
    "en-CH": "English (Switzerland)",
    "en-GB": "English (United Kingdom)",
    "en-US": "English (United States)",
    "es-US": "Español (Estados Unidos)",
  }

  return localeNames[locale] ?? locale
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a country code is valid
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return COUNTRIES.some(country => country.code === code)
}

/**
 * Check if a currency code is valid
 */
export function isValidCurrencyCode(code: string): code is CurrencyCode {
  return CURRENCIES.some(currency => currency.code === code)
}

/**
 * Check if a locale code is valid
 */
export function isValidLocale(code: string): boolean {
  return LOCALES.some(locale => locale.code === code)
}

// ============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

/** @deprecated Use COUNTRIES instead */
export const SUPPORTED_COUNTRIES = COUNTRIES

/** @deprecated Use CURRENCIES instead */
export const SUPPORTED_CURRENCIES = CURRENCIES

/** @deprecated Use LOCALES instead */
export const SUPPORTED_LOCALES = LOCALES
