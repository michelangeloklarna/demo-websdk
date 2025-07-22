"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCartContext } from "@/components/cart-context"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import type { CartItem } from "@/types"

interface ProductListingCardProps {
  product: CartItem
}

export function ProductListingCard({ product }: ProductListingCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCartContext()
  const { toast } = useToast()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    setIsAddingToCart(true)

    // Add item to cart
    addItem(product.id, 1)

    // Show success toast
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsAddingToCart(false)
    }, 500)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">New</Badge>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-2">(4.0)</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(product.price * 1.2)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{getProductDescription(product.id)}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button className="flex-1" asChild>
          <Link href={`/checkout?product=${product.id}`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now
          </Link>
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Added
            </>
          ) : (
            "Add to Cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function getProductDescription(productId: number): string {
  const descriptions = {
    1: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    2: "Fast-charging USB-C cable with reinforced connectors for durability and reliability.",
    3: "Ergonomic laptop stand with adjustable height and angle for improved posture.",
  }
  return descriptions[productId as keyof typeof descriptions] || "Premium tech accessory"
}
