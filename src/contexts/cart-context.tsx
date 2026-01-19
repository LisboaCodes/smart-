'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string | null
  sku: string
  maxStock: number
  variationId?: string
  variationName?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string, variationId?: string) => void
  updateQuantity: (id: string, quantity: number, variationId?: string) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getCartItemKey: (id: string, variationId?: string) => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'smartplus_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [items, isLoaded])

  const getCartItemKey = (id: string, variationId?: string) => {
    return variationId ? `${id}-${variationId}` : id
  }

  const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = newItem.quantity || 1
    const itemKey = getCartItemKey(newItem.id, newItem.variationId)

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => getCartItemKey(item.id, item.variationId) === itemKey
      )

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const updated = [...prev]
        const newQuantity = Math.min(
          updated[existingIndex].quantity + quantity,
          updated[existingIndex].maxStock
        )
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
        }
        return updated
      }

      // Add new item
      return [
        ...prev,
        {
          ...newItem,
          quantity: Math.min(quantity, newItem.maxStock),
        } as CartItem,
      ]
    })
  }

  const removeItem = (id: string, variationId?: string) => {
    const itemKey = getCartItemKey(id, variationId)
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.id, item.variationId) !== itemKey)
    )
  }

  const updateQuantity = (id: string, quantity: number, variationId?: string) => {
    const itemKey = getCartItemKey(id, variationId)

    if (quantity <= 0) {
      removeItem(id, variationId)
      return
    }

    setItems((prev) =>
      prev.map((item) => {
        if (getCartItemKey(item.id, item.variationId) === itemKey) {
          return {
            ...item,
            quantity: Math.min(quantity, item.maxStock),
          }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () => {
    return items.reduce((acc, item) => acc + item.quantity, 0)
  }

  const getSubtotal = () => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getCartItemKey,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
