'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

export default function ImageUploader({ productId }: { productId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const onDrop = async (files: File[]) => {
    setBusy(true); setMsg(null)
    try {
      for (const file of files) {
        const compressed = await imageCompression(file, { maxWidthOrHeight: 1600, maxSizeMB: 1, useWebWorker: true })
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, compressed)
        if (upErr) { setMsg('アップロード失敗: ' + upErr.message); continue }
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
        const { error: insErr } = await supabase.from('product_images').insert({ product_id: productId, url: publicUrl })
        if (insErr) { setMsg('登録失敗: ' + insErr.message); continue }
      }
      router.refresh()
    } catch (e: any) {
      setMsg('エラー: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, disabled: busy })

  return (
    <div>
      <div {...getRootProps()}
        className={`cursor-pointer border-2 border-dashed p-8 text-center text-sm transition ${isDragActive ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-300'} ${busy ? 'opacity-50' : ''}`}>
        <input {...getInputProps()} />
        {busy ? <p>アップロード中…</p> : (<><p>📷 画像をドラッグ＆ドロップ</p><p className="mt-1 text-[11px] text-neutral-400">スマホはタップで選択／自動で軽量化されます</p></>)}
      </div>
      {msg && <p className="mt-2 text-[11px] text-red-600">{msg}</p>}
    </div>
  )
}
