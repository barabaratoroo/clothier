'use client'
import { useState } from 'react'
import { quickCreateBrand } from '@/lib/brand-actions'

type Brand = { id: string; name: string }

export default function BrandSelect({
  brands,
  defaultValue = '',
}: {
  brands: Brand[]
  defaultValue?: string
}) {
  const [list, setList] = useState<Brand[]>(brands)
  const [selected, setSelected] = useState<string>(defaultValue)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setBusy(true); setErr(null)
    const res = await quickCreateBrand(newName)
    setBusy(false)
    if (res.error || !res.brand) { setErr(res.error ?? '追加に失敗しました'); return }
    // 一覧に無ければ追加して、それを選択状態にする
    setList((prev) => prev.some((b) => b.id === res.brand!.id) ? prev : [...prev, res.brand!])
    setSelected(res.brand.id)
    setNewName('')
    setAdding(false)
  }

  return (
    <div>
      {/* フォーム送信される実際の値（hidden）。商品保存時はこの brand_id が使われる */}
      <input type="hidden" name="brand_id" value={selected} />

      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        >
          <option value="">未選択</option>
          {list.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button
          type="button"
          onClick={() => { setAdding((v) => !v); setErr(null) }}
          className="whitespace-nowrap border border-neutral-300 px-3 text-sm hover:border-neutral-900"
        >
          {adding ? '閉じる' : '＋ 新規'}
        </button>
      </div>

      {adding && (
        <div className="mt-2 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            placeholder="新しいブランド名"
            className="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy}
            className="whitespace-nowrap bg-neutral-900 px-4 text-xs tracking-widest text-white disabled:opacity-40"
          >
            {busy ? '追加中…' : '追加'}
          </button>
        </div>
      )}
      {err && <p className="mt-1 text-[11px] text-red-600">{err}</p>}
    </div>
  )
}
