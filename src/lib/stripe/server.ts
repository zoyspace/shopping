import Stripe from 'stripe'

// 環境変数の詳細チェック
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const nodeEnv = process.env.NODE_ENV

// デバッグ情報の出力
console.log('Stripe server initialization:')
console.log('NODE_ENV:', nodeEnv)
console.log('STRIPE_SECRET_KEY exists:', !!stripeSecretKey)
console.log('STRIPE_SECRET_KEY starts with sk_:', stripeSecretKey?.startsWith('sk_'))

if (!stripeSecretKey) {
    console.error('❌ Environment variables check:')
    console.error('STRIPE_SECRET_KEY:', stripeSecretKey ? 'Set' : 'Not set')
    console.error('All env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')))
    throw new Error(`Missing Stripe secret key. Please check your .env.local file and restart the development server.
Environment: ${nodeEnv}
Available Stripe env vars: ${Object.keys(process.env).filter(key => key.includes('STRIPE')).join(', ')}`)
}

if (!stripeSecretKey.startsWith('sk_')) {
    throw new Error(`Invalid Stripe secret key format. Secret key should start with 'sk_'`)
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
    typescript: true,
})

export default stripe
