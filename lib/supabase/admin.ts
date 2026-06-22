import { createClient } from '@supabase/supabase-js'

// サーバー専用。RLSをすり抜けて注文の保存・在庫減算を行う。
// service_roleキーを使うので、絶対にブラウザ側（'use client'）から読み込まない。
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
