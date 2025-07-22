"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Share2, Minus, Plus, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCartContext } from "@/components/cart-context"
import Link from "next/link"

interface ProductActionsProps {
  productId: number
}

export function ProductActions({ productId }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCartContext()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsAddingToCart(true)

    // Add item to cart
    addItem(productId, quantity)

    // Show success toast
    toast({
      title: "Added to cart",
      description: `${quantity} item${quantity > 1 ? "s" : ""} added to your cart`,
    })

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsAddingToCart(false)
    }, 500)
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
          <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">In Stock</span>
      </div>

      <div className="flex gap-4">
        <Button size="lg" className="flex-1" asChild>
          <Link href={`/checkout?product=${productId}&quantity=${quantity}`}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Now
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Added
            </>
          ) : (
            "Add to Cart"
          )}
        </Button>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" size="sm">
          <Heart className="h-4 w-4 mr-2" />
          Add to Wishlist
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </>
  )
}
