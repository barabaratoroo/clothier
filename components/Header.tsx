'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { count } = useCart()
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-[0.25em]">CLOTHIA</Link>
        <nav className="flex gap-7 text-xs tracking-widest text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">ITEMS</Link>
          <span>BRAND</span>
          <Link href="/cart" className="hover:text-neutral-900">
            CART{count > 0 ? ` (${count})` : ''}
          </Link>
        </nav>
      </div>
    </header>
  )
}
