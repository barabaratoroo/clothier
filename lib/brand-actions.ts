'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

function slugify(name: string) {
  const ascii = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return (ascii || 'brand') + '-' + Date.now().toString(36)
}

export async function quickCreateBrand(name: string) {
  await requireAdmin()
  const trimmed = name.trim()
  if (!trimmed) return { error: '名前を入力してください' }

  const { data: existing } = await supabaseAdmin
    .from('brands').select('id, name').ilike('name', trimmed).limit(1)
  if (existing && existing.length > 0) {
    return { brand: existing[0] }
  }

  const { data, error } = await supabaseAdmin
    .from('brands').insert({ name: trimmed, slug: slugify(trimmed) })
    .select('id, name').single()
  if (error) return { error: error.message }
  return { brand: data }
}
