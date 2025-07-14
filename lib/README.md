# Country, Locale, and Currency Data Repository

This directory contains the centralized repository for managing Country, Locale, and Currency data across the application.

## Overview

The `country-data.ts` module serves as the single source of truth for all geographic and currency information used throughout the application, particularly for Klarna payment integration.

## Architecture

### File Structure

```
lib/
├── country-data.ts        # Central repository (NEW)
├── constants.ts           # Re-exports + other constants
└── README.md             # This documentation
```

### Core Modules

#### `country-data.ts` 🌍

The main module containing:

- **Country data**: All supported countries with their codes, names, currencies, and locales
- **Currency data**: Currency codes, names, and symbols
- **Locale data**: Language tags with display names and country associations
- **Helper functions**: Utility functions for data manipulation and lookup
- **Validation functions**: Type-safe validation for codes and locales
- **Type definitions**: Strong TypeScript types for all data structures

#### `constants.ts` 📋

Simplified module that:

- Re-exports all country-data exports for backward compatibility
- Contains application-specific constants (cart items, payment methods, etc.)
- Maintains existing API for components already using it

## Usage Guide

### Basic Imports

```typescript
// Import data arrays
import { COUNTRIES, CURRENCIES, LOCALES } from "@/lib/country-data"

// Import helper functions
import {
  getCurrencyForLocale,
  getCountryName,
  getCurrencySymbol,
  getLocaleDisplayName,
} from "@/lib/country-data"

// Import types
import type { Country, Currency, Locale, CountryCode, CurrencyCode } from "@/lib/country-data"
```

### Common Use Cases

#### 1. Country Dropdown Component

```typescript
import { COUNTRIES } from "@/lib/country-data"

function CountrySelect() {
  return (
    <select>
      {COUNTRIES.map(country => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  )
}
```

#### 2. Currency Display

```typescript
import { getCurrencySymbol, getCurrencyName } from "@/lib/country-data"

function PriceDisplay({ amount, currency }: { amount: number, currency: string }) {
  return (
    <span>
      {getCurrencySymbol(currency)}{amount} {currency}
    </span>
  )
}
```

#### 3. Locale-based Currency Selection

```typescript
import { getCurrencyForLocale } from "@/lib/country-data"

function useLocaleBasedCurrency(locale: string) {
  const currency = getCurrencyForLocale(locale)
  return currency
}
```

#### 4. Validation

```typescript
import { isValidCountryCode, isValidCurrencyCode } from "@/lib/country-data"

function validateUserInput(countryCode: string, currencyCode: string) {
  if (!isValidCountryCode(countryCode)) {
    throw new Error("Invalid country code")
  }

  if (!isValidCurrencyCode(currencyCode)) {
    throw new Error("Invalid currency code")
  }
}
```

### Available Helper Functions

| Function                                 | Purpose                           | Example                                   |
| ---------------------------------------- | --------------------------------- | ----------------------------------------- |
| `getCountryByCode(code)`                 | Find country by ISO code          | `getCountryByCode("US")`                  |
| `getCountryByName(name)`                 | Find country by name              | `getCountryByName("United States")`       |
| `getCurrencyByCode(code)`                | Find currency by ISO code         | `getCurrencyByCode("USD")`                |
| `getLocaleByCode(code)`                  | Find locale by IETF tag           | `getLocaleByCode("en-US")`                |
| `getCurrencyForLocale(locale)`           | Get currency for locale           | `getCurrencyForLocale("en-US")` → `"USD"` |
| `getCountriesForCurrency(currency)`      | Get countries using currency      | `getCountriesForCurrency("EUR")`          |
| `getLocalesForCountry(countryCode)`      | Get supported locales for country | `getLocalesForCountry("CH")`              |
| `countrySupportsLocale(country, locale)` | Check locale support              | `countrySupportsLocale("US", "en-US")`    |

### Type Safety

The module provides strong TypeScript types:

```typescript
// Country codes are strictly typed
type CountryCode =
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

// Currency codes are strictly typed
type CurrencyCode =
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

// Interfaces provide structure
interface Country {
  code: string
  name: string
  currency: CurrencyCode
  locales: readonly string[]
}
```

## Supported Data

### Countries (27 total)

All Klarna-supported countries including:

- **North America**: US, CA, MX
- **Europe**: GB, DE, FR, IT, ES, NL, BE, AT, CH, SE, NO, DK, FI, IE, PL, CZ, SK, HU, RO, GR, PT
- **Asia-Pacific**: AU, NZ

### Currencies (15 total)

- **Major**: USD, EUR, GBP, CAD, AUD
- **European**: SEK, NOK, DKK, CHF, PLN, CZK, HUF, RON
- **Others**: MXN, NZD

### Locales (58 total)

Multiple locales per country with proper display names in native languages.

## Migration Guide

### For Existing Components

If you're updating existing components that use the old `constants.ts` imports:

#### Before:

```typescript
import { SUPPORTED_COUNTRIES, getCurrencyForLocale } from "@/lib/constants"
```

#### After (Option 1 - Keep using constants.ts):

```typescript
import { SUPPORTED_COUNTRIES, getCurrencyForLocale } from "@/lib/constants"
// No changes needed - backward compatibility maintained
```

#### After (Option 2 - Direct import for better performance):

```typescript
import { COUNTRIES, getCurrencyForLocale } from "@/lib/country-data"
// Replace SUPPORTED_COUNTRIES with COUNTRIES
```

### For New Components

Always import directly from `country-data.ts` for new components:

```typescript
import { COUNTRIES, CURRENCIES, LOCALES } from "@/lib/country-data"
```

## Maintenance Guidelines

### Adding New Countries

1. Add country data to `COUNTRIES` array in `country-data.ts`
2. Update `CountryCode` type to include new country code
3. Add currency to `CURRENCIES` array if new
4. Add locale display names to `getLocaleDisplayName()` function
5. Run tests to ensure backward compatibility

### Adding New Currencies

1. Add currency to `CURRENCIES` array
2. Update `CurrencyCode` type
3. Test currency conversion functions

### Adding New Locales

1. Add locale to country's `locales` array
2. Add display name to `getLocaleDisplayName()` function
3. Test locale-based functionality

## Benefits of Centralization

✅ **Single Source of Truth**: All geographic data in one place  
✅ **Type Safety**: Strong TypeScript types prevent errors  
✅ **Performance**: Optimized lookup functions  
✅ **Maintainability**: Easy to update and extend  
✅ **Consistency**: Standardized data format across app  
✅ **Backward Compatibility**: Existing code continues to work  
✅ **Documentation**: Well-documented with examples  
✅ **Validation**: Built-in validation functions

## Related Files

- `components/checkout-payment.tsx` - Uses country dropdown
- `components/currency-locale-selector.tsx` - Uses currency/locale data
- `hooks/use-klarna.ts` - May use locale/currency functions
- `lib/utils.ts` - May use currency formatting functions

---

_Last updated: January 2025_
