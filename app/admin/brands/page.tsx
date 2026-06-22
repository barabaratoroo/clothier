import { supabaseAdmin } from '@/lib/supabase/admin'
import { createBrand, deleteBrand } from './actions'

export const dynamic = 'force-dynamic'

export default async function BrandsAdmin() {
  const { data: brands } = await supabaseAdmin.from('brands').select('id, name, description').order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-light tracking-wide">ブランド管理</h1>

      <form action={createBrand} className="mt-6 flex flex-wrap items-end gap-3 border border-neutral-200 bg-white p-6">
        <label className="block flex-1"><span className="text-[11px] tracking-widest text-neutral-500">ブランド名 *</span>
          <input name="name" required className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" /></label>
        <label className="block flex-1"><span className="text-[11px] tracking-widest text-neutral-500">紹介文</span>
          <input name="description" className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" /></label>
        <button className="bg-neutral-900 px-5 py-2 text-xs tracking-widest text-white">+ 追加</button>
      </form>

      <div className="mt-6 divide-y divide-neutral-100 border border-neutral-200 bg-white">
        {(brands ?? []).map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm">{b.name}</p>
              {b.description && <p className="text-[11px] text-neutral-400">{b.description}</p>}
            </div>
            <form action={deleteBrand.bind(null, b.id)}>
              <button className="text-[11px] text-red-400 hover:text-red-600">削除</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
