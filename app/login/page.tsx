'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErr('ログインに失敗しました。メール・パスワードを確認してください。')
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-neutral-900">
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <h1 className="text-center text-lg font-semibold tracking-[0.25em]">CLOTHIA ADMIN</h1>
        <p className="mt-2 text-center text-[11px] tracking-widest text-neutral-400">管理者ログイン</p>

        <div className="mt-8 space-y-4">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス" required
            className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード" required
            className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        {err && <p className="mt-4 text-[11px] text-red-600">{err}</p>}

        <button
          type="submit" disabled={loading}
          className="mt-6 w-full bg-neutral-900 py-4 text-xs tracking-[0.2em] text-white disabled:opacity-40"
        >
          {loading ? 'ログイン中…' : 'LOGIN'}
        </button>
      </form>
    </div>
  )
}
