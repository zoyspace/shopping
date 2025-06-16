"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/types';
import type { AddressInput } from '@/lib/validations';
import { toast } from 'sonner';

export function useAddresses() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    // ユーザーの住所一覧を取得
    const fetchAddresses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('認証が必要です');
            }

            const { data, error } = await supabase
                .from('addresses')
                .select(`
                    id,
                    user_id,
                    line1,
                    line2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default,
                    created_at,
                    updated_at
                `)
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // データベースのフィールド名を型定義に合わせて変換
            const transformedData = (data || []).map(address => ({
                id: address.id,
                userId: address.user_id,
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                postalCode: address.postal_code,
                country: address.country,
                isDefault: address.is_default,
                createdAt: address.created_at,
                updatedAt: address.updated_at,
            }));

            setAddresses(transformedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '住所の取得に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // 住所を作成
    const createAddress = async (addressData: AddressInput): Promise<string | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('認証が必要です');
            }

            const { data, error } = await supabase
                .from('addresses')
                .insert({
                    user_id: user.id,
                    line1: addressData.line1,
                    line2: addressData.line2,
                    city: addressData.city,
                    state: addressData.state,
                    postal_code: addressData.postalCode,
                    country: addressData.country,
                    is_default: false,
                })
                .select('id')
                .single();

            if (error) {
                throw error;
            }

            await fetchAddresses(); // 住所リストを更新
            return data.id;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '住所の追加に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // 住所を更新
    const updateAddress = async (addressId: string, addressData: AddressInput): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const { error } = await supabase
                .from('addresses')
                .update({
                    line1: addressData.line1,
                    line2: addressData.line2,
                    city: addressData.city,
                    state: addressData.state,
                    postal_code: addressData.postalCode,
                    country: addressData.country,
                })
                .eq('id', addressId);

            if (error) {
                throw error;
            }

            toast.success('住所が更新されました');
            await fetchAddresses(); // 住所リストを更新
            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '住所の更新に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 住所を削除
    const deleteAddress = async (addressId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

            if (error) {
                throw error;
            }

            toast.success('住所が削除されました');
            await fetchAddresses(); // 住所リストを更新
            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '住所の削除に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // デフォルト住所を設定
    const setDefaultAddress = async (addressId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('認証が必要です');
            }

            // まず全ての住所のデフォルトを解除
            const { error: clearError } = await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);

            if (clearError) {
                throw clearError;
            }

            // 指定された住所をデフォルトに設定
            const { error: updateError } = await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', addressId);

            if (updateError) {
                throw updateError;
            }

            toast.success('デフォルト住所が設定されました');
            await fetchAddresses(); // 住所リストを更新
            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'デフォルト住所の設定に失敗しました';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // デフォルト住所を取得
    const getDefaultAddress = (): Address | null => {
        return addresses.find(address => address.isDefault) || null;
    };

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    return {
        addresses,
        isLoading,
        error,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress,
    };
}
