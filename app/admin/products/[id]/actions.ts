'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProduct(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  const sale = formData.get('sale_price')
  await supabaseAdmin.from('products').update({
    name: String(formData.get('name') || ''),
    base_price: Number(formData.get('base_price') || 0),
    sale_price: sale ? Number(sale) : null,
    brand_id: (formData.get('brand_id') as string) || null,
    category_id: (formData.get('category_id') as string) || null,
    gender: (formData.get('gender') as string) || 'unisex',
    description: String(formData.get('description') || ''),
    is_published: formData.get('is_published') === 'on',
  }).eq('id', id)
  revalidatePath(`/admin/products/${id}`)
  revalidatePath('/admin/products')
  revalidatePath('/')
}

export async function addVariant(formData: FormData) {
  await requireAdmin()
  const product_id = String(formData.get('product_id'))
  await supabaseAdmin.from('product_variants').insert({
    product_id,
    size: (String(formData.get('size') || '') || null),
    color: (String(formData.get('color') || '') || null),
    stock: Number(formData.get('stock') || 0),
  })
  revalidatePath(`/admin/products/${product_id}`)
}

export async function updateVariantStock(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('variant_id'))
  const product_id = String(formData.get('product_id'))
  await supabaseAdmin.from('product_variants').update({ stock: Number(formData.get('stock') || 0) }).eq('id', id)
  revalidatePath(`/admin/products/${product_id}`)
  revalidatePath('/admin/inventory')
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdmin()
  await supabaseAdmin.from('product_variants').delete().eq('id', variantId)
  revalidatePath(`/admin/products/${productId}`)
}

export async function deleteImage(imageId: string, productId: string) {
  await requireAdmin()
  await supabaseAdmin.from('product_images').delete().eq('id', imageId)
  revalidatePath(`/admin/products/${productId}`)
}
