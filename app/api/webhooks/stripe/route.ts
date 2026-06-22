import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    // 「本物のStripeからの通知か」を署名で検証（なりすまし防止）
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook署名エラー:', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // 支払い完了したとき
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // 1) 注文番号を作る（例: 20260622-3847）
      const orderNumber =
        new Date().toISOString().slice(0, 10).replace(/-/g, '') +
        '-' +
        Math.floor(Math.random() * 9000 + 1000)

      // 2) 注文をDBに保存（status = paid）
      const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert({
          order_number: orderNumber,
          status: 'paid',
          subtotal: session.amount_subtotal ?? 0,
          total: session.amount_total ?? 0,
          shipping_address: session.shipping_details ?? session.customer_details ?? null,
          stripe_session_id: session.id,
          stripe_payment_intent: String(session.payment_intent ?? ''),
        })
        .select()
        .single()

      if (orderErr) {
        console.error('注文保存エラー:', orderErr.message)
        return new NextResponse('order insert error', { status: 500 })
      }

      // 3) 在庫を減らす（metadataに入れたvariantIdごとに1つずつ）
      const variantIds = (session.metadata?.variantIds ?? '')
        .split(',')
        .filter(Boolean)
      for (const vid of variantIds) {
        const { error: stockErr } = await supabaseAdmin.rpc('decrement_stock', {
          p_variant: vid,
          p_qty: 1,
        })
        if (stockErr) console.error('在庫減算エラー:', vid, stockErr.message)
      }

      console.log('✅ 注文を保存しました:', orderNumber)
    } catch (e: any) {
      console.error('Webhook処理エラー:', e.message)
      return new NextResponse('handler error', { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
