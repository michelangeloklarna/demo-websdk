import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { MOCK_CART_ITEMS } from "@/lib/constants"
import { ProductListingCard } from "@/components/product-listing-card"
import { ShoppingCart, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Products - MicStore",
  description: "Shop premium electronics and tech accessories with secure checkout",
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Premium Electronics & Accessories
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our curated selection of cutting-edge tech products designed to enhance your
              digital lifestyle
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_CART_ITEMS.map(product => (
              <ProductListingCard key={product.id} product={product} />
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fast Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Express checkout with multiple payment options including Klarna, PayPal, and cards
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">
                Carefully curated products from trusted brands with excellent customer reviews
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 text-primary p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Free shipping on orders over $75 with fast delivery to your doorstep
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
