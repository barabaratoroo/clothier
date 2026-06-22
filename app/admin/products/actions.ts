'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(name: string) {
  const ascii = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return (ascii || 'item') + '-' + Date.now().toString(36)
}

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  const sale = formData.get('sale_price')
  const { data, error } = await supabaseAdmin.from('products').insert({
    name,
    slug: slugify(name),
    base_price: Number(formData.get('base_price') || 0),
    sale_price: sale ? Number(sale) : null,
    brand_id: (formData.get('brand_id') as string) || null,
    category_id: (formData.get('category_id') as string) || null,
    gender: (formData.get('gender') as string) || 'unisex',
    description: String(formData.get('description') || ''),
    is_published: formData.get('is_published') === 'on',
  }).select('id').single()
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  redirect(`/admin/products/${data.id}`)
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  await supabaseAdmin.from('products').delete().eq('id', id)
  revalidatePath('/admin/products')
  revalidatePath('/')
}
