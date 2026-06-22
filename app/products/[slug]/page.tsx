import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import AddToCart from '@/components/AddToCart'

export default async function ProductDetail({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      id, name, slug, description, base_price, sale_price, gender,
      brands ( name, slug, description ),
      product_images ( url, position ),
      product_variants ( id, size, color, color_hex, stock )
    `)
    .eq('slug', slug).eq('is_published', true).single()

  if (!product) notFound()

  const brand = Array.isArray(product.brands) ? product.brands[0] : product.brands
  const images = [...(product.product_images ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  )
  const variants = product.product_variants ?? []
  const onSale = product.sale_price != null
  const price = onSale ? product.sale_price : product.base_price

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-6 text-[11px] tracking-widest text-neutral-400">
        <Link href="/" className="hover:text-neutral-900">HOME</Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </div>

      <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden bg-neutral-100">
            {images[0]?.url ? (
              <img src={images[0].url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs tracking-widest text-neutral-300">NO IMAGE</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((im: any, i: number) => (
                <div key={i} className="aspect-square overflow-hidden bg-neutral-100">
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{brand?.name ?? ''}</p>
          <h1 className="mt-2 text-xl font-light tracking-wide">{product.name}</h1>

          <div className="mt-4 text-lg">
            {onSale ? (
              <>
                <span className="mr-3 text-neutral-400 line-through">¥{product.base_price.toLocaleString()}</span>
                <span className="text-red-600">¥{price.toLocaleString()}</span>
              </>
            ) : (
              <span>¥{price.toLocaleString()}</span>
            )}
            <span className="ml-2 text-[11px] text-neutral-400">（税込）</span>
          </div>

          <div className="mt-8">
            <AddToCart
              productId={product.id}
              slug={product.slug}
              name={product.name}
              brandName={brand?.name ?? ''}
              unitPrice={price}
              imageUrl={images[0]?.url ?? null}
              variants={variants.map((v: any) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock ?? 0 }))}
            />
          </div>

          {product.description && (
            <div className="mt-12 border-t border-neutral-200 pt-8">
              <p className="text-[11px] tracking-[0.2em] text-neutral-500">DETAILS</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{product.description}</p>
            </div>
          )}

          {brand?.description && (
            <div className="mt-10 border-t border-neutral-200 pt-8">
              <p className="text-[11px] tracking-[0.2em] text-neutral-500">ABOUT BRAND</p>
              <h2 className="mt-3 text-sm">{brand.name}</h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">{brand.description}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
