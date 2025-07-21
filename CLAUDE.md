# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demo ecommerce checkout application built with Next.js 15, React 19, and TypeScript. The primary focus is showcasing payment method integrations including Credit/Debit Cards, PayPal, Klarna, and Bank Transfer. The application demonstrates a complete checkout flow with shipping and billing forms.

## Development Commands

- `pnpm dev` - Start development server (http://localhost:3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking
- `pnpm validate` - Run all quality checks (type-check + lint + format)

Note: This project uses pnpm as the package manager. Always use pnpm for dependency management.

## Quality Gates

Before making changes, always run:

1. `pnpm validate` - Ensures type safety, linting, and formatting
2. Check that build passes without errors
3. Verify all components are properly error-bounded

## Development Workflow (4-Phase Process)

### Phase 1: Planning & Design
- Analyze requirements and existing codebase patterns
- Plan component architecture and data flow
- Consider error handling and loading states

### Phase 2: Implementation
- Follow TypeScript strict mode (no `any` types)
- Use existing patterns and utilities
- Implement proper error boundaries

### Phase 3: Validation
- Run `pnpm type-check` - TypeScript validation
- Run `pnpm lint` - Code quality checks
- Run `pnpm format:check` - Code formatting
- Run `pnpm build` - Production build verification
- Test error scenarios and edge cases

### Phase 4: Documentation
- Update inline comments for complex logic
- Document new patterns or utilities

## Architecture

### Project Structure
- **Main Application**: `/demo-websdk/` contains the Next.js application
- **Root Components**: `/components/` contains shared checkout components 
- **Main Entry**: `app/page.tsx` renders the checkout page
- **Primary Component**: `components/checkout-payment.tsx` orchestrates the checkout flow
- **API Routes**: `app/api/klarna-authorize/route.ts` handles payment authorization

### Key Components Architecture

#### Core Files
- `types/index.ts` - All TypeScript interfaces and types
- `lib/constants.ts` - Payment methods, mock data, re-exports from country-data
- `lib/country-data.ts` - Centralized geographic/currency data (27 countries, 15 currencies, 58 locales)
- `lib/utils.ts` - Order calculations and utility functions
- `lib/validation/schemas.ts` - Zod validation schemas

#### Custom Hooks
- `hooks/use-klarna.ts` - Klarna WebSDK integration with error handling
- `hooks/use-checkout-form.ts` - Form state management
- `hooks/use-ux-settings.ts` - UX customization settings
- `hooks/use-toast.ts` - Toast notifications

#### Checkout Sections
- `components/checkout-sections/payment-method-selection.tsx` - Payment method UI
- `components/checkout-sections/shipping-address.tsx` - Address form
- `components/checkout-sections/order-summary.tsx` - Order calculation display
- `components/checkout-sections/ux-settings-panel.tsx` - Demo customization

### UI Components

- Built with **shadcn UI** components (extensive library in `components/ui/`)
- **Tailwind CSS** for styling
- **Radix UI** primitives for accessibility
- **Lucide React** for icons

### Payment Methods

The checkout supports four payment methods defined in `lib/constants.ts:30`:

- Credit/Debit Card (with form fields)
- PayPal
- Klarna (with payment breakdown visualization)
- Bank Transfer

### Key Features

- Responsive design with mobile-first approach
- Form validation with Zod schemas
- Error boundaries for graceful error handling
- Custom hooks for complex state management
- Order summary with mock cart items
- Shipping and billing address forms
- Payment method selection with conditional UI
- Klarna WebSDK integration with proper error handling

## Development Guidelines

### TypeScript Requirements
- **Strict Mode**: No `any` types allowed
- **Explicit Interfaces**: Define interfaces for all data structures
- **Type Imports**: Use `import type` for type-only imports
- **Form Validation**: Use Zod schemas for all validation

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always use semicolons
- **Trailing Commas**: Always include trailing commas

### Import Organization (Required Order)
```typescript
// 1. React/Next.js
import React, { useState } from "react"
import { useRouter } from "next/navigation"

// 2. Third-party libraries
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// 3. Internal components/hooks (absolute imports with @/)
import { Button } from "@/components/ui/button"
import { useKlarna } from "@/hooks/use-klarna"

// 4. Types
import type { PaymentData } from "@/types"

// 5. Relative imports (./path)
```

### File and Component Naming
- **Files**: kebab-case (`checkout-payment.tsx`)
- **Components**: PascalCase (`CheckoutPayment`)
- **Functions**: camelCase (`calculateOrderSummary`)
- **Constants**: UPPER_SNAKE_CASE (`MOCK_CART_ITEMS`)

### Error Handling Requirements
- **Component Boundaries**: Wrap components in ErrorBoundary
- **Async Operations**: Use try-catch blocks
- **User Feedback**: Provide meaningful error messages
- **Fallback States**: Implement graceful degradation
- **Loading States**: Always show loading indicators
- **Input Validation**: Validate all user inputs with Zod

### Component Architecture Guidelines
- **Custom Hooks**: Extract complex logic into hooks
- **Single Responsibility**: Keep components focused
- **Composition**: Use shadcn UI components from `components/ui/`
- **Absolute Imports**: Use `@/` prefix for all internal imports
- **Form Management**: Use react-hook-form with Zod validation

## Klarna Integration

### Environment Variables
Set these in your `.env.local` file:
```
NEXT_PUBLIC_KLARNA_CLIENT_ID=your_klarna_client_id
NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID=your_partner_account_id
```

### Key Integration Points
- **SDK Loading**: `hooks/use-klarna.ts` handles WebSDK initialization
- **Error Handling**: Custom element conflicts and timeout handling
- **Payment Flow**: Integration with checkout form validation
- **Demo Mode**: Automatic fallback when credentials are missing

## Security & Performance
- **Environment Variables**: Never expose sensitive data client-side
- **Input Validation**: Server-side and client-side validation
- **Performance**: React.memo for expensive components
- **Loading States**: Skeleton screens and proper loading indicators
- **Core Web Vitals**: Monitor performance with Next.js analytics

## Testing & Deployment
- **Local Development**: Uses company registry for dependencies
- **Vercel Deployment**: Configured for GitHub integration
- **Build Verification**: Always test production builds
- **Error Monitoring**: Comprehensive error boundaries and logging
