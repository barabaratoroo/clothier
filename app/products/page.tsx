import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ProductFilter from '@/components/ProductFilter'
import SortSelect from '@/components/SortSelect'

export const dynamic = 'force-dynamic'

const SELECT = `id, name, slug, base_price, sale_price, gender, brand_id, category_id, brands(name), product_images(url, position), product_variants(size)`

export default async function ProductsPage({
  searchParams,
}: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const supabase = await createClient()

  // 絞り込み用の選択肢
  const { data: brands } = await supabase.from('brands').select('id, name').eq('is_active', true).order('name')
  const { data: categories } = await supabase.from('categories').select('id, name').order('position')
  const { data: sizeRows } = await supabase.from('product_variants').select('size')
  const sizes = Array.from(new Set((sizeRows ?? []).map((r: any) => r.size).filter(Boolean))).sort()

  // 商品取得（条件を順に適用）
  let q = supabase.from('products').select(SELECT).eq('is_published', true)
  if (sp.brand) q = q.eq('brand_id', sp.brand)
  if (sp.category) q = q.eq('category_id', sp.category)
  if (sp.gender) q = q.eq('gender', sp.gender)
  if (sp.min) q = q.gte('base_price', Number(sp.min))
  if (sp.max) q = q.lte('base_price', Number(sp.max))

  if (sp.sort === 'price_asc') q = q.order('base_price', { ascending: true })
  else if (sp.sort === 'price_desc') q = q.order('base_price', { ascending: false })
  else q = q.order('created_at', { ascending: false })

  let { data: products } = await q

  // サイズ絞り込みは取得後に間引く（バリアントにそのサイズがある商品だけ残す）
  if (sp.size) {
    products = (products ?? []).filter((p: any) =>
      (p.product_variants ?? []).some((v: any) => v.size === sp.size)
    )
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-light tracking-wide">ALL ITEMS</h1>
          <SortSelect />
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
          <aside>
            <ProductFilter
              brands={brands ?? []}
              categories={categories ?? []}
              sizes={sizes as string[]}
            />
          </aside>

          <div>
            <p className="mb-4 text-[11px] tracking-widest text-neutral-400">{(products ?? []).length} 件</p>
            {(products ?? []).length === 0 ? (
              <p className="py-20 text-center text-sm text-neutral-400">該当する商品がありません。</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                {(products ?? []).map((p: any) => {
                  const brand = Array.isArray(p.brands) ? p.brands[0] : p.brands
                  const img = [...(p.product_images ?? [])].sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))[0]?.url
                  const sizesA = Array.from(new Set((p.product_variants ?? []).map((v: any) => v.size).filter(Boolean)))
                  const onSale = p.sale_price != null
                  return (
                    <Link key={p.id} href={`/products/${p.slug}`} className="group block">
                      <div className="aspect-square overflow-hidden bg-neutral-100">
                        {img ? <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          : <div className="flex h-full items-center justify-center text-xs tracking-widest text-neutral-300">NO IMAGE</div>}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400">{brand?.name ?? ''}</p>
                        <h3 className="text-sm leading-snug">{p.name}</h3>
                        <p className="text-sm">
                          {onSale ? (<><span className="mr-2 text-neutral-400 line-through">¥{p.base_price.toLocaleString()}</span><span className="text-red-600">¥{p.sale_price.toLocaleString()}</span></>)
                            : (<span>¥{p.base_price.toLocaleString()}</span>)}
                        </p>
                        {sizesA.length > 0 && <p className="text-[11px] tracking-wide text-neutral-400">{sizesA.join('  /  ')}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
