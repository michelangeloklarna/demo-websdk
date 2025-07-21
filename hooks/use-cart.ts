"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "@/types"
import { MOCK_CART_ITEMS } from "@/lib/constants"

const CART_STORAGE_KEY = "micstore-cart"

interface UseCartReturn {
  items: CartItem[]
  addItem: (productId: number, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  totalItems: number
  isEmpty: boolean
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.warn("Failed to parse cart from localStorage:", error)
        setItems([])
      }
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  const addItem = (productId: number, quantity: number = 1) => {
    const product = MOCK_CART_ITEMS.find(p => p.id === productId)
    if (!product) {
      console.warn(`Product with id ${productId} not found`)
      return
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === productId)
      
      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item to cart
        return [...currentItems, { ...product, quantity }]
      }
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const removeItem = (productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const isEmpty = items.length === 0

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    isEmpty,
  }
}