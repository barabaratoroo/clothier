'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function slugify(name: string) {
  const ascii = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return (ascii || 'brand') + '-' + Date.now().toString(36)
}

export async function createBrand(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  await supabaseAdmin.from('brands').insert({
    name, slug: slugify(name), description: String(formData.get('description') || ''),
  })
  revalidatePath('/admin/brands')
}

export async function deleteBrand(id: string) {
  await requireAdmin()
  await supabaseAdmin.from('brands').delete().eq('id', id)
  revalidatePath('/admin/brands')
}
