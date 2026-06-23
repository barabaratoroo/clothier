import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ImageUploader from '@/components/admin/ImageUploader'
import { updateProduct, addVariant, updateVariantStock, deleteVariant, deleteImage } from './actions'
import BrandSelect from '@/components/admin/BrandSelect'

export const dynamic = 'force-dynamic'
const inputCls = 'mt-1 w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900'

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', id).single()
  if (!product) notFound()
  const { data: brands } = await supabaseAdmin.from('brands').select('id, name').order('name')
  const { data: categories } = await supabaseAdmin.from('categories').select('id, name').order('name')
  const { data: variants } = await supabaseAdmin.from('product_variants').select('*').eq('product_id', id).order('position')
  const { data: images } = await supabaseAdmin.from('product_images').select('*').eq('product_id', id).order('position')

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-[11px] tracking-widest text-neutral-400">← 商品一覧</Link>
      <h1 className="mt-2 text-lg font-light tracking-wide">商品を編集</h1>

      <form action={updateProduct} className="mt-6 space-y-5 border border-neutral-200 bg-white p-6">
        <input type="hidden" name="id" value={product.id} />
        <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">商品名</span>
          <input name="name" defaultValue={product.name} className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">ブランド</span>
            <BrandSelect brands={brands ?? []} defaultValue={product.brand_id ?? ''} /></label>
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">カテゴリ</span>
            <select name="category_id" defaultValue={product.category_id ?? ''} className={inputCls}>
              <option value="">未選択</option>
              {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">価格(円)</span>
            <input name="base_price" type="number" defaultValue={product.base_price} className={inputCls} /></label>
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">セール価格(円)</span>
            <input name="sale_price" type="number" defaultValue={product.sale_price ?? ''} className={inputCls} /></label>
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">性別</span>
            <select name="gender" defaultValue={product.gender} className={inputCls}>
              <option value="unisex">ユニセックス</option><option value="mens">メンズ</option>
              <option value="womens">ウィメンズ</option><option value="kids">キッズ</option>
            </select></label>
        </div>
        <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">商品説明</span>
          <textarea name="description" rows={4} defaultValue={product.description ?? ''} className={inputCls} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={product.is_published} /> 公開する</label>
        <button className="bg-neutral-900 px-6 py-3 text-xs tracking-[0.2em] text-white">保存する</button>
      </form>

      <section className="mt-8 border border-neutral-200 bg-white p-6">
        <h2 className="text-[11px] tracking-[0.2em] text-neutral-500">画像</h2>
        <div className="mt-4"><ImageUploader productId={product.id} /></div>
        {(images ?? []).length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {images!.map((im: any) => (
              <div key={im.id} className="group relative aspect-square overflow-hidden bg-neutral-100">
                <img src={im.url} className="h-full w-full object-cover" alt="" />
                <form action={deleteImage.bind(null, im.id, product.id)} className="absolute right-1 top-1">
                  <button className="bg-white/90 px-2 py-1 text-[10px] text-red-600 opacity-0 group-hover:opacity-100">削除</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 border border-neutral-200 bg-white p-6">
        <h2 className="text-[11px] tracking-[0.2em] text-neutral-500">サイズ・カラー・在庫</h2>
        <div className="mt-4 space-y-2">
          {(variants ?? []).map((v: any) => (
            <div key={v.id} className="flex items-center gap-3 border-b border-neutral-100 pb-2">
              <span className="w-28 text-sm">{v.size ?? '—'}{v.color ? ` / ${v.color}` : ''}</span>
              <form action={updateVariantStock} className="flex items-center gap-2">
                <input type="hidden" name="variant_id" value={v.id} />
                <input type="hidden" name="product_id" value={product.id} />
                <input name="stock" type="number" defaultValue={v.stock} className="w-20 border border-neutral-300 px-2 py-1 text-sm" />
                <button className="border border-neutral-900 px-3 py-1 text-[11px] tracking-widest">在庫更新</button>
              </form>
              <form action={deleteVariant.bind(null, v.id, product.id)}>
                <button className="text-[11px] text-red-400 hover:text-red-600">削除</button>
              </form>
            </div>
          ))}
        </div>

        <form action={addVariant} className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-200 pt-4">
          <input type="hidden" name="product_id" value={product.id} />
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">サイズ</span>
            <input name="size" placeholder="M / 27" className="mt-1 w-24 border border-neutral-300 px-2 py-1 text-sm" /></label>
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">カラー</span>
            <input name="color" placeholder="黒" className="mt-1 w-24 border border-neutral-300 px-2 py-1 text-sm" /></label>
          <label className="block"><span className="text-[11px] tracking-widest text-neutral-500">在庫</span>
            <input name="stock" type="number" defaultValue={0} className="mt-1 w-20 border border-neutral-300 px-2 py-1 text-sm" /></label>
          <button className="bg-neutral-900 px-4 py-2 text-[11px] tracking-widest text-white">+ 追加</button>
        </form>
      </section>
    </div>
  )
}
