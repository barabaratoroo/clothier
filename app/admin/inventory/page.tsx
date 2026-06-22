import { supabaseAdmin } from '@/lib/supabase/admin'
import { setStock } from './actions'

export const dynamic = 'force-dynamic'

export default async function Inventory() {
  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('id, size, color, stock, products(name)')
    .order('stock', { ascending: true })

  return (
    <div>
      <h1 className="text-lg font-light tracking-wide">在庫管理</h1>
      <p className="mt-1 text-[11px] text-neutral-400">在庫が少ない順。残り3以下は赤字。</p>
      <div className="mt-6 overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-[11px] tracking-widest text-neutral-400">
            <tr><th className="p-3">商品</th><th className="p-3">サイズ/カラー</th><th className="p-3">在庫</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {(variants ?? []).map((v: any) => {
              const name = Array.isArray(v.products) ? v.products[0]?.name : v.products?.name
              const low = (v.stock ?? 0) <= 3
              return (
                <tr key={v.id} className="border-b border-neutral-100">
                  <td className="p-3">{name ?? '—'}</td>
                  <td className="p-3 text-neutral-500">{v.size ?? '—'}{v.color ? ` / ${v.color}` : ''}</td>
                  <td className={`p-3 ${low ? 'text-red-600' : ''}`}>{v.stock}{low ? ' ⚠️' : ''}</td>
                  <td className="p-3">
                    <form action={setStock} className="flex items-center gap-2">
                      <input type="hidden" name="variant_id" value={v.id} />
                      <input name="stock" type="number" defaultValue={v.stock} className="w-20 border border-neutral-300 px-2 py-1 text-sm" />
                      <button className="border border-neutral-900 px-3 py-1 text-[11px] tracking-widest">更新</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
