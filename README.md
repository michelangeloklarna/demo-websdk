# MicStore Checkout Demo

This project is a demo ecommerce checkout application focused on showcasing payment method integrations. It is built with Next.js, TypeScript, Tailwind CSS, and shadcn UI components. The demo is designed to run locally and is also ready for deployment on Vercel with GitHub integration.

## Features

- Modern checkout experience for an online store
- Multiple payment methods: **Credit/Debit Card, PayPal, Klarna, Bank Transfer**
- Responsive UI built with [shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/)
- Accessible and production-grade component structure
- Ready for Vercel deployment

## UX Settings & Customization

The checkout experience includes configurable UX settings that allow you to customize the payment flow behavior:

### Staggered Payment Methods Loading

The **"Staggered payment methods load"** toggle allows you to compare two different loading experiences:

#### When **Enabled** (Default - Enhanced UX):
- Payment methods appear with a smooth, staggered animation (200ms initial delay + 100ms per method)
- Klarna loading states feature:
  - **Skeleton Loading Cards** that mimic the structure of payment method options
  - **Professional shadcn/ui Skeleton** components with proper animations
  - **Realistic Preview** showing radio buttons, icons, and text placeholders
- Smooth fade-in animations when Klarna components load
- Enhanced visual feedback throughout the loading process

#### When **Disabled** (Original Behavior):
- Payment methods appear immediately without delays
- Simple skeleton loading states (no fancy animations)
- Standard loading behavior matching the original implementation
- No container-level transitions or staggered effects

### Static Icon and Header

The **"Static Icon and Header"** toggle allows you to compare SDK-based vs static Klarna rendering:

#### When **Enabled**:
- Uses a static Klarna logo image from Klarna's CDN for the icon
- Displays static text "Klarna" for the header
- **Subheaders still use SDK components** for localized content
- Icon and header render immediately without waiting for SDK
- Mixed approach: static visuals + dynamic promotional content

#### When **Disabled** (Default - Full SDK Integration):
- Uses dynamic Klarna SDK components for icon, header, and subheaders
- Displays localized content based on selected region/currency
- Shows SDK-provided promotional text and styling
- Includes loading states while SDK initializes
- Fully integrated with Klarna's presentation layer

### Other UX Settings:
- **Payment Method Order**: Drag and drop to reorder payment methods
- **Default Payment Method**: Set which payment method is pre-selected
- **Display Options**: Toggle sub-headers for payment methods

All settings are persisted in localStorage and will be remembered across sessions.

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

---

## Deployment on Vercel

To launch this project on Vercel:

1. **Push your code to GitHub**
   - Make sure your latest changes are committed and pushed to your GitHub repository.

2. **Connect your repository to Vercel**
   - Go to [Vercel](https://vercel.com/) and sign in or create an account.
   - Click **"New Project"** and import your GitHub repository.

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to your project settings → **Environment Variables**.
   - Add the following variables (copy from your local `.env.local`):
     - `NEXT_PUBLIC_KLARNA_CLIENT_ID`
     - `NEXT_PUBLIC_KLARNA_PARTNER_ACCOUNT_ID`
     - `KLARNA_API_TOKEN`
   - Set these for the **Production** environment (and **Preview** if you want to test deployments).

4. **Build Settings**
   - Vercel will auto-detect Next.js and set the build command to `pnpm build` and the output directory to `.next`.
   - No custom configuration is needed unless you have special requirements.

5. **Automatic Deployments**
   - Every push to your GitHub repository will trigger a new deployment on Vercel.
   - You can view deployment status and logs in the Vercel dashboard.

6. **Access Your App**
   - Once deployed, Vercel will provide a live URL for your app (e.g., `https://your-project-name.vercel.app`).

**Note:**
- For company/private dependencies, ensure they are available via the public npm registry or adjust your `.vercelignore` as needed.
- Review the [Vercel documentation](https://vercel.com/docs) for advanced configuration.

---

## License

This project is for demo purposes only.
