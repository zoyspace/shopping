'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category, ProductImage } from '@/types'

interface UseProductsOptions {
    categoryId?: string
    searchQuery?: string
    sortBy?: string
    limit?: number
}

interface ProductImageRow {
    id: string
    url: string
    alt_text: string
    is_main: boolean
    sort_order: number
}

interface ProductCategoryRow {
    id: string
    name: string
    slug: string
}

// デフォルトのオプションオブジェクトを外部で定義（毎回新しいインスタンスを作らないため）
const DEFAULT_OPTIONS: UseProductsOptions = {}

export function useProducts(options: UseProductsOptions = DEFAULT_OPTIONS) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // オプションをメモ化して安定化
    const memoizedOptions = useMemo(() => ({
        categoryId: options.categoryId,
        searchQuery: options.searchQuery,
        sortBy: options.sortBy,
        limit: options.limit
    }), [options.categoryId, options.searchQuery, options.sortBy, options.limit])

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const supabase = createClient()
            let query = supabase
                .from('products')
                .select(`
          *,
          category:categories(id, name, slug),
          images:product_images(
            id,
            url,
            alt_text,
            is_main,
            sort_order
          )
        `)
                .eq('is_active', true)

            // カテゴリフィルタ
            if (memoizedOptions.categoryId) {
                query = query.eq('category_id', memoizedOptions.categoryId)
            }

            // 検索クエリ
            if (memoizedOptions.searchQuery) {
                query = query.or(`name.ilike.%${memoizedOptions.searchQuery}%,description.ilike.%${memoizedOptions.searchQuery}%`)
            }

            // ソート
            switch (memoizedOptions.sortBy) {
                case 'name-asc':
                    query = query.order('name', { ascending: true })
                    break
                case 'name-desc':
                    query = query.order('name', { ascending: false })
                    break
                case 'price-asc':
                    query = query.order('price', { ascending: true })
                    break
                case 'price-desc':
                    query = query.order('price', { ascending: false })
                    break
                default:
                    query = query.order('created_at', { ascending: false })
            }

            // 制限
            if (memoizedOptions.limit) {
                query = query.limit(memoizedOptions.limit)
            }

            const { data, error: supabaseError } = await query

            if (supabaseError) {
                throw supabaseError
            }

            // 型を合わせるためにデータを整形
            const formattedProducts: Product[] = data?.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                currency: product.currency,
                inventory: product.inventory,
                categoryId: product.category_id,
                category: product.category ? {
                    id: (product.category as ProductCategoryRow).id,
                    name: (product.category as ProductCategoryRow).name,
                    slug: (product.category as ProductCategoryRow).slug,
                    description: '',
                    isActive: true,
                    createdAt: '',
                    updatedAt: ''
                } : undefined,
                images: product.images?.map((img: ProductImageRow) => ({
                    id: img.id,
                    productId: product.id,
                    url: img.url,
                    altText: img.alt_text,
                    isMain: img.is_main,
                    sortOrder: img.sort_order,
                    createdAt: ''
                })) || [],
                image_url: product.images?.find((img: ProductImageRow) => img.is_main)?.url || product.images?.[0]?.url,
                isActive: product.is_active,
                stripeProductId: product.stripe_product_id,
                stripePriceId: product.stripe_price_id,
                createdAt: product.created_at,
                updatedAt: product.updated_at
            })) || []

            setProducts(formattedProducts)
        } catch (err) {
            console.error('商品取得エラー:', err)
            setError(err instanceof Error ? err.message : '商品の取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }, [memoizedOptions])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(productId: string) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProduct = useCallback(async () => {
        if (!productId) return

        try {
            setLoading(true)
            setError(null)

            const supabase = createClient()
            const { data, error: supabaseError } = await supabase
                .from('products')
                .select(`
          *,
          category:categories(id, name, slug),
          images:product_images(
            id,
            url,
            alt_text,
            is_main,
            sort_order
          )
        `)
                .eq('id', productId)
                .eq('is_active', true)
                .single()

            if (supabaseError) {
                throw supabaseError
            }

            // 型を合わせるためにデータを整形
            const formattedProduct: Product = {
                id: data.id,
                name: data.name,
                description: data.description,
                price: data.price,
                currency: data.currency,
                inventory: data.inventory, // スキーマに合わせて修正
                categoryId: data.category_id,
                category: data.category ? {
                    id: (data.category as ProductCategoryRow).id,
                    name: (data.category as ProductCategoryRow).name,
                    slug: (data.category as ProductCategoryRow).slug,
                    description: '',
                    isActive: true,
                    createdAt: '',
                    updatedAt: ''
                } : undefined,
                images: data.images?.map((img: ProductImageRow) => ({
                    id: img.id,
                    productId: data.id,
                    url: img.url,
                    altText: img.alt_text,
                    isMain: img.is_main,
                    sortOrder: img.sort_order,
                    createdAt: ''
                })).sort((a: ProductImage, b: ProductImage) => a.sortOrder - b.sortOrder) || [],
                image_url: data.images?.find((img: ProductImageRow) => img.is_main)?.url || data.images?.[0]?.url,
                isActive: data.is_active,
                stripeProductId: data.stripe_product_id,
                stripePriceId: data.stripe_price_id,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            }

            setProduct(formattedProduct)
        } catch (err) {
            console.error('商品取得エラー:', err)
            setError(err instanceof Error ? err.message : '商品の取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }, [productId])

    useEffect(() => {
        fetchProduct()
    }, [fetchProduct])

    return { product, loading, error, refetch: fetchProduct }
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const supabase = createClient()
            const { data, error: supabaseError } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (supabaseError) {
                throw supabaseError
            }

            const formattedCategories: Category[] = data?.map(category => ({
                id: category.id,
                name: category.name,
                description: category.description,
                slug: category.slug,
                isActive: category.is_active,
                createdAt: category.created_at,
                updatedAt: category.updated_at
            })) || []

            setCategories(formattedCategories)
        } catch (err) {
            console.error('カテゴリ取得エラー:', err)
            setError(err instanceof Error ? err.message : 'カテゴリの取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    return { categories, loading, error, refetch: fetchCategories }
}
