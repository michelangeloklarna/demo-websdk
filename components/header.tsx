"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Menu, X, Smartphone } from "lucide-react"
import { CurrencyLocaleDisplay } from "@/components/currency-locale-selector"
import { useCurrencyLocale } from "@/components/currency-locale-context"
import { MiniCart } from "@/components/mini-cart"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currency, locale } = useCurrencyLocale()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top promotional bar */}
      <div className="bg-primary text-primary-foreground py-3">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <p className="font-medium">Free shipping on orders over $75</p>
            <nav className="hidden md:flex items-center gap-6" aria-label="Secondary navigation">
              <Link
                href="/support"
                className="hover:text-primary-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 rounded px-1"
              >
                Support
              </Link>
              <Link
                href="/track-order"
                className="hover:text-primary-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 rounded px-1"
              >
                Track Order
              </Link>
              <Link
                href="/returns"
                className="hover:text-primary-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 rounded px-1"
              >
                Returns
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-1"
            aria-label="MicStore - Go to homepage"
          >
            <div className="bg-primary text-primary-foreground p-2.5 rounded-xl">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-foreground">MicStore</span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <CurrencyLocaleDisplay currency={currency} locale={locale} className="hidden md:flex" />
            <Button variant="ghost" size="sm" className="hidden md:flex gap-2 px-4 py-2" asChild>
              <Link href="/account">
                <User className="h-4 w-4" aria-hidden="true" />
                <span>Account</span>
              </Link>
            </Button>

            <MiniCart />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-border py-6"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 py-2.5 bg-transparent"
                asChild
              >
                <Link href="/account">
                  <User className="h-4 w-4" aria-hidden="true" />
                  My Account
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
