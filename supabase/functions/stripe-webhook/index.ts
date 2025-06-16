// @ts-nocheck
/**
 * Stripe Webhook Edge Function
 * StripeからのWebhookイベントを安全に処理するSupabase Edge Function
 * シンプルな実装 - deno.json/import_map.json不要
 */ import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }
    try {
        // Validate request method
        if (req.method !== 'POST') {
            return new Response('Method not allowed', {
                status: 405,
                headers: corsHeaders
            });
        }
        // Get environment variables with fallbacks for development
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        // Debug: Log environment variable availability
        console.log('🔍 Environment variables check:', {
            webhookSecret: !!webhookSecret,
            stripeSecretKey: !!stripeSecretKey,
            supabaseUrl: !!supabaseUrl,
            supabaseServiceKey: !!supabaseServiceKey,
            allEnvVars: Object.keys(Deno.env.toObject()).filter((key) => key.includes('STRIPE') || key.includes('SUPABASE'))
        });
        if (!webhookSecret || !stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
            const missing = [];
            if (!webhookSecret) missing.push('STRIPE_WEBHOOK_SECRET');
            if (!stripeSecretKey) missing.push('STRIPE_SECRET_KEY');
            if (!supabaseUrl) missing.push('SUPABASE_URL');
            if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
            console.error('❌ Missing required environment variables:', missing);
            return new Response(`Server configuration error: Missing ${missing.join(', ')}`, {
                status: 500,
                headers: corsHeaders
            });
        }
        // Get request body and signature
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            console.error('❌ Missing stripe-signature header');
            return new Response('Missing stripe-signature header', {
                status: 400,
                headers: corsHeaders
            });
        }
        // Verify webhook signature
        let event;
        try {
            event = await verifyWebhookSignature(body, signature, webhookSecret);
        } catch (error) {
            console.error('❌ Webhook signature verification failed:', error);
            return new Response('Webhook signature verification failed', {
                status: 400,
                headers: corsHeaders
            });
        }
        console.log(`🔗 Webhook received: ${event.type} (${event.id})`);
        // Initialize Supabase client with dynamic import
        console.log('🔌 Initializing Supabase client...');
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Test Supabase connection
        console.log('🧪 Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
            .from('orders')
            .select('count', { count: 'exact', head: true });

        if (testError) {
            console.error('❌ Supabase connection test failed:', testError);
        } else {
            console.log('✅ Supabase connection successful. Current orders count:', testData);
        }
        // Process webhook events
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object, supabase, stripeSecretKey);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object, supabase);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object, supabase);
                break;
            default:
                console.log(`🔗 Unhandled event type: ${event.type}`);
        }
        return new Response(JSON.stringify({
            received: true
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('🔗 Webhook processing error:', error);
        return new Response(JSON.stringify({
            error: 'Webhook processing failed'
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
});
/**
 * Verify Stripe webhook signature
 */ async function verifyWebhookSignature(payload, signature, secret) {
    const encoder = new TextEncoder();
    // Parse signature
    const elements = signature.split(',');
    const timestamp = elements.find((el) => el.startsWith('t='))?.substring(2);
    const signatureHash = elements.find((el) => el.startsWith('v1='))?.substring(3);
    if (!timestamp || !signatureHash) {
        throw new Error('Invalid signature format');
    }
    // Build signed payload
    const signedPayload = `${timestamp}.${payload}`;
    // Compute HMAC-SHA256 signature
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {
        name: 'HMAC',
        hash: 'SHA-256'
    }, false, [
        'sign'
    ]);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedSignature = Array.from(new Uint8Array(signatureBytes)).map((b) => b.toString(16).padStart(2, '0')).join('');
    // Compare signatures
    if (computedSignature !== signatureHash) {
        throw new Error('Signature verification failed');
    }
    // Check timestamp (5 minutes tolerance)
    const timestampNum = Number.parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampNum) > 300) {
        throw new Error('Timestamp too old');
    }
    return JSON.parse(payload);
}
/**
 * Handle checkout session completed
 */ async function handleCheckoutSessionCompleted(session, supabase, stripeSecretKey) {
    try {
        console.log('🔗 Processing checkout session completed:', session.id);

        // Fetch session details from Stripe
        console.log('📡 Fetching session details from Stripe...');
        const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}?expand[]=line_items&expand[]=payment_intent`, {
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Stripe-Version': '2025-05-28.basil'
            }
        });

        if (!stripeResponse.ok) {
            const errorText = await stripeResponse.text();
            console.error('❌ Stripe API error:', stripeResponse.status, errorText);
            throw new Error(`Failed to fetch session details: ${stripeResponse.statusText}`);
        }

        const fullSession = await stripeResponse.json();
        console.log('📋 Full session data:', {
            id: fullSession.id,
            metadata: fullSession.metadata,
            customer: fullSession.customer,
            amount_total: fullSession.amount_total,
            currency: fullSession.currency,
            payment_status: fullSession.payment_status
        });

        const userId = fullSession.metadata?.user_id;
        const shippingAddressId = fullSession.metadata?.shipping_address_id;
        const billingAddressId = fullSession.metadata?.billing_address_id;

        console.log('🔍 Extracted metadata:', {
            userId,
            shippingAddressId,
            billingAddressId
        });

        if (!userId || !shippingAddressId) {
            console.error('🔗 Missing required metadata in session');
            console.error('Available metadata:', fullSession.metadata);
            return;
        }

        // Prepare order data
        const orderData = {
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent_id: typeof fullSession.payment_intent === 'string'
                ? fullSession.payment_intent
                : fullSession.payment_intent?.id || null,
            status: 'pending',
            total: (session.amount_total || 0) / 100, // Changed from total_amount to total
            currency: session.currency,
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId || shippingAddressId
        };

        console.log('📝 Order data to insert:', orderData);

        // Create order record
        console.log('💾 Inserting order into database...');

        // Try to insert with detailed error logging
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select('id')
            .single();

        if (orderError) {
            console.error('❌ Failed to create order:', {
                error: orderError,
                code: orderError.code,
                details: orderError.details,
                hint: orderError.hint,
                message: orderError.message
            });
            console.error('Order data that failed:', orderData);

            // Try to check if user exists
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .single();

            if (userError) {
                console.error('❌ User does not exist:', userError);
            } else {
                console.log('✅ User exists:', userData);
            }

            // Try to check if addresses exist
            const { data: addressData, error: addressError } = await supabase
                .from('addresses')
                .select('id')
                .eq('id', shippingAddressId)
                .single();

            if (addressError) {
                console.error('❌ Address does not exist:', addressError);
            } else {
                console.log('✅ Address exists:', addressData);
            }

            return;
        }

        console.log('✅ Order created successfully:', order?.id);
        // Create order items and update inventory
        if (fullSession.line_items?.data && order) {
            console.log('📦 Processing line items...');
            const orderItems = fullSession.line_items.data
                .filter((item) =>
                    item.price?.metadata?.product_id &&
                    item.price.metadata.product_id !== 'shipping'
                )
                .map((item) => {
                    const price = (item.price?.unit_amount || 0) / 100;
                    const quantity = item.quantity || 1;
                    return {
                        order_id: order.id,
                        product_id: item.price?.metadata?.product_id,
                        quantity: quantity,
                        price: price,
                        total: price * quantity // Added total field
                    };
                });

            console.log('📝 Order items to insert:', orderItems);

            if (orderItems.length > 0) {
                // Insert order items
                console.log('💾 Inserting order items...');
                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) {
                    console.error('🔗 Failed to create order items:', itemsError);
                    return;
                }
                console.log('🔗 Order items created:', orderItems.length);
                // Update inventory
                for (const item of orderItems) {
                    const { error: inventoryError } = await supabase.rpc('decrease_product_inventory', {
                        product_id: item.product_id,
                        quantity: item.quantity
                    });
                    if (inventoryError) {
                        console.error('🔗 Failed to decrease inventory:', inventoryError);
                    }
                }
            }
        }
        // Clear user cart
        const { error: cartError } = await supabase.from('cart_items').delete().eq('user_id', userId);
        if (cartError) {
            console.error('🔗 Failed to clear cart:', cartError);
        }
        console.log('🔗 Checkout session processing completed');
    } catch (error) {
        console.error('🔗 Error processing checkout session:', error);
    }
}
/**
 * Handle payment intent succeeded
 */ async function handlePaymentIntentSucceeded(paymentIntent, supabase) {
    try {
        console.log('🔗 Processing payment intent succeeded:', paymentIntent.id);
        const { error } = await supabase.from('orders').update({
            status: 'processing',
            updated_at: new Date().toISOString()
        }).eq('stripe_payment_intent_id', paymentIntent.id);
        if (error) {
            console.error('🔗 Failed to update order status:', error);
            return;
        }
        console.log('🔗 Order status updated to processing');
    } catch (error) {
        console.error('🔗 Error processing payment intent succeeded:', error);
    }
}
/**
 * Handle payment intent failed
 */ async function handlePaymentIntentFailed(paymentIntent, supabase) {
    try {
        console.log('🔗 Processing payment intent failed:', paymentIntent.id);
        const { error } = await supabase.from('orders').update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        }).eq('stripe_payment_intent_id', paymentIntent.id);
        if (error) {
            console.error('🔗 Failed to update order status:', error);
            return;
        }
        console.log('🔗 Order status updated to cancelled');
    } catch (error) {
        console.error('🔗 Error processing payment intent failed:', error);
    }
}
