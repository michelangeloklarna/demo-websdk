# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demo ecommerce checkout application built with Next.js 15, React 19, and TypeScript. The primary focus is showcasing payment method integrations including Credit/Debit Cards, PayPal, Klarna, and Bank Transfer. The application demonstrates a complete checkout flow with shipping and billing forms.

## Development Commands

- `pnpm dev` - Start development server (http://localhost:3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linter

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
- Form validation and accessibility features
- Order summary with mock cart items
- Shipping and billing address forms
- Payment method selection with conditional UI

## Development Guidelines

### UI Components
Always use shadcn UI components from `components/ui/` for consistency. The project follows shadcn's design system and component patterns.

### Payment Integration Focus
All features should align with demonstrating payment method integrations in an ecommerce context. This is a demo application specifically for showcasing payment flows.

### Deployment
The project is configured for Vercel deployment with GitHub integration for continuous deployment.