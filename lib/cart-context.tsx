'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = {
  variantId: string
  productId: string
  slug: string
  name: string
  brandName: string
  size: string | null
  color: string | null
  unitPrice: number
  imageUrl: string | null
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  updateQty: (variantId: string, qty: number) => void
  removeItem: (variantId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'cloth_cart_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, loaded])

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.variantId === item.variantId)
      if (i >= 0) {
        const copy = [...prev]
        copy[i] = { ...copy[i], quantity: copy[i].quantity + qty }
        return copy
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }
  const updateQty = (variantId: string, qty: number) =>
    setItems((prev) =>
      prev.map((x) => (x.variantId === variantId ? { ...x, quantity: Math.max(1, qty) } : x))
    )
  const removeItem = (variantId: string) =>
    setItems((prev) => prev.filter((x) => x.variantId !== variantId))
  const clear = () => setItems([])

  const count = items.reduce((s, x) => s + x.quantity, 0)
  const subtotal = items.reduce((s, x) => s + x.unitPrice * x.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
