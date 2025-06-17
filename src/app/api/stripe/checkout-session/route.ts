/**
 * Stripe Checkout セッション情報取得API
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        // Stripeクライアントの動的インポートとエラーハンドリング
        let stripe: import('stripe').Stripe;
        try {
            const stripeModule = await import('@/lib/stripe/server');
            stripe = stripeModule.stripe;
            console.log('✅ Stripe client initialized for session retrieval');
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

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // Stripeからセッション情報を取得
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        // セッションがユーザーのものか確認
        if (session.metadata?.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        // 必要な情報のみを返す
        return NextResponse.json({
            id: session.id,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_email || session.customer_details?.email,
            created: session.created,
            metadata: session.metadata,
        })

    } catch (error) {
        console.error('Checkout session retrieval error:', error)

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
