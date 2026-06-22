import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { markShipped } from './orders/actions'

export const dynamic = 'force-dynamic'

function yen(n: number) { return '¥' + (n ?? 0).toLocaleString() }

export default async function Dashboard() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const startISO = start.toISOString()

  const { data: todayOrders } = await supabaseAdmin
    .from('orders').select('total, status').gte('created_at', startISO)
  const orderCount = todayOrders?.length ?? 0
  const sales = (todayOrders ?? [])
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((s, o) => s + (o.total ?? 0), 0)

  const { count: pendingCount } = await supabaseAdmin
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid')

  const { data: lowStock } = await supabaseAdmin.from('low_stock').select('*')

  const { data: pending } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, total, shipping_address, created_at')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5)

  const cards = [
    { label: '本日の注文', value: `${orderCount}件` },
    { label: '本日の売上', value: yen(sales) },
    { label: '発送待ち', value: `${pendingCount ?? 0}件`, alert: (pendingCount ?? 0) > 0 },
    { label: '在庫不足', value: `${lowStock?.length ?? 0}件`, alert: (lowStock?.length ?? 0) > 0 },
  ]

  return (
    <div>
      <h1 className="text-lg font-light tracking-wide">ダッシュボード</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-neutral-200 bg-white p-5">
            <p className="text-[11px] tracking-widest text-neutral-400">{c.label}</p>
            <p className={`mt-2 text-2xl font-light ${c.alert ? 'text-red-600' : ''}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-[11px] tracking-[0.2em] text-neutral-500">発送待ちの注文</h2>
          {(!pending || pending.length === 0) ? (
            <p className="mt-4 text-sm text-neutral-400">発送待ちはありません。</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100">
              {pending.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm">{o.order_number}</p>
                    <p className="text-[11px] text-neutral-400">
                      {(o.shipping_address as any)?.name ?? ''} / {yen(o.total)}
                    </p>
                  </div>
                  <form action={markShipped.bind(null, o.id)}>
                    <button className="border border-neutral-900 px-3 py-2 text-[11px] tracking-widest hover:bg-neutral-900 hover:text-white">
                      発送済みにする
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/orders" className="mt-4 inline-block text-[11px] tracking-widest text-neutral-400 hover:text-neutral-900">注文をすべて見る →</Link>
        </section>

        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-[11px] tracking-[0.2em] text-neutral-500">在庫不足（残り3以下）</h2>
          {(!lowStock || lowStock.length === 0) ? (
            <p className="mt-4 text-sm text-neutral-400">在庫不足はありません。</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100">
              {lowStock.map((v: any) => (
                <li key={v.id} className="flex items-center justify-between py-3">
                  <p className="text-sm">{v.product_name} <span className="text-neutral-400">/ {v.size}{v.color ? ` / ${v.color}` : ''}</span></p>
                  <span className="text-sm text-red-600">残り{v.stock}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inventory" className="mt-4 inline-block text-[11px] tracking-widest text-neutral-400 hover:text-neutral-900">在庫管理へ →</Link>
        </section>
      </div>
    </div>
  )
}
