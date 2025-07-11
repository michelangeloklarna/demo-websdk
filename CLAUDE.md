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

## Quality Gates
Before making changes, always run:
1. `pnpm validate` - Ensures type safety, linting, and formatting
2. Check that build passes without errors
3. Verify all components are properly error-bounded

## Architecture

### Core Structure
- **Next.js App Router**: Uses the `app/` directory structure
- **Main Entry Point**: `app/page.tsx` renders the checkout page
- **Primary Component**: `components/checkout-payment.tsx` contains the full checkout flow
- **Type Definitions**: `types/index.ts` defines interfaces for CartItem, PaymentData, OrderSummary, etc.
- **Constants**: `lib/constants.ts` contains mock cart items and payment method constants
- **Utilities**: `lib/utils.ts` includes order calculation and formatting functions

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

### Code Quality Standards
- Always run `pnpm validate` before committing
- Use TypeScript strictly - no `any` types
- Implement proper error boundaries
- Use Zod schemas for all form validation
- Follow ESLint and Prettier configurations

### Component Architecture
- Use custom hooks for complex logic (e.g., `useKlarna`)
- Keep components focused and composable
- Always use shadcn UI components from `components/ui/`
- Implement proper loading and error states
- Use absolute imports with `@/` prefix

### Error Handling
- Wrap components in ErrorBoundary where appropriate
- Implement proper async error handling
- Provide meaningful error messages to users
- Log errors with context for debugging

### Payment Integration Focus
All features should align with demonstrating payment method integrations in an ecommerce context. This is a demo application specifically for showcasing payment flows.

### Security and Performance
- Never expose sensitive data in client-side code
- Use proper environment variables
- Implement CSP headers for security
- Optimize for performance with proper loading states

### Deployment
The project is configured for Vercel deployment with GitHub integration for continuous deployment. Local development uses company registry, while Vercel uses public npm registry via `.vercelignore`.

## Klarna SDK Configuration

### Environment Variables
Set these in your `.env.local` file:
```
NEXT_PUBLIC_KLARNA_CLIENT_ID=your_klarna_client_id
NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID=your_partner_account_id
```

### Getting Klarna Credentials
1. **Sign up for Klarna Developer Account**: Visit [Klarna Developer Portal](https://docs.klarna.com/)
2. **Create a Playground Application**: Follow the setup guide for web SDK
3. **Get Your Credentials**: Copy your Client ID and Partner Account ID
4. **Update Environment Variables**: Add them to your `.env.local` file

### Demo Mode
If valid credentials are not provided, the application will automatically switch to demo mode with mock data. This allows you to test the integration flow without real Klarna credentials.

### Debug Console
The application includes a comprehensive debug console that shows:
- SDK loading progress
- Configuration details
- Error messages with suggested fixes
- Demo mode notifications
- Real-time interaction logs