import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deleteProduct } from './actions'

export const dynamic = 'force-dynamic'

export default async function ProductsAdmin() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, base_price, sale_price, is_published, brands(name), product_images(url, position), product_variants(stock)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-light tracking-wide">商品管理</h1>
        <Link href="/admin/products/new" className="bg-neutral-900 px-4 py-2 text-xs tracking-widest text-white">+ 商品を追加</Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-[11px] tracking-widest text-neutral-400">
            <tr>
              <th className="p-3">画像</th><th className="p-3">商品名</th><th className="p-3">ブランド</th>
              <th className="p-3">価格</th><th className="p-3">在庫</th><th className="p-3">公開</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p: any) => {
              const img = [...(p.product_images ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url
              const stock = (p.product_variants ?? []).reduce((s: number, v: any) => s + (v.stock ?? 0), 0)
              const brand = Array.isArray(p.brands) ? p.brands[0] : p.brands
              return (
                <tr key={p.id} className="border-b border-neutral-100">
                  <td className="p-3">
                    <div className="h-12 w-12 overflow-hidden bg-neutral-100">
                      {img ? <img src={img} className="h-full w-full object-cover" alt="" />
                        : <div className="flex h-full items-center justify-center text-[8px] text-neutral-300">NO IMG</div>}
                    </div>
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-neutral-500">{brand?.name ?? '—'}</td>
                  <td className="p-3">¥{(p.sale_price ?? p.base_price).toLocaleString()}</td>
                  <td className={`p-3 ${stock <= 3 ? 'text-red-600' : ''}`}>{stock}</td>
                  <td className="p-3">{p.is_published ? '公開' : <span className="text-neutral-400">下書き</span>}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-[11px] tracking-widest text-neutral-500 hover:text-neutral-900">編集</Link>
                    <form action={deleteProduct.bind(null, p.id)} className="ml-3 inline">
                      <button className="text-[11px] tracking-widest text-red-400 hover:text-red-600">削除</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(products ?? []).length === 0 && <p className="p-6 text-sm text-neutral-400">商品がありません。「+ 商品を追加」から登録してください。</p>}
      </div>
    </div>
  )
}
