import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { MOCK_CART_ITEMS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductActions } from "@/components/product-actions"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = MOCK_CART_ITEMS.find(item => item.id === parseInt(id))
  
  if (!product) {
    return {
      title: "Product Not Found - MicStore",
    }
  }

  return {
    title: `${product.name} - MicStore`,
    description: `Shop ${product.name} at MicStore. ${getProductDescription(product.id)}`,
  }
}

export async function generateStaticParams() {
  return MOCK_CART_ITEMS.map((product) => ({
    id: product.id.toString(),
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = MOCK_CART_ITEMS.find(item => item.id === parseInt(id))

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link
              href="/products"
              className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
            >
              Products
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground font-medium" aria-current="page">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted border-2 border-transparent hover:border-primary cursor-pointer transition-colors">
                    <Image
                      src={product.image}
                      alt={`${product.name} view ${i + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3 bg-primary text-primary-foreground">
                  New Arrival
                </Badge>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < 4 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">(4.0 • 127 reviews)</span>
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.price * 1.2)}
                  </span>
                  <Badge variant="destructive">
                    Save {Math.round(((product.price * 1.2 - product.price) / (product.price * 1.2)) * 100)}%
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {getProductDescription(product.id)}
                </p>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <ProductActions productId={product.id} />
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over $75</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">1 Year Warranty</p>
                    <p className="text-xs text-muted-foreground">Full coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {getProductSpecs(product.id).map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-border last:border-b-0">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">What&apos;s Included</h3>
                  <div className="space-y-3">
                    {getProductIncludes(product.id).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_CART_ITEMS.filter(item => item.id !== product.id).map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-200">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <span className="text-lg font-bold">{formatCurrency(relatedProduct.price)}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


function getProductDescription(productId: number): string {
  const descriptions = {
    1: "Experience premium wireless audio with our state-of-the-art Bluetooth headphones. Featuring active noise cancellation technology, these headphones deliver crystal-clear sound quality with deep bass and crisp highs. The ergonomic design ensures all-day comfort, while the 30-hour battery life keeps your music playing longer. Perfect for commuting, working, or relaxing at home.",
    2: "This high-quality USB-C charging cable is built to last with reinforced connectors and premium materials. Supporting fast charging up to 60W, it's compatible with most modern devices including smartphones, tablets, and laptops. The durable braided design prevents tangling and withstands daily use, making it an essential accessory for your tech collection.",
    3: "Transform your workspace with this ergonomic laptop stand designed to improve posture and productivity. The adjustable height and angle settings allow for a customized viewing experience, reducing neck and eye strain. Made from premium aluminum alloy, it provides excellent heat dissipation while maintaining a sleek, professional appearance that complements any desk setup.",
  }
  return descriptions[productId as keyof typeof descriptions] || "Premium tech accessory designed for modern lifestyles."
}

function getProductSpecs(productId: number) {
  const specs = {
    1: [
      { label: "Driver Size", value: "40mm" },
      { label: "Frequency Response", value: "20Hz - 20kHz" },
      { label: "Battery Life", value: "30 hours" },
      { label: "Charging Time", value: "2 hours" },
      { label: "Weight", value: "250g" },
      { label: "Connectivity", value: "Bluetooth 5.0" }
    ],
    2: [
      { label: "Cable Length", value: "1.2m / 4ft" },
      { label: "Power Delivery", value: "60W Max" },
      { label: "Data Transfer", value: "USB 3.1 Gen 2" },
      { label: "Connector", value: "USB-C to USB-C" },
      { label: "Material", value: "Braided Nylon" },
      { label: "Compatibility", value: "Universal USB-C" }
    ],
    3: [
      { label: "Material", value: "Aluminum Alloy" },
      { label: "Compatibility", value: "10-17 inch laptops" },
      { label: "Height Adjustment", value: "6 levels" },
      { label: "Angle Adjustment", value: "0-45°" },
      { label: "Weight Capacity", value: "10kg / 22lbs" },
      { label: "Dimensions", value: "260 × 220 × 25mm" }
    ]
  }
  return specs[productId as keyof typeof specs] || []
}

function getProductIncludes(productId: number) {
  const includes = {
    1: [
      "Wireless Bluetooth Headphones",
      "USB-C Charging Cable (1.2m)",
      "3.5mm Audio Cable",
      "Carrying Case",
      "Quick Start Guide",
      "1-Year Warranty Card"
    ],
    2: [
      "USB-C to USB-C Cable (1.2m)",
      "Cable Organizer Strap",
      "Protective Pouch",
      "Quick Start Guide",
      "Lifetime Warranty Card"
    ],
    3: [
      "Adjustable Laptop Stand",
      "Assembly Hardware",
      "Anti-Slip Pads (4pcs)",
      "Installation Guide",
      "2-Year Warranty Card"
    ]
  }
  return includes[productId as keyof typeof includes] || []
}