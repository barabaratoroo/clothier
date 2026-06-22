import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'カートが空です' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((i: any) => ({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: i.name,
            description: [i.brandName, i.size, i.color].filter(Boolean).join(' / ') || undefined,
            images: i.imageUrl ? [i.imageUrl] : [],
          },
          unit_amount: i.unitPrice,
        },
        quantity: i.quantity,
      })),
      shipping_address_collection: { allowed_countries: ['JP'] },
      metadata: {
        variantIds: items.map((i: any) => i.variantId).join(','),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message ?? '決済の作成に失敗しました' }, { status: 500 })
  }
}
