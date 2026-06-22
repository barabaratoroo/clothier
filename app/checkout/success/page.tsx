'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useCart } from '@/lib/cart-context'

export default function SuccessPage() {
  const { clear } = useCart()
  useEffect(() => { clear() }, [])  // 決済完了したのでカートを空にする

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-3xl">✓</p>
        <h1 className="mt-4 text-xl font-light tracking-wide">ご注文ありがとうございます</h1>
        <p className="mt-3 text-sm text-neutral-500">
          お支払いが完了しました。確認メールをお送りします。
        </p>
        <Link href="/" className="mt-10 inline-block border border-neutral-900 px-8 py-3 text-xs tracking-[0.2em]">
          買い物を続ける
        </Link>
      </main>
    </div>
  )
}
