/**
 * 改善されたカート管理用のカスタムフック
 * useReducer + immer + バッチAPI + セキュリティ強化版
 */

'use client'

import { useReducer, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import { toast } from 'sonner'
import { produce } from 'immer'

export interface CartItem {
    id: string
    product: Product
    quantity: number
    addedAt: Date
    // サーバー価格検証用（価格改ざん対策）
    serverPriceChecked?: boolean
}

interface CartState {
    items: CartItem[]
    totalItems: number
    totalPrice: number
    isLoading: boolean
    error: string | null
    lastSynced: Date | null
}

// Reducer actions
type CartAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_ITEMS'; payload: { items: CartItem[]; lastSynced?: Date } }
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'CLEAR_CART' }
    | { type: 'SYNC_COMPLETE'; payload: Date }

// 計算ヘルパー関数
const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    return { totalItems, totalPrice }
}

// Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
    return produce(state, draft => {
        switch (action.type) {
            case 'SET_LOADING':
                draft.isLoading = action.payload
                break

            case 'SET_ERROR':
                draft.error = action.payload
                break

            case 'SET_ITEMS': {
                const { totalItems, totalPrice } = calculateTotals(action.payload.items)
                draft.items = action.payload.items
                draft.totalItems = totalItems
                draft.totalPrice = totalPrice
                draft.error = null
                if (action.payload.lastSynced) {
                    draft.lastSynced = action.payload.lastSynced
                }
                break
            }

            case 'ADD_ITEM': {
                const existingIndex = draft.items.findIndex(item => item.product.id === action.payload.product.id)
                if (existingIndex >= 0) {
                    draft.items[existingIndex].quantity += action.payload.quantity
                } else {
                    draft.items.unshift(action.payload)
                }
                const { totalItems, totalPrice } = calculateTotals(draft.items)
                draft.totalItems = totalItems
                draft.totalPrice = totalPrice
                draft.error = null
                break
            }

            case 'UPDATE_ITEM': {
                const itemIndex = draft.items.findIndex(item => item.product.id === action.payload.productId)
                if (itemIndex >= 0) {
                    if (action.payload.quantity <= 0) {
                        draft.items.splice(itemIndex, 1)
                    } else {
                        draft.items[itemIndex].quantity = action.payload.quantity
                    }
                }
                const { totalItems, totalPrice } = calculateTotals(draft.items)
                draft.totalItems = totalItems
                draft.totalPrice = totalPrice
                draft.error = null
                break
            }

            case 'REMOVE_ITEM': {
                draft.items = draft.items.filter(item => item.product.id !== action.payload)
                const { totalItems, totalPrice } = calculateTotals(draft.items)
                draft.totalItems = totalItems
                draft.totalPrice = totalPrice
                draft.error = null
                break
            }

            case 'CLEAR_CART':
                draft.items = []
                draft.totalItems = 0
                draft.totalPrice = 0
                draft.error = null
                break

            case 'SYNC_COMPLETE':
                draft.lastSynced = action.payload
                break
        }
    })
}

// 初期状態
const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: true,
    error: null,
    lastSynced: null,
}

