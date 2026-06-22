import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

function ProductCard({ p }: { p: any }) {
  const brand = Array.isArray(p.brands) ? p.brands[0] : p.brands
  const img = [...(p.product_images ?? [])].sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))[0]?.url
  const sizes = Array.from(new Set((p.product_variants ?? []).map((v: any) => v.size).filter(Boolean)))
  const onSale = p.sale_price != null
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="aspect-square overflow-hidden bg-neutral-100">
        {img ? (
          <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs tracking-widest text-neutral-300">NO IMAGE</div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-neutral-400">{brand?.name ?? ''}</p>
        <h3 className="text-sm leading-snug">{p.name}</h3>
        <p className="text-sm">
          {onSale ? (
            <><span className="mr-2 text-neutral-400 line-through">¥{p.base_price.toLocaleString()}</span><span className="text-red-600">¥{p.sale_price.toLocaleString()}</span></>
          ) : (<span>¥{p.base_price.toLocaleString()}</span>)}
        </p>
        {sizes.length > 0 && <p className="text-[11px] tracking-wide text-neutral-400">{sizes.join('  /  ')}</p>}
      </div>
    </Link>
  )
}

function Section({ tag, title, products }: { tag: string; title: string; products: any[] }) {
  if (!products || products.length === 0) return null
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-neutral-400">{tag}</p>
          <h2 className="mt-2 text-xl font-light tracking-wide">{title}</h2>
        </div>
        <Link href="/products" className="text-[11px] tracking-widest text-neutral-400 hover:text-neutral-900">VIEW ALL →</Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}

const SELECT = `id, name, slug, base_price, sale_price, brands(name), product_images(url, position), product_variants(size)`

export default async function Home() {
  const supabase = await createClient()

  // 新着
  const { data: newArrivals } = await supabase
    .from('products').select(SELECT).eq('is_published', true)
    .order('created_at', { ascending: false }).limit(4)

  // セール（sale_priceあり）
  const { data: saleItems } = await supabase
    .from('products').select(SELECT).eq('is_published', true)
    .not('sale_price', 'is', null).limit(4)

  // 人気（売れた数の自動ランキング。実績が無ければ新着で補う）
  let popular: any[] = []
  const { data: ranking } = await supabaseAdmin.rpc('popular_products', { limit_count: 8 })
  const popIds = (ranking ?? []).map((r: any) => r.product_id)
  if (popIds.length > 0) {
    const { data: popProducts } = await supabase
      .from('products').select(SELECT).eq('is_published', true).in('id', popIds)
    // ランキング順に並べ替え
    popular = popIds.map((id: string) => (popProducts ?? []).find((p) => p.id === id)).filter(Boolean)
  }
  if (popular.length === 0) popular = newArrivals ?? []

  // ブランド・カテゴリ
  const { data: brands } = await supabase.from('brands').select('id, name, slug').eq('is_active', true).order('name')
  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('position')

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />

      {/* メインビジュアル */}
      <section className="relative flex h-[70vh] min-h-[420px] items-center justify-center overflow-hidden bg-neutral-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-950" />
        <div className="relative text-center">
          <p className="text-[11px] tracking-[0.4em] text-neutral-300">SELECT SHOP</p>
          <h1 className="mt-4 text-4xl font-light tracking-[0.2em] md:text-6xl">CLOTHIA</h1>
          <p className="mt-4 text-sm tracking-wide text-neutral-300">世界中から選んだ一着を、あなたに。</p>
          <Link href="/products" className="mt-8 inline-block border border-white px-10 py-3 text-xs tracking-[0.3em] transition hover:bg-white hover:text-neutral-900">
            SHOP NOW
          </Link>
        </div>
      </section>

      <Section tag="NEW ARRIVALS" title="新着アイテム" products={newArrivals ?? []} />
      <Section tag="POPULAR" title="人気アイテム" products={popular} />
      <Section tag="SALE" title="セール" products={saleItems ?? []} />

      {/* ブランド一覧 */}
      {brands && brands.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-[11px] tracking-[0.3em] text-neutral-400">BRANDS</p>
          <h2 className="mt-2 text-xl font-light tracking-wide">ブランド</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {brands.map((b) => (
              <Link key={b.id} href={`/products?brand=${b.id}`} className="border border-neutral-300 px-5 py-2 text-sm tracking-wide hover:border-neutral-900">
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* カテゴリ一覧 */}
      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-4">
          <p className="text-[11px] tracking-[0.3em] text-neutral-400">CATEGORY</p>
          <h2 className="mt-2 text-xl font-light tracking-wide">カテゴリ</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/products?category=${c.id}`} className="border border-neutral-300 px-5 py-2 text-sm tracking-wide hover:border-neutral-900">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center text-[11px] tracking-widest text-neutral-400">
          © CLOTHIA — SELECT SHOP
        </div>
      </footer>
    </div>
  )
}
