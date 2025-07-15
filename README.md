# MicStore Checkout Demo

This project is a demo ecommerce checkout application focused on showcasing payment method integrations. It is built with Next.js, TypeScript, Tailwind CSS, and shadcn UI components. The demo is designed to run locally and is also ready for deployment on Vercel with GitHub integration.

## Features

- Modern checkout experience for an online store
- Multiple payment methods: **Credit/Debit Card, PayPal, Klarna, Bank Transfer**
- Responsive UI built with [shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/)
- Accessible and production-grade component structure
- Ready for Vercel deployment

## Tech Stack

- [Next.js](https://nextjs.org/) 15
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn UI](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) (used for dependency management)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-github-repo-url>
   cd demo-websdk
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   ```

### Running Locally

Start the development server:

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Available Scripts

- `pnpm dev` — Start the development server
- `pnpm build` — Build for production
- `pnpm start` — Start the production server
- `pnpm lint` — Run linter

## Project Structure

- `app/` — Next.js app directory (main entry: `page.tsx`)
- `components/` — UI and layout components (shadcn UI based)
- `lib/` — Utility functions and constants
- `styles/` — Global styles (Tailwind CSS)

## Klarna Integration

The Klarna integration is implemented using the Klarna Payments API. The frontend collects the necessary payment information and sends it to a Next.js API route (`app/api/klarna-authorize/route.ts`) for processing. The API route then makes a request to the Klarna API to authorize the payment.

To use the Klarna integration, you will need to provide your Klarna API credentials in the `.env.local` file. You can find your API credentials in the Klarna Merchant Portal.

```
NEXT_PUBLIC_KLARNA_CLIENT_ID=<your-client-id>
NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID=<your-partner-account-id>
KLARNA_API_TOKEN=<your-api-token>
```

## Deployment

This project is ready for deployment on [Vercel](https://vercel.com/). Push your changes to GitHub and connect your repository to Vercel for automatic deployments.

## License

This project is for demo purposes only.
