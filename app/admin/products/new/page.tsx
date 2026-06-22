import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createProduct } from '../actions'

export const dynamic = 'force-dynamic'

const inputCls = 'w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900'
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="text-[11px] tracking-widest text-neutral-500">{label}</span><div className="mt-1">{children}</div></label>)
}

export default async function NewProduct() {
  const { data: brands } = await supabaseAdmin.from('brands').select('id, name').order('name')
  const { data: categories } = await supabaseAdmin.from('categories').select('id, name').order('name')

  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-[11px] tracking-widest text-neutral-400">← 商品一覧</Link>
      <h1 className="mt-2 text-lg font-light tracking-wide">商品を追加</h1>
      <p className="mt-1 text-[11px] text-neutral-400">基本情報を入力 →「作成して編集へ」で画像・サイズ在庫を登録します。</p>

      <form action={createProduct} className="mt-6 space-y-5 border border-neutral-200 bg-white p-6">
        <Field label="商品名 *"><input name="name" required className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ブランド">
            <select name="brand_id" className={inputCls}>
              <option value="">未選択</option>
              {(brands ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="カテゴリ">
            <select name="category_id" className={inputCls}>
              <option value="">未選択</option>
              {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="価格(円) *"><input name="base_price" type="number" required className={inputCls} /></Field>
          <Field label="セール価格(円)"><input name="sale_price" type="number" className={inputCls} /></Field>
          <Field label="性別">
            <select name="gender" className={inputCls}>
              <option value="unisex">ユニセックス</option>
              <option value="mens">メンズ</option>
              <option value="womens">ウィメンズ</option>
              <option value="kids">キッズ</option>
            </select>
          </Field>
        </div>
        <Field label="商品説明"><textarea name="description" rows={4} className={inputCls} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" /> すぐに公開する</label>
        <button className="w-full bg-neutral-900 py-3 text-xs tracking-[0.2em] text-white">作成して編集へ</button>
      </form>
    </div>
  )
}
