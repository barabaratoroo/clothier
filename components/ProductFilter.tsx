'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

type Option = { id: string; name: string }
type Props = {
  brands: Option[]
  categories: Option[]
  sizes: string[]
}

const GENDERS = [
  { value: 'mens', label: 'メンズ' },
  { value: 'womens', label: 'ウィメンズ' },
  { value: 'unisex', label: 'ユニセックス' },
  { value: 'kids', label: 'キッズ' },
]
const PRICES = [
  { label: '〜¥5,000', min: '', max: '5000' },
  { label: '¥5,000〜¥10,000', min: '5000', max: '10000' },
  { label: '¥10,000〜¥20,000', min: '10000', max: '20000' },
  { label: '¥20,000〜', min: '20000', max: '' },
]

export default function ProductFilter({ brands, categories, sizes }: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [open, setOpen] = useState(false)

  const current = (key: string) => sp.get(key) ?? ''

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value === '' || params.get(key) === value) {
      params.delete(key)            // 同じものを再クリックで解除
    } else {
      params.set(key, value)
    }
    router.push(`/products?${params.toString()}`)
  }

  const setPrice = (min: string, max: string) => {
    const params = new URLSearchParams(sp.toString())
    const isSame = params.get('min') === (min || null) && params.get('max') === (max || null)
    params.delete('min'); params.delete('max')
    if (!isSame) {
      if (min) params.set('min', min)
      if (max) params.set('max', max)
    }
    router.push(`/products?${params.toString()}`)
  }

  const clearAll = () => router.push('/products')
  const hasAny = ['brand', 'category', 'size', 'gender', 'min', 'max'].some((k) => sp.get(k))

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-neutral-200 py-5">
      <p className="text-[11px] tracking-[0.2em] text-neutral-500">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  )

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick}
      className={`border px-3 py-1.5 text-xs transition ${active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'}`}>
      {children}
    </button>
  )

  const body = (
    <>
      <Group title="BRAND">
        {brands.map((b) => <Chip key={b.id} active={current('brand') === b.id} onClick={() => setParam('brand', b.id)}>{b.name}</Chip>)}
      </Group>
      <Group title="CATEGORY">
        {categories.map((c) => <Chip key={c.id} active={current('category') === c.id} onClick={() => setParam('category', c.id)}>{c.name}</Chip>)}
      </Group>
      <Group title="SIZE">
        {sizes.map((s) => <Chip key={s} active={current('size') === s} onClick={() => setParam('size', s)}>{s}</Chip>)}
      </Group>
      <Group title="GENDER">
        {GENDERS.map((g) => <Chip key={g.value} active={current('gender') === g.value} onClick={() => setParam('gender', g.value)}>{g.label}</Chip>)}
      </Group>
      <Group title="PRICE">
        {PRICES.map((p) => {
          const active = current('min') === p.min && current('max') === p.max && (p.min !== '' || p.max !== '')
          return <Chip key={p.label} active={active} onClick={() => setPrice(p.min, p.max)}>{p.label}</Chip>
        })}
      </Group>
      {hasAny && (
        <button onClick={clearAll} className="mt-4 text-[11px] tracking-widest text-neutral-400 underline hover:text-neutral-900">
          すべて解除
        </button>
      )}
    </>
  )

  return (
    <>
      {/* PC：左サイドバー */}
      <div className="hidden md:block">{body}</div>

      {/* スマホ：上部ボタン → 下からシート */}
      <div className="md:hidden">
        <button onClick={() => setOpen(true)} className="w-full border border-neutral-900 py-3 text-xs tracking-[0.2em]">
          絞り込み{hasAny ? ' ●' : ''}
        </button>
        {open && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="text-sm tracking-widest">絞り込み</p>
                <button onClick={() => setOpen(false)} className="text-2xl leading-none">×</button>
              </div>
              <div className="mt-2">{body}</div>
              <button onClick={() => setOpen(false)} className="mt-6 w-full bg-neutral-900 py-3 text-xs tracking-[0.2em] text-white">
                結果を見る
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