export function useCartImproved() {
    const { user } = useAuth()
    const supabase = createClient()
    const [state, dispatch] = useReducer(cartReducer, initialState)

    // ローカルストレージキー
    const STORAGE_KEY = 'shopping-cart'

    // ローカルストレージヘルパー
    const localStorage = useMemo(() => ({
        get: (): CartItem[] => {
            try {
                if (typeof window === 'undefined') return []
                const stored = window.localStorage.getItem(STORAGE_KEY)
                if (!stored) return []
                
                const parsed = JSON.parse(stored) as CartItem[]
                return parsed.map(item => ({
                    ...item,
                    addedAt: new Date(item.addedAt),
                }))
            } catch (error) {
                console.error('ローカルカート読み込みエラー:', error)
                return []
            }
        },

        set: (items: CartItem[]) => {
            try {
                if (typeof window === 'undefined') return
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
                console.log('🛒 Local cart saved:', items.length, 'items')
            } catch (error) {
                console.error('ローカルカート保存エラー:', error)
            }
        },

        clear: () => {
            try {
                if (typeof window === 'undefined') return
                window.localStorage.removeItem(STORAGE_KEY)
                console.log('🛒 Local cart cleared')
            } catch (error) {
                console.error('ローカルカートクリアエラー:', error)
            }
        }
    }), [])

    // サーバーカート読み込み
    const loadServerCart = useCallback(async (): Promise<CartItem[]> => {
        if (!user) return []

        try {
            console.log('🛒 Loading server cart for user:', user.id)

            const { data, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    quantity,
                    created_at,
                    product:products (
                        id,
                        name,
                        description,
                        price,
                        currency,
                        inventory,
                        category_id,
                        is_active,
                        product_images (
                            url,
                            alt_text,
                            is_main
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('🛒 Server cart load error:', error)
                throw new Error(`カート読み込みエラー: ${error.message}`)
            }

            const result = data?.map(item => {
                const productData = item.product as any
                return {
                    id: item.id,
                    product: {
                        id: productData.id,
                        name: productData.name,
                        description: productData.description,
                        price: productData.price,
                        currency: productData.currency,
                        inventory: productData.inventory,
                        categoryId: productData.category_id,
                        isActive: productData.is_active,
                        images: productData.product_images || [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    } as Product,
                    quantity: item.quantity,
                    addedAt: new Date(item.created_at),
                    serverPriceChecked: true, // サーバーから取得したため価格は検証済み
                } as CartItem
            }) || []

            console.log('🛒 Server cart loaded:', result.length, 'items')
            return result
        } catch (error) {
            console.error('サーバーカート読み込みエラー:', error)
            throw error
        }
    }, [user, supabase])

    // バッチ化されたサーバーカート同期
    const syncCartToServer = useCallback(async (items: CartItem[]) => {
        if (!user || items.length === 0) return

        try {
            console.log('🛒 Syncing cart to server (batch):', items.length, 'items')

            // バッチ形式でupsert
            const cartData = items.map(item => ({
                user_id: user.id,
                product_id: item.product.id,
                quantity: item.quantity,
                updated_at: new Date().toISOString(),
            }))

            const { error } = await supabase
                .from('cart_items')
                .upsert(cartData, {
                    onConflict: 'user_id,product_id'
                })

            if (error) {
                console.error('🛒 Batch sync error:', error)
                throw new Error(`カート同期エラー: ${error.message}`)
            }

            console.log('🛒 Cart synced successfully')
            dispatch({ type: 'SYNC_COMPLETE', payload: new Date() })
        } catch (error) {
            console.error('カート同期エラー:', error)
            throw error
        }
    }, [user, supabase])

    // 価格検証（セキュリティ対策）
    const verifyPrices = useCallback(async (items: CartItem[]): Promise<CartItem[]> => {
        if (items.length === 0) return []

        try {
            console.log('🛒 Verifying prices for', items.length, 'items')

            const productIds = items.map(item => item.product.id)
            const { data: serverProducts, error } = await supabase
                .from('products')
                .select('id, price, inventory, is_active')
                .in('id', productIds)

            if (error) {
                console.error('🛒 Price verification error:', error)
                throw new Error(`価格検証エラー: ${error.message}`)
            }

            const serverPriceMap = new Map(
                serverProducts?.map(p => [p.id, { price: p.price, inventory: p.inventory, isActive: p.is_active }]) || []
            )

            const verifiedItems = items
                .map(item => {
                    const serverData = serverPriceMap.get(item.product.id)
                    if (!serverData) {
                        console.warn('🛒 Product not found on server:', item.product.id)
                        return null
                    }

                    if (!serverData.isActive) {
                        console.warn('🛒 Product inactive:', item.product.id)
                        return null
                    }

                    // 価格が異なる場合は警告してサーバー価格を使用
                    if (item.product.price !== serverData.price) {
                        console.warn('🛒 Price mismatch detected:', {
                            productId: item.product.id,
                            clientPrice: item.product.price,
                            serverPrice: serverData.price
                        })
                        toast.warning(`${item.product.name}の価格が更新されました`)
                    }

                    // 在庫チェック
                    const adjustedQuantity = Math.min(item.quantity, serverData.inventory)
                    if (adjustedQuantity < item.quantity) {
                        console.warn('🛒 Quantity adjusted due to inventory:', {
                            productId: item.product.id,
                            requestedQuantity: item.quantity,
                            availableInventory: serverData.inventory
                        })
                        toast.warning(`${item.product.name}の在庫が不足しています`)
                    }

                    return {
                        ...item,
                        product: {
                            ...item.product,
                            price: serverData.price, // サーバー価格を強制使用
                            inventory: serverData.inventory,
                        },
                        quantity: adjustedQuantity,
                        serverPriceChecked: true,
                    }
                })
                .filter((item): item is CartItem => item !== null)

            console.log('🛒 Price verification complete:', verifiedItems.length, 'valid items')
            return verifiedItems
        } catch (error) {
            console.error('価格検証エラー:', error)
            throw error
        }
    }, [supabase])

    // カートアイテム追加
    const addToCart = useCallback(async (product: Product, quantity = 1) => {
        console.log('🛒 addToCart called:', { productId: product.id, quantity })

        try {
            dispatch({ type: 'SET_ERROR', payload: null })

            // 在庫チェック
            if (product.inventory < quantity) {
                throw new Error('在庫が不足しています')
            }

            const newItem: CartItem = {
                id: user ? `server-${Date.now()}` : `local-${Date.now()}`,
                product,
                quantity,
                addedAt: new Date(),
                serverPriceChecked: false, // クライアント作成のためfalse
            }

            if (user) {
                // ログインユーザー: サーバーに追加してから状態更新
                await syncCartToServer([...state.items, newItem])
                const serverItems = await loadServerCart()
                dispatch({ type: 'SET_ITEMS', payload: { items: serverItems, lastSynced: new Date() } })
            } else {
                // 未ログインユーザー: ローカル処理
                const updatedItems = [...state.items]
                const existingIndex = updatedItems.findIndex(item => item.product.id === product.id)
                
                if (existingIndex >= 0) {
                    updatedItems[existingIndex].quantity += quantity
                } else {
                    updatedItems.unshift(newItem)
                }

                localStorage.set(updatedItems)
                dispatch({ type: 'SET_ITEMS', payload: { items: updatedItems } })
            }

            toast.success(`${product.name}をカートに追加しました`)
        } catch (error) {
            console.error('🛒 addToCart error:', error)
            const errorMessage = error instanceof Error ? error.message : 'カートへの追加に失敗しました'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            toast.error(errorMessage)
            throw error
        }
    }, [user, state.items, syncCartToServer, loadServerCart, localStorage])

    // カート数量更新
    const updateQuantity = useCallback(async (productId: string, quantity: number) => {
        try {
            dispatch({ type: 'SET_ERROR', payload: null })

            if (quantity <= 0) {
                return removeFromCart(productId)
            }

            // 在庫チェック
            const item = state.items.find(item => item.product.id === productId)
            if (!item) {
                throw new Error('カートにそのアイテムが見つかりません')
            }

            if (quantity > item.product.inventory) {
                throw new Error(`在庫は${item.product.inventory}個までです`)
            }

            if (user) {
                // サーバー更新
                const updatedItems = state.items.map(item =>
                    item.product.id === productId ? { ...item, quantity } : item
                )
                await syncCartToServer(updatedItems)
                const serverItems = await loadServerCart()
                dispatch({ type: 'SET_ITEMS', payload: { items: serverItems, lastSynced: new Date() } })
            } else {
                // ローカル更新
                dispatch({ type: 'UPDATE_ITEM', payload: { productId, quantity } })
                localStorage.set(state.items.map(item =>
                    item.product.id === productId ? { ...item, quantity } : item
                ))
            }

            toast.success('数量を更新しました')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '数量の更新に失敗しました'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            toast.error(errorMessage)
        }
    }, [state.items, user, syncCartToServer, loadServerCart, localStorage])

    // カートからアイテム削除
    const removeFromCart = useCallback(async (productId: string) => {
        try {
            dispatch({ type: 'SET_ERROR', payload: null })

            if (user) {
                // サーバーから削除
                const { error } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId)

                if (error) {
                    throw new Error(`削除エラー: ${error.message}`)
                }

                const serverItems = await loadServerCart()
                dispatch({ type: 'SET_ITEMS', payload: { items: serverItems, lastSynced: new Date() } })
            } else {
                // ローカル削除
                dispatch({ type: 'REMOVE_ITEM', payload: productId })
                const updatedItems = state.items.filter(item => item.product.id !== productId)
                localStorage.set(updatedItems)
            }

            toast.success('カートから削除しました')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '削除に失敗しました'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            toast.error(errorMessage)
        }
    }, [state.items, user, supabase, loadServerCart, localStorage])

    // カートクリア
    const clearCart = useCallback(async () => {
        try {
            dispatch({ type: 'SET_ERROR', payload: null })

            if (user) {
                // サーバークリア
                const { error } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)

                if (error) {
                    throw new Error(`クリアエラー: ${error.message}`)
                }
            } else {
                // ローカルクリア
                localStorage.clear()
            }

            dispatch({ type: 'CLEAR_CART' })
            toast.success('カートをクリアしました')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'クリアに失敗しました'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            toast.error(errorMessage)
        }
    }, [user, supabase, localStorage])

    // カート同期（ローカル→サーバー）
    const syncCart = useCallback(async () => {
        if (!user) return

        try {
            const localItems = localStorage.get()
            if (localItems.length === 0) return

            console.log('🛒 Syncing local cart to server:', localItems.length, 'items')

            // 価格検証してからサーバーに同期
            const verifiedItems = await verifyPrices(localItems)
            await syncCartToServer(verifiedItems)

            // ローカルストレージクリア
            localStorage.clear()

            // サーバーから最新データを取得
            const serverItems = await loadServerCart()
            dispatch({ type: 'SET_ITEMS', payload: { items: serverItems, lastSynced: new Date() } })

            if (localItems.length > 0) {
                toast.success('カートが同期されました')
            }
        } catch (error) {
            console.error('カート同期エラー:', error)
            dispatch({ type: 'SET_ERROR', payload: 'カートの同期に失敗しました' })
        }
    }, [user, localStorage, verifyPrices, syncCartToServer, loadServerCart])

    // 価格検証付きカートリロード
    const reloadCart = useCallback(async () => {
        try {
            console.log('🛒 Manual cart reload with price verification')
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'SET_ERROR', payload: null })

            if (user) {
                const serverItems = await loadServerCart()
                const verifiedItems = await verifyPrices(serverItems)
                dispatch({ type: 'SET_ITEMS', payload: { items: verifiedItems, lastSynced: new Date() } })
            } else {
                const localItems = localStorage.get()
                // 未ログインでも価格検証を実行（セキュリティ強化）
                const verifiedItems = await verifyPrices(localItems)
                localStorage.set(verifiedItems) // 検証済みアイテムで更新
                dispatch({ type: 'SET_ITEMS', payload: { items: verifiedItems } })
            }
        } catch (error) {
            console.error('🛒 Manual reload error:', error)
            const errorMessage = error instanceof Error ? error.message : 'カートの読み込みに失敗しました'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [user, loadServerCart, verifyPrices, localStorage])

    // 初期化
    useEffect(() => {
        const initializeCart = async () => {
            try {
                console.log('🛒 Initializing improved cart, user:', !!user)
                dispatch({ type: 'SET_LOADING', payload: true })
                dispatch({ type: 'SET_ERROR', payload: null })

                if (user) {
                    // ログインユーザー: 同期 + サーバーカート読み込み
                    await syncCart()
                } else {
                    // 未ログインユーザー: ローカルカート読み込み
                    const localItems = localStorage.get()
                    dispatch({ type: 'SET_ITEMS', payload: { items: localItems } })
                }
            } catch (error) {
                console.error('🛒 Cart initialization error:', error)
                const errorMessage = error instanceof Error ? error.message : 'カートの初期化に失敗しました'
                dispatch({ type: 'SET_ERROR', payload: errorMessage })
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        }

        initializeCart()
    }, [user, syncCart, localStorage])

    return {
        ...state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncCart,
        reloadCart,
        verifyPrices, // セキュリティチェック用に公開
    }
}
