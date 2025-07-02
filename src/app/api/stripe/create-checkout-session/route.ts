/**
 * Stripe決済セッション作成API
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutValidation, type CheckoutValidationInput } from '@/lib/validations'

export async function POST(request: NextRequest) {
    try {
        console.log('🛒 Creating checkout session...');

        // Stripeクライアントの動的インポートとエラーハンドリング
        let stripe: import('stripe').Stripe;
        try {
            const stripeModule = await import('@/lib/stripe/server');
            stripe = stripeModule.stripe;
            console.log('✅ Stripe client initialized successfully');
        } catch (stripeError) {
            console.error('❌ Stripe initialization failed:', stripeError);
            return NextResponse.json(
                {
                    error: 'Stripe configuration error',
                    details: stripeError instanceof Error ? stripeError.message : 'Unknown error'
                },
                { status: 500 }
            );
        }

        const supabase = await createClient()

        // ユーザー認証確認
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // リクエストボディの検証
        const body = await request.json()
        const validatedData: CheckoutValidationInput = checkoutValidation.parse(body)

        const { cartItems, shippingAddress, metadata } = validatedData

        console.log('🛒 Validated checkout data:', {
            itemsCount: cartItems.length,
            userId: user.id,
            addressId: shippingAddress.id
        });

        // カートアイテムを検証
        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            )
        }

        // 商品情報の検証と在庫確認
        const productIds = cartItems.map(item => item.product.id)
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, inventory, is_active')
            .in('id', productIds)

        if (productsError) {
            console.error('🛒 Products fetch error:', productsError);
            return NextResponse.json(
                { error: 'Failed to fetch products' },
                { status: 500 }
            )
        }

        // 商品の在庫・価格検証
        for (const cartItem of cartItems) {
            const product = products?.find((p: { id: string; name: string; price: number; inventory: number; is_active: boolean }) => p.id === cartItem.product.id)

            if (!product) {
                return NextResponse.json(
                    { error: `Product ${cartItem.product.id} not found` },
                    { status: 400 }
                )
            }

            if (!product.is_active) {
                return NextResponse.json(
                    { error: `Product ${product.name} is not available` },
                    { status: 400 }
                )
            }

            if (product.inventory < cartItem.quantity) {
                return NextResponse.json(
                    { error: `Insufficient inventory for ${product.name}` },
                    { status: 400 }
                )
            }

            // 価格検証（セキュリティ対策）
            if (product.price !== cartItem.product.price) {
                return NextResponse.json(
                    { error: `Price mismatch for ${product.name}` },
                    { status: 400 }
                )
            }
        }

        // Stripeの決済アイテムを作成
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'jpy',
                product_data: {
                    name: item.product.name,
                    description: item.product.description || '',
                    images: item.product.images?.length && item.product.images.length > 0
                        ? [item.product.images[0].url]
                        : undefined,
                    metadata: {
                        product_id: item.product.id,
                    },
                },
                unit_amount: Math.round(item.product.price),
            },
            quantity: item.quantity,
        }))

        // 送料計算（簡単な例）
        const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        const shippingCost = subtotal >= 10000 ? 0 : 500 // 10,000円以上で送料無料

        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: 'jpy',
                    product_data: {
                        name: '送料',
                        description: '配送料',
                        images: undefined,
                        metadata: {
                            product_id: 'shipping',
                        },
                    },
                    unit_amount: shippingCost,
                },
                quantity: 1,
            })
        }

        console.log('🛒 Creating Stripe session with items:', lineItems.length);

        // Stripe Checkout セッションを作成
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/cart`,
            customer_email: user.email || undefined,
            metadata: {
                user_id: user.id,
                shipping_address_id: shippingAddress.id,
                ...metadata,
            },
            billing_address_collection: 'required',
            allow_promotion_codes: true,
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30分後に期限切れ
        })

        console.log('🛒 Stripe session created:', session.id);

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        })

    } catch (error) {
        console.error('🛒 Checkout session creation error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
