// ユーザー関連の型
export interface User {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    avatarUrl?: string
    stripeCustomerId?: string
    createdAt: string
    updatedAt: string
}

// 住所関連の型
export interface Address {
    id: string
    userId: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

// カテゴリ関連の型
export interface Category {
    id: string
    name: string
    description?: string
    slug: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// 商品関連の型
export interface Product {
    id: string
    name: string
    description?: string
    price: number
    original_price?: number
    currency: string
    inventory: number // スキーマに合わせて変更
    categoryId?: string
    category?: Category
    images: ProductImage[]
    image_url?: string // メイン画像URL（計算フィールド）
    isActive: boolean
    stripeProductId?: string
    stripePriceId?: string
    createdAt: string
    updatedAt: string
}

export interface ProductImage {
    id: string
    productId: string
    url: string
    altText?: string
    isMain: boolean
    sortOrder: number
    createdAt: string
}

// カート関連の型
export interface CartItem {
    id: string
    userId: string
    productId: string
    product?: Product
    quantity: number
    createdAt: string
    updatedAt: string
}

// 注文関連の型
export interface Order {
    id: string
    userId: string
    user?: User
    status: OrderStatus
    total: number
    currency: string
    shippingAddressId: string
    billingAddressId?: string
    shippingAddress?: Address
    billingAddress?: Address
    items: OrderItem[]
    stripePaymentIntentId?: string
    stripeSessionId?: string
    createdAt: string
    updatedAt: string
}

export interface OrderItem {
    id: string
    orderId: string
    productId: string
    product?: Product
    quantity: number
    price: number
    total: number
    createdAt: string
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

// Stripe関連の型
export interface StripeCustomer {
    id: string
    email: string
    name?: string
    phone?: string
}

export interface StripeCheckoutSession {
    id: string
    paymentStatus: string
    customerEmail?: string
    url?: string
}

// API レスポンス関連の型
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

// ページネーション関連の型
export interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

// フィルタ関連の型
export interface ProductFilters {
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    search?: string
}
