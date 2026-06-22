'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function setStock(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('variant_id'))
  await supabaseAdmin.from('product_variants').update({ stock: Number(formData.get('stock') || 0) }).eq('id', id)
  revalidatePath('/admin/inventory')
  revalidatePath('/admin')
}
