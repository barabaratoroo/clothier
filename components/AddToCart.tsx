'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

type Variant = { id: string; size: string | null; color: string | null; stock: number }
type Props = {
  productId: string; slug: string; name: string; brandName: string
  unitPrice: number; imageUrl: string | null; variants: Variant[]
}

export default function AddToCart(props: Props) {
  const { addItem } = useCart()
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const selectedVariant = props.variants.find((v) => v.id === selected)

  const handleAdd = () => {
    if (!selectedVariant) return
    addItem({
      variantId: selectedVariant.id, productId: props.productId, slug: props.slug,
      name: props.name, brandName: props.brandName, size: selectedVariant.size,
      color: selectedVariant.color, unitPrice: props.unitPrice, imageUrl: props.imageUrl,
    })
    setDone(true)
    setTimeout(() => setDone(false), 2500)
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] text-neutral-500">SIZE</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {props.variants.map((v) => {
          const soldOut = (v.stock ?? 0) <= 0
          const low = !soldOut && v.stock <= 3
          const isSel = selected === v.id
          return (
            <button
              key={v.id}
              disabled={soldOut}
              onClick={() => setSelected(v.id)}
              className={`min-w-14 border px-4 py-2 text-center text-sm transition ${
                soldOut
                  ? 'cursor-not-allowed border-neutral-200 text-neutral-300 line-through'
                  : isSel
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 text-neutral-900 hover:border-neutral-900'
              }`}
            >
              <div>{v.size}{v.color ? ` / ${v.color}` : ''}</div>
              <div className="mt-0.5 text-[10px] tracking-wide">
                {soldOut ? 'SOLD OUT' : low ? `残り${v.stock}` : '在庫あり'}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleAdd}
        disabled={!selectedVariant}
        className="mt-8 w-full bg-neutral-900 py-4 text-xs tracking-[0.2em] text-white transition disabled:opacity-40"
      >
        {done ? '✓ カートに追加しました' : selectedVariant ? 'ADD TO CART' : 'サイズを選択してください'}
      </button>

      {done && (
        <button
          onClick={() => router.push('/cart')}
          className="mt-3 w-full border border-neutral-900 py-4 text-xs tracking-[0.2em]"
        >
          カートを見る
        </button>
      )}
    </div>
  )
}
