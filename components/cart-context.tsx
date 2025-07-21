"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useCart } from "@/hooks/use-cart"
import type { CartItem } from "@/types"

interface CartContextType {
  items: CartItem[]
  addItem: (productId: number, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  totalItems: number
  isEmpty: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const cart = useCart()

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider")
  }
  return context
}