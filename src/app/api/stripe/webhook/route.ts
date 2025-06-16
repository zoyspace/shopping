/**
 * Stripe Webhook処理
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructEvent } from '@/lib/stripe/webhook'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        )
    }

    try {
        // Webhook イベントを構築・検証
        const event = constructEvent(body, signature)

        console.log('🔗 Webhook received:', event.type);

        // イベント処理
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object)
                break
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object)
                break
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object)
                break
            default:
                console.log(`🔗 Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('🔗 Webhook error:', error)

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

// Checkout セッション完了処理
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
        console.log('🔗 Processing checkout session completed:', session.id);

        const supabase = await createClient()

        // セッションの詳細情報を取得
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items', 'payment_intent']
        })

        const userId = fullSession.metadata?.user_id
        const shippingAddressId = fullSession.metadata?.shipping_address_id
        const billingAddressId = fullSession.metadata?.billing_address_id

        if (!userId || !shippingAddressId) {
            console.error('🔗 Missing required metadata in session')
            return
        }

        // 注文レコードを作成
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                stripe_session_id: session.id,
                stripe_payment_intent_id: typeof fullSession.payment_intent === 'string'
                    ? fullSession.payment_intent
                    : fullSession.payment_intent?.id || null,
                status: 'pending',
                total_amount: (session.amount_total || 0) / 100, // Stripeは cents 単位
                currency: session.currency,
                shipping_address_id: shippingAddressId,
                billing_address_id: billingAddressId || shippingAddressId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select('id')
            .single()

        if (orderError) {
            console.error('🔗 Failed to create order:', orderError)
            return
        }

        console.log('🔗 Order created:', order.id);

        // 注文アイテムを作成
        if (fullSession.line_items?.data) {
            const orderItems = fullSession.line_items.data
                .filter(item => item.price?.metadata?.product_id && item.price.metadata.product_id !== 'shipping')
                .map(item => ({
                    order_id: order.id,
                    product_id: item.price?.metadata?.product_id,
                    quantity: item.quantity || 1,
                    price: (item.price?.unit_amount || 0) / 100,
                    created_at: new Date().toISOString(),
                }))

            if (orderItems.length > 0) {
                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems)

                if (itemsError) {
                    console.error('🔗 Failed to create order items:', itemsError)
                    return
                }

                console.log('🔗 Order items created:', orderItems.length);

                // 在庫を減らす
                for (const item of orderItems) {
                    const { error: inventoryError } = await supabase.rpc(
                        'decrease_product_inventory',
                        {
                            product_id: item.product_id,
                            quantity: item.quantity
                        }
                    )

                    if (inventoryError) {
                        console.error('🔗 Failed to decrease inventory:', inventoryError)
                        // 在庫更新の失敗は注文には影響させない
                    }
                }
            }
        }

        // ユーザーのカートをクリア
        const { error: cartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)

        if (cartError) {
            console.error('🔗 Failed to clear cart:', cartError)
            // カートクリアの失敗は注文には影響させない
        }

        console.log('🔗 Checkout session processing completed');

    } catch (error) {
        console.error('🔗 Error processing checkout session:', error)
    }
}

// 決済成功処理
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
        console.log('🔗 Processing payment intent succeeded:', paymentIntent.id);

        const supabase = await createClient()

        // 注文ステータスを更新
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'processing',
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
            console.error('🔗 Failed to update order status:', error)
            return
        }

        console.log('🔗 Order status updated to processing');

    } catch (error) {
        console.error('🔗 Error processing payment intent succeeded:', error)
    }
}

// 決済失敗処理
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
        console.log('🔗 Processing payment intent failed:', paymentIntent.id);

        const supabase = await createClient()

        // 注文ステータスを更新
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
            console.error('🔗 Failed to update order status:', error)
            return
        }

        console.log('🔗 Order status updated to cancelled');

    } catch (error) {
        console.error('🔗 Error processing payment intent failed:', error)
    }
}
