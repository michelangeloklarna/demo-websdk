import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { CurrencyLocaleProvider } from "@/components/currency-locale-context"
import { CartProvider } from "@/components/cart-context"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MicStore - Premium Electronics & Accessories",
  description: "Shop the latest electronics, gadgets, and tech accessories with secure checkout",
  keywords: ["electronics", "gadgets", "tech", "accessories", "online store"],
  authors: [{ name: "MicStore" }],
  generator: "v0.dev",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch for Klarna CDN */}
        <link rel="dns-prefetch" href="//js.klarna.com" />
        {/* Preload Klarna SDK for faster loading */}
        <link
          rel="preload"
          href="https://js.klarna.com/web-sdk/v2/klarna.mjs"
          as="script"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <CurrencyLocaleProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </CurrencyLocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
