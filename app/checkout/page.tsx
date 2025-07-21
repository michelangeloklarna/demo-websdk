import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CheckoutPayment from "@/components/checkout-payment"

export const metadata: Metadata = {
  title: "Checkout - MicStore",
  description: "Complete your purchase securely with multiple payment options",
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <CheckoutPayment />
        </div>
      </main>
      <Footer />
    </div>
  )
}