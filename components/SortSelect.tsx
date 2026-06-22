'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SortSelect() {
  const router = useRouter()
  const sp = useSearchParams()
  const onChange = (value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value === 'new') params.delete('sort')
    else params.set('sort', value)
    router.push(`/products?${params.toString()}`)
  }
  return (
    <select defaultValue={sp.get('sort') ?? 'new'} onChange={(e) => onChange(e.target.value)}
      className="border border-neutral-300 px-3 py-1.5 text-xs outline-none">
      <option value="new">新着順</option>
      <option value="price_asc">価格が安い順</option>
      <option value="price_desc">価格が高い順</option>
    </select>
  )
}
