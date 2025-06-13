import type Stripe from 'stripe'
import { stripe } from './server'

export function constructEvent(
    payload: string | Buffer,
    signature: string
): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
        throw new Error('Missing Stripe webhook secret')
    }

    try {
        return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Webhook signature verification failed: ${error.message}`)
        }
        throw new Error('Webhook signature verification failed')
    }
}

export function isStripeEvent(event: unknown): event is Stripe.Event {
    return (
        typeof event === 'object' &&
        event !== null &&
        'type' in event &&
        'data' in event
    )
}
