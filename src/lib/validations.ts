import { z } from 'zod'

// ユーザー認証関連
export const signUpSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
})

export const signInSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(1, 'パスワードを入力してください'),
})

// プロファイル関連
export const profileSchema = z.object({
    firstName: z.string().min(1, '名前を入力してください'),
    lastName: z.string().min(1, '苗字を入力してください'),
    phone: z.string().optional(),
})

// 住所関連
export const addressSchema = z.object({
    line1: z.string().min(1, '住所1を入力してください'),
    line2: z.string().optional(),
    city: z.string().min(1, '市区町村を入力してください'),
    state: z.string().min(1, '都道府県を入力してください'),
    postalCode: z.string().min(1, '郵便番号を入力してください'),
    country: z.string().min(1, '国を入力してください').default('JP'),
})

// 商品関連
export const productSchema = z.object({
    name: z.string().min(1, '商品名を入力してください'),
    description: z.string().optional(),
    price: z.number().positive('価格は正の数値で入力してください'),
    currency: z.string().default('jpy'),
    inventory: z.number().int().nonnegative('在庫数は0以上の整数で入力してください'),
    categoryId: z.string().uuid('有効なカテゴリIDを入力してください').optional(),
    isActive: z.boolean().default(true),
})

// カート関連
export const addToCartSchema = z.object({
    productId: z.string().uuid('有効な商品IDを入力してください'),
    quantity: z.number().int().positive('数量は1以上の整数で入力してください'),
})

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive('数量は1以上の整数で入力してください'),
})

// 注文関連
export const checkoutSchema = z.object({
    shippingAddressId: z.string().uuid('有効な配送先住所IDを入力してください'),
    billingAddressId: z.string().uuid('有効な請求先住所IDを入力してください').optional(),
    notes: z.string().optional(),
})

export const createOrderSchema = z.object({
    shippingAddressId: z.string().uuid('有効な配送先住所IDを入力してください'),
    billingAddressId: z.string().uuid('有効な請求先住所IDを入力してください').optional(),
    items: z.array(z.object({
        productId: z.string().uuid('有効な商品IDを入力してください'),
        quantity: z.number().int().positive('数量は1以上の整数で入力してください'),
        price: z.number().positive('価格は正の数値で入力してください'),
    })).min(1, '注文アイテムは1つ以上必要です'),
})

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
})

// Stripe決済関連
export const checkoutValidation = z.object({
    cartItems: z.array(z.object({
        id: z.string(),
        product: z.object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string().optional(),
            price: z.number().positive(),
            currency: z.string().default('jpy'),
            inventory: z.number().int().nonnegative(),
            categoryId: z.string().optional(),
            isActive: z.boolean(),
            images: z.array(z.object({
                url: z.string(),
                alt_text: z.string().optional(),
                is_main: z.boolean().optional(),
            })).optional(),
            createdAt: z.string(),
            updatedAt: z.string(),
        }),
        quantity: z.number().int().positive(),
        addedAt: z.union([
            z.string().transform((str) => new Date(str)),
            z.date()
        ]).optional(),
    })).min(1, 'カートが空です'),
    shippingAddress: z.object({
        id: z.string().uuid(),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().default('JP'),
    }),
    metadata: z.record(z.string()).optional(),
})

// 型推論
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type CheckoutValidationInput = z.infer<typeof checkoutValidation>
