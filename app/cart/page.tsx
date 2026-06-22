'use client'
import Link from 'next/link'
import { useState } from 'react'
import Header from '@/components/Header'
import { useCart } from '@/lib/cart-context'

const SHIPPING_FEE = 800
const FREE_SHIPPING = 15000

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const shipping = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  const handleCheckout = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setErr(data.error ?? '決済ページを開けませんでした')
        setLoading(false)
      }
    } catch {
      setErr('通信エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-xl font-light tracking-wide">CART</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-neutral-500">カートは空です。</p>
            <Link href="/" className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs tracking-[0.2em]">
              買い物を続ける
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-12 md:grid-cols-[1fr_320px]">
            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
              {items.map((it) => (
                <div key={it.variantId} className="flex gap-4 py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-neutral-100">
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt={it.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] tracking-widest text-neutral-300">NO IMAGE</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400">{it.brandName}</p>
                    <Link href={`/products/${it.slug}`} className="text-sm hover:underline">{it.name}</Link>
                    <p className="mt-1 text-[11px] text-neutral-500">{it.size}{it.color ? ` / ${it.color}` : ''}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-neutral-300">
                        <button onClick={() => updateQty(it.variantId, it.quantity - 1)} className="px-3 py-1 text-sm">−</button>
                        <span className="min-w-8 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => updateQty(it.variantId, it.quantity + 1)} className="px-3 py-1 text-sm">＋</button>
                      </div>
                      <p className="text-sm">¥{(it.unitPrice * it.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(it.variantId)} className="self-start text-[11px] text-neutral-400 hover:text-neutral-900">削除</button>
                </div>
              ))}
            </div>

            <div className="h-fit border border-neutral-200 p-6">
              <p className="text-[11px] tracking-[0.2em] text-neutral-500">ORDER SUMMARY</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">小計</span><span>¥{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">送料</span><span>{shipping === 0 ? '無料' : `¥${shipping.toLocaleString()}`}</span></div>
                {items.length > 0 && subtotal < FREE_SHIPPING && (
                  <p className="text-[11px] text-neutral-400">あと¥{(FREE_SHIPPING - subtotal).toLocaleString()}で送料無料</p>
                )}
              </div>
              <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base">
                <span>合計</span><span>¥{total.toLocaleString()}</span>
              </div>
              {err && <p className="mt-3 text-[11px] text-red-600">{err}</p>}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 w-full bg-neutral-900 py-4 text-xs tracking-[0.2em] text-white transition disabled:opacity-40"
              >
                {loading ? '処理中…' : 'CHECKOUT'}
              </button>
              <p className="mt-3 text-center text-[10px] text-neutral-400">
                ※送料はこのあとStripe画面では加算されません（テスト用に簡略化）
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
