import { supabaseAdmin } from '@/lib/supabase/admin'
import { markShipped, updateOrderStatus } from './actions'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  pending: '支払い待ち', paid: '支払い済み', preparing: '準備中',
  shipped: '発送済み', delivered: '配達完了', cancelled: 'キャンセル', refunded: '返金',
}

function addr(a: any) {
  if (!a) return { name: '', lines: [] as string[] }
  const ad = a.address ?? {}
  const lines = [
    ad.postal_code ? `〒${ad.postal_code}` : null,
    [ad.state, ad.city, ad.line1, ad.line2].filter(Boolean).join(' ') || null,
    a.email || null,
    a.phone || null,
  ].filter(Boolean) as string[]
  return { name: a.name ?? '', lines }
}

export default async function OrdersAdmin() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, total, created_at, shipping_address, tracking_number')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-lg font-light tracking-wide">注文管理</h1>
      <div className="mt-6 space-y-4">
        {(orders ?? []).map((o: any) => {
          const a = addr(o.shipping_address)
          const d = new Date(o.created_at)
          return (
            <div key={o.id} className="border border-neutral-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">{o.order_number}</p>
                    <span className={`px-2 py-0.5 text-[10px] tracking-widest ${o.status === 'paid' ? 'bg-amber-100 text-amber-700' : o.status === 'shipped' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">{d.toLocaleString('ja-JP')}</p>
                  <div className="mt-2 text-sm">
                    <p>{a.name}</p>
                    {a.lines.map((l, i) => <p key={i} className="text-[12px] text-neutral-500">{l}</p>)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base">¥{(o.total ?? 0).toLocaleString()}</p>
                  {o.status === 'paid' ? (
                    <form action={markShipped.bind(null, o.id)} className="mt-3">
                      <button className="bg-neutral-900 px-4 py-2 text-[11px] tracking-widest text-white">発送済みにする</button>
                    </form>
                  ) : (
                    <form action={updateOrderStatus} className="mt-3 flex items-center justify-end gap-2">
                      <input type="hidden" name="order_id" value={o.id} />
                      <select name="status" defaultValue={o.status} className="border border-neutral-300 px-2 py-1 text-[11px]">
                        {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button className="border border-neutral-900 px-3 py-1 text-[11px] tracking-widest">変更</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {(orders ?? []).length === 0 && <p className="text-sm text-neutral-400">まだ注文がありません。</p>}
      </div>
    </div>
  )
}
