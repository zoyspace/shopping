/**
 * カート管理用のカスタムフック
 * ローカルストレージとSupabaseの両方でカート状態を管理
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import { toast } from 'sonner'

export interface CartItem {
    id: string
    product: Product
    quantity: number
    addedAt: Date
}

interface CartState {
    items: CartItem[]
    totalItems: number
    totalPrice: number
    isLoading: boolean
    error: string | null
}

export function useCart() {
    const { user } = useAuth()
    const supabase = createClient()

    const [cart, setCart] = useState<CartState>({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: true,
        error: null,
    })

    // カート情報を計算
    const calculateCartTotals = useCallback((items: CartItem[]) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        return { totalItems, totalPrice }
    }, [])

    // ローカルストレージからカートを読み込み
    const loadLocalCart = useCallback((): CartItem[] => {
        try {
            const stored = localStorage.getItem('shopping-cart')
            console.log('🛒 Loading local cart, stored data:', stored);

            if (!stored) return []

            const parsed = JSON.parse(stored) as CartItem[]
            const result = parsed.map((item) => ({
                ...item,
                addedAt: new Date(item.addedAt),
            }))

            console.log('🛒 Local cart loaded:', result);
            return result
        } catch (error) {
            console.error('ローカルカートの読み込みエラー:', error)
            return []
        }
    }, [])

    // ローカルストレージにカートを保存
    const saveLocalCart = useCallback((items: CartItem[]) => {
        try {
            console.log('🛒 Saving local cart:', items);
            localStorage.setItem('shopping-cart', JSON.stringify(items))
            console.log('🛒 Local cart saved successfully');
        } catch (error) {
            console.error('ローカルカートの保存エラー:', error)
        }
    }, [])

    // Supabaseからカートを読み込み
    const loadServerCart = useCallback(async (): Promise<CartItem[]> => {
        if (!user) return []

        try {
            console.log('🛒 Loading server cart for user:', user.id);

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
                console.error('🛒 Server cart load error:', error);
                throw new Error(`カート読み込みエラー: ${error.message}`)
            }

            console.log('🛒 Raw server cart data:', data);

            const result = data?.map(item => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                }
            }) || []

            console.log('🛒 Server cart loaded:', result);
            return result
        } catch (error) {
            console.error('サーバーカートの読み込みエラー:', error)
            throw error
        }
    }, [user, supabase])

    // Supabaseにカートを保存
    const saveServerCart = useCallback(async (productId: string, quantity: number) => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('cart_items')
                .upsert({
                    user_id: user.id,
                    product_id: productId,
                    quantity,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,product_id'
                })

            if (error) {
                throw new Error(`カート保存エラー: ${error.message}`)
            }
        } catch (error) {
            console.error('サーバーカート保存エラー:', error)
            throw error
        }
    }, [user, supabase])    // カートアイテムを追加
    const addToCart = useCallback(async (product: Product, quantity = 1) => {
        console.log('🛒 addToCart called:', { productId: product.id, productName: product.name, quantity });

        try {
            // 在庫チェック
            if (product.inventory < quantity) {
                throw new Error('在庫が不足しています')
            }

            console.log('🛒 Current cart state before add:', { items: cart.items.length, user: !!user });

            if (user) {
                console.log('🛒 Adding to server cart for user:', user.id);

                // ログインユーザー: サーバーで処理
                const { data: existingCartItem } = await supabase
                    .from('cart_items')
                    .select('quantity')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .maybeSingle()

                console.log('🛒 Existing cart item:', existingCartItem);

                const currentQuantity = existingCartItem?.quantity || 0
                const newQuantity = currentQuantity + quantity

                // 在庫上限チェック
                if (newQuantity > product.inventory) {
                    throw new Error(`在庫は${product.inventory}個までです`)
                }

                // サーバーに保存
                const { error: upsertError } = await supabase
                    .from('cart_items')
                    .upsert({
                        user_id: user.id,
                        product_id: product.id,
                        quantity: newQuantity,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'user_id,product_id'
                    })

                if (upsertError) {
                    console.error('🛒 Upsert error:', upsertError);
                    throw new Error(`保存エラー: ${upsertError.message}`)
                }

                console.log('🛒 Item upserted successfully, reloading cart...');

                // サーバーから最新データを取得して状態を即座に更新
                const serverItems = await loadServerCart()
                const totals = calculateCartTotals(serverItems)

                console.log('🛒 Server cart loaded:', serverItems);
                console.log('🛒 Updating cart state with:', { items: serverItems.length, totals });

                // 状態を同期的に更新
                setCart(prev => ({
                    ...prev,
                    items: serverItems,
                    ...totals,
                    error: null,
                }))
            } else {
                console.log('🛒 Adding to local cart');

                // 未ログインユーザー: ローカル処理
                const localItems = loadLocalCart()
                const existingItem = localItems.find(item => item.product.id === product.id)
                const currentQuantity = existingItem?.quantity || 0
                const newQuantity = currentQuantity + quantity

                // 在庫上限チェック
                if (newQuantity > product.inventory) {
                    throw new Error(`在庫は${product.inventory}個までです`)
                }

                let finalItems: CartItem[]
                if (existingItem) {
                    // 既存アイテムの数量を更新
                    finalItems = localItems.map(item =>
                        item.product.id === product.id
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                } else {
                    // 新しいアイテムを追加
                    const newItem: CartItem = {
                        id: `local-${Date.now()}`,
                        product,
                        quantity,
                        addedAt: new Date(),
                    }
                    finalItems = [newItem, ...localItems]
                }

                // ローカルストレージに保存
                saveLocalCart(finalItems)
                console.log('🛒 Local cart saved:', finalItems);

                // 状態を更新
                const totals = calculateCartTotals(finalItems)
                console.log('🛒 Updating local cart state with:', { items: finalItems.length, totals });

                setCart(prev => ({
                    ...prev,
                    items: finalItems,
                    ...totals,
                    error: null,
                }))
            }

            console.log('🛒 Cart state updated successfully');
            toast.success(`${product.name}をカートに追加しました`)
        } catch (error) {
            console.error('🛒 addToCart error:', error);
            const errorMessage = error instanceof Error ? error.message : 'カートへの追加に失敗しました'
            setCart(prev => ({ ...prev, error: errorMessage }))
            toast.error(errorMessage)
            throw error
        }
    }, [user, supabase, loadServerCart, loadLocalCart, saveLocalCart, calculateCartTotals])

    // カートアイテムの数量を更新
    const updateQuantity = useCallback(async (productId: string, quantity: number) => {
        try {
            if (quantity <= 0) {
                await removeFromCart(productId)
                return
            }

            // 在庫チェック
            const item = cart.items.find(item => item.product.id === productId)
            if (!item) {
                throw new Error('カートにそのアイテムが見つかりません')
            }

            if (quantity > item.product.inventory) {
                throw new Error(`在庫は${item.product.inventory}個までです`)
            }

            const updatedItems = cart.items.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )

            // サーバーまたはローカルストレージに保存
            if (user) {
                await saveServerCart(productId, quantity)
                // サーバーから最新データを再取得
                const serverItems = await loadServerCart()
                const totals = calculateCartTotals(serverItems)
                setCart(prev => ({
                    ...prev,
                    items: serverItems,
                    ...totals,
                    error: null,
                }))
            } else {
                saveLocalCart(updatedItems)
                const totals = calculateCartTotals(updatedItems)
                setCart(prev => ({
                    ...prev,
                    items: updatedItems,
                    ...totals,
                    error: null,
                }))
            }

            toast.success('数量を更新しました')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '数量の更新に失敗しました'
            setCart(prev => ({ ...prev, error: errorMessage }))
            toast.error(errorMessage)
        }
    }, [cart.items, user, saveServerCart, loadServerCart, saveLocalCart, calculateCartTotals])

    // カートからアイテムを削除
    const removeFromCart = useCallback(async (productId: string) => {
        try {
            const updatedItems = cart.items.filter(item => item.product.id !== productId)

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
            } else {
                // ローカルストレージから削除
                saveLocalCart(updatedItems)
            }

            const totals = calculateCartTotals(updatedItems)
            setCart(prev => ({
                ...prev,
                items: updatedItems,
                ...totals,
                error: null,
            }))

            toast.success('カートから削除しました')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '削除に失敗しました'
            setCart(prev => ({ ...prev, error: errorMessage }))
            toast.error(errorMessage)
        }
    }, [cart.items, user, supabase, saveLocalCart, calculateCartTotals])

    // カートをクリア
    const clearCart = useCallback(async () => {
        try {
            if (user) {
                // サーバーからクリア
                const { error } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)

                if (error) {
                    throw new Error(`クリアエラー: ${error.message}`)
                }
            } else {
                // ローカルストレージからクリア
                localStorage.removeItem('shopping-cart')
            }

            setCart(prev => ({
                ...prev,
                items: [],
                totalItems: 0,
                totalPrice: 0,
                error: null,
            }))

            toast.success('カートをクリアしました')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'クリアに失敗しました'
            setCart(prev => ({ ...prev, error: errorMessage }))
            toast.error(errorMessage)
        }
    }, [user, supabase])

    // カートを同期（ローカル→サーバー）
    const syncCart = useCallback(async () => {
        if (!user) return

        try {
            const localItems = loadLocalCart()
            if (localItems.length === 0) return

            // ローカルのアイテムをサーバーに移行
            for (const item of localItems) {
                await saveServerCart(item.product.id, item.quantity)
            }

            // ローカルストレージをクリア
            localStorage.removeItem('shopping-cart')

            // サーバーから最新データを取得
            const serverItems = await loadServerCart()
            const totals = calculateCartTotals(serverItems)

            setCart(prev => ({
                ...prev,
                items: serverItems,
                ...totals,
                error: null,
            }))

            if (localItems.length > 0) {
                toast.success('カートが同期されました')
            }
        } catch (error) {
            console.error('カート同期エラー:', error)
        }
    }, [user, loadLocalCart, saveServerCart, loadServerCart, calculateCartTotals])

    // 初期化とデータ読み込み
    useEffect(() => {
        const initializeCart = async () => {
            try {
                console.log('🛒 Initializing cart, user:', !!user);
                setCart(prev => ({ ...prev, isLoading: true, error: null }))

                if (user) {
                    console.log('🛒 User logged in, loading server cart and syncing...');
                    // ログインユーザー: サーバーカートを読み込み＋同期
                    await syncCart()

                    // 同期後に再度サーバーカートを読み込んで確実に最新状態にする
                    const serverItems = await loadServerCart()
                    const totals = calculateCartTotals(serverItems)

                    console.log('🛒 Final server cart after sync:', serverItems);

                    setCart(prev => ({
                        ...prev,
                        items: serverItems,
                        ...totals,
                        isLoading: false,
                        error: null,
                    }))
                } else {
                    console.log('🛒 User not logged in, loading local cart...');
                    // 未ログインユーザー: ローカルカートを読み込み
                    const localItems = loadLocalCart()
                    const totals = calculateCartTotals(localItems)

                    console.log('🛒 Local cart loaded:', localItems);

                    setCart(prev => ({
                        ...prev,
                        items: localItems,
                        ...totals,
                        isLoading: false,
                        error: null,
                    }))
                }
            } catch (error) {
                console.error('🛒 Cart initialization error:', error);
                const errorMessage = error instanceof Error ? error.message : 'カートの初期化に失敗しました'
                setCart(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }))
            }
        }

        initializeCart()
    }, [user, syncCart, loadLocalCart, loadServerCart, calculateCartTotals])

    // カートを手動でリロード
    const reloadCart = useCallback(async () => {
        try {
            console.log('🛒 Manual cart reload triggered');
            setCart(prev => ({ ...prev, isLoading: true, error: null }))

            if (user) {
                const serverItems = await loadServerCart()
                const totals = calculateCartTotals(serverItems)

                console.log('🛒 Manual reload - server cart:', serverItems);

                setCart(prev => ({
                    ...prev,
                    items: serverItems,
                    ...totals,
                    isLoading: false,
                    error: null,
                }))
            } else {
                const localItems = loadLocalCart()
                const totals = calculateCartTotals(localItems)

                console.log('🛒 Manual reload - local cart:', localItems);

                setCart(prev => ({
                    ...prev,
                    items: localItems,
                    ...totals,
                    isLoading: false,
                    error: null,
                }))
            }
        } catch (error) {
            console.error('🛒 Manual reload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'カートの読み込みに失敗しました'
            setCart(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }))
        }
    }, [user, loadServerCart, loadLocalCart, calculateCartTotals])

    return {
        ...cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncCart,
        reloadCart,
    }
}
