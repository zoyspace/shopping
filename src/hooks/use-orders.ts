"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus } from '@/types';
import type { CreateOrderInput } from '@/lib/validations';
import { toast } from 'sonner';

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    // ユーザーの注文履歴を取得
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('認証が必要です');
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    shipping_address:addresses!orders_shipping_address_id_fkey(
                        id,
                        line1,
                        line2,
                        city,
                        state,
                        postal_code,
                        country
                    ),
                    billing_address:addresses!orders_billing_address_id_fkey(
                        id,
                        line1,
                        line2,
                        city,
                        state,
                        postal_code,
                        country
                    ),
                    items:order_items(
                        id,
                        quantity,
                        price,
                        total,
                        product:products(
                            id,
                            name,
                            images:product_images(url, alt_text, is_main)
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // データをOrder型に変換（フィールド名の正規化）
            const transformedOrders = (data || []).map((order: Record<string, unknown>) => ({
                ...order,
                createdAt: (order.created_at as string) || (order.createdAt as string),
                updatedAt: (order.updated_at as string) || (order.updatedAt as string),
                shippingAddress: order.shipping_address ? {
                    ...(order.shipping_address as Record<string, unknown>),
                    postalCode: (order.shipping_address as Record<string, unknown>).postal_code,
                } : undefined,
                billingAddress: order.billing_address ? {
                    ...(order.billing_address as Record<string, unknown>),
                    postalCode: (order.billing_address as Record<string, unknown>).postal_code,
                } : undefined,
            })) as Order[];

            setOrders(transformedOrders);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '注文の取得に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // 注文を作成
    const createOrder = useCallback(async (orderData: CreateOrderInput): Promise<string | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('認証が必要です');
            }

            // 注文の合計金額を計算
            const total = orderData.items.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);

            // トランザクション内で注文と注文アイテムを作成
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    status: 'pending',
                    total,
                    currency: 'jpy',
                    shipping_address_id: orderData.shippingAddressId,
                    billing_address_id: orderData.billingAddressId || orderData.shippingAddressId,
                })
                .select('id')
                .single();

            if (orderError) {
                throw orderError;
            }

            // 注文アイテムを挿入
            const orderItems = orderData.items.map((item) => ({
                order_id: order.id,
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                throw itemsError;
            }

            // 在庫を減らす
            for (const item of orderData.items) {
                const { error: inventoryError } = await supabase.rpc('decrease_product_inventory', {
                    product_id: item.productId,
                    decrease_amount: item.quantity
                });

                if (inventoryError) {
                    console.error(`在庫更新エラー (商品ID: ${item.productId}):`, inventoryError);
                }
            }

            toast.success('注文が作成されました');
            await fetchOrders(); // 注文リストを更新
            return order.id;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '注文の作成に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [supabase, fetchOrders]);

    // 注文ステータスを更新
    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) {
                throw error;
            }

            toast.success('注文ステータスが更新されました');
            await fetchOrders(); // 注文リストを更新
            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '注文ステータスの更新に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [supabase, fetchOrders]);

    // 注文をキャンセル
    const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
        return updateOrderStatus(orderId, 'cancelled' as OrderStatus);
    }, [updateOrderStatus]);

    // 単一の注文を取得
    const fetchOrder = useCallback(async (orderId: string): Promise<Order | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    shipping_address:addresses!orders_shipping_address_id_fkey(
                        id,
                        line1,
                        line2,
                        city,
                        state,
                        postal_code,
                        country
                    ),
                    billing_address:addresses!orders_billing_address_id_fkey(
                        id,
                        line1,
                        line2,
                        city,
                        state,
                        postal_code,
                        country
                    ),
                    items:order_items(
                        id,
                        quantity,
                        price,
                        total,
                        product:products(
                            id,
                            name,
                            images:product_images(url, alt_text, is_main)
                        )
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error) {
                throw error;
            }

            // データを変換（フィールド名の正規化）
            const transformedOrder = {
                ...data,
                createdAt: data.created_at || data.createdAt,
                updatedAt: data.updated_at || data.updatedAt,
                shippingAddress: data.shipping_address ? {
                    ...data.shipping_address,
                    postalCode: data.shipping_address.postal_code,
                } : undefined,
                billingAddress: data.billing_address ? {
                    ...data.billing_address,
                    postalCode: data.billing_address.postal_code,
                } : undefined,
            } as Order;

            return transformedOrder;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '注文の取得に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        isLoading,
        error,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        fetchOrder,
    };
}
