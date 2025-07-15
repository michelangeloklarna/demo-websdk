import Link from "next/link"
import {
  Smartphone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground" role="contentinfo">
      {/* Newsletter Section */}
      <section className="border-b border-border" aria-labelledby="newsletter-heading">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 id="newsletter-heading" className="text-xl font-semibold mb-3">
                Stay Updated
              </h2>
              <p className="text-muted-foreground max-w-md">
                Get the latest deals and tech news delivered to your inbox
              </p>
            </div>
            <form className="flex gap-3 w-full md:w-auto" aria-label="Newsletter signup">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground md:w-72"
                aria-label="Email address"
                required
              />
              <Button type="submit" className="px-6">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link
              href="/"
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-1"
              aria-label="MicStore - Go to homepage"
            >
              <div className="bg-primary text-primary-foreground p-2.5 rounded-xl">
                <Smartphone className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold">MicStore</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Your trusted destination for premium electronics, cutting-edge gadgets, and tech
              accessories.
            </p>
            <div className="flex gap-4" role="list" aria-label="Social media links">
              <Link
                href="https://facebook.com/micstore"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://twitter.com/micstore"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://instagram.com/micstore"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://youtube.com/micstore"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Shop Categories */}
          <nav className="space-y-6" aria-labelledby="shop-heading">
            <h3 id="shop-heading" className="font-semibold text-lg">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/smartphones"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Smartphones
                </Link>
              </li>
              <li>
                <Link
                  href="/laptops"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Laptops & Computers
                </Link>
              </li>
              <li>
                <Link
                  href="/audio"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Audio & Headphones
                </Link>
              </li>
              <li>
                <Link
                  href="/wearables"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Smart Watches
                </Link>
              </li>
              <li>
                <Link
                  href="/gaming"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Gaming
                </Link>
              </li>
              <li>
                <Link
                  href="/accessories"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Sale Items
                </Link>
              </li>
            </ul>
          </nav>

          {/* Customer Service */}
          <nav className="space-y-6" aria-labelledby="service-heading">
            <h3 id="service-heading" className="font-semibold text-lg">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/warranty"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Warranty
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Get in Touch</h3>
            <address className="space-y-4 not-italic">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <a
                  href="tel:+18006427867"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  1-800-MIC-STORE
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <a
                  href="mailto:support@micstore.com"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                >
                  support@micstore.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground">
                  123 Mic Avenue
                  <br />
                  San Francisco, CA 94105
                </span>
              </div>
            </address>
            <div className="space-y-2">
              <p className="text-sm font-medium">Customer Service Hours:</p>
              <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-8PM PST</p>
              <p className="text-sm text-muted-foreground">Sat-Sun: 10AM-6PM PST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <nav className="flex flex-wrap gap-6 text-sm" aria-label="Legal links">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
              >
                Accessibility
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 MicStore. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
