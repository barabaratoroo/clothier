import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import LogoutButton from '@/components/admin/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()  // 管理者でなければ /login へ飛ばす

  const nav = [
    { href: '/admin', label: 'ダッシュボード' },
    { href: '/admin/products', label: '商品' },
    { href: '/admin/orders', label: '注文' },
    { href: '/admin/inventory', label: '在庫' },
    { href: '/admin/brands', label: 'ブランド' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm font-semibold tracking-[0.25em]">CLOTHIA ADMIN</Link>
            <nav className="hidden gap-6 text-xs tracking-wide text-neutral-500 md:flex">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-neutral-900">{n.label}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="text-[11px] tracking-widest text-neutral-400 hover:text-neutral-900">店舗を見る ↗</Link>
            <LogoutButton />
          </div>
        </div>
        {/* スマホ用ナビ */}
        <nav className="flex gap-4 overflow-x-auto border-t border-neutral-100 px-6 py-2 text-xs text-neutral-500 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-neutral-900">{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
