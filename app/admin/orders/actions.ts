'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function markShipped(orderId: string) {
  await requireAdmin()
  await supabaseAdmin.from('orders').update({
    status: 'shipped',
    shipped_at: new Date().toISOString(),
  }).eq('id', orderId)
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('order_id'))
  const status = String(formData.get('status'))
  await supabaseAdmin.from('orders').update({ status }).eq('id', id)
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}
