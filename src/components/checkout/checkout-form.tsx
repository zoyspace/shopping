"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutAddressForm } from "./checkout-address-form";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { toast } from "sonner";
import type { Address } from "@/types";

export function CheckoutForm() {
	const router = useRouter();
        const { items, totalPrice, isLoading } = useCart();
	const { addresses, getDefaultAddress, fetchAddresses } = useAddresses();

	const [selectedShippingAddress, setSelectedShippingAddress] =
		useState<Address | null>(null);
	const [selectedBillingAddress, setSelectedBillingAddress] =
		useState<Address | null>(null);
	const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);

	// 住所データが更新されたときにデフォルト住所を設定
	useEffect(() => {
		const defaultAddress = getDefaultAddress();
		if (defaultAddress) {
			setSelectedShippingAddress(defaultAddress);
			setSelectedBillingAddress(defaultAddress);
		} else if (addresses.length > 0) {
			// デフォルト住所がない場合は最初の住所を選択
			setSelectedShippingAddress(addresses[0]);
			setSelectedBillingAddress(addresses[0]);
		}
	}, [addresses, getDefaultAddress]);

	// デバッグ情報
	console.log("🛒 CheckoutForm Debug:", {
		itemsCount: items.length,
		totalPrice,
		selectedShippingAddress: !!selectedShippingAddress,
		isProcessing,
		addresses: addresses.length,
		defaultAddress: !!getDefaultAddress(),
		addressesData: addresses.map((addr) => ({
			id: addr.id,
			isDefault: addr.isDefault,
		})),
	});

	const handleStripeCheckout = async () => {
		if (!selectedShippingAddress) {
			toast.error("配送先住所を選択してください");
			return;
		}

		if (items.length === 0) {
			toast.error("カートが空です");
			return;
		}

		setIsProcessing(true);

		try {
			// Stripe Checkout セッションを作成
			const response = await fetch("/api/stripe/create-checkout-session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cartItems: items,
					shippingAddress: selectedShippingAddress,
					metadata: {
						billing_address_id: useShippingAsBilling
							? selectedShippingAddress.id
							: selectedBillingAddress?.id || selectedShippingAddress.id,
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "決済セッションの作成に失敗しました",
				);
			}

			const { url } = await response.json();

			if (url) {
				// Stripe Checkoutページにリダイレクト
				window.location.href = url;
			} else {
				throw new Error("決済URLの取得に失敗しました");
			}
		} catch (error) {
			console.error("Stripe checkout error:", error);
			toast.error(
				error instanceof Error ? error.message : "決済の開始に失敗しました",
			);
		} finally {
			setIsProcessing(false);
		}
	};

        if (isLoading) {
                return (
                        <Card>
                                <CardHeader>
                                        <CardTitle className="text-center">カート情報を読み込み中...</CardTitle>
                                </CardHeader>
                                <CardContent>
                                        <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                        </div>
                                </CardContent>
                        </Card>
                );
        }

        if (items.length === 0) {
                return (
                        <Card>
                                <CardContent className="py-8 text-center">
                                        <p className="text-muted-foreground mb-4">カートが空です</p>
                                        <Button onClick={() => router.push("/products")}>商品を見る</Button>
                                </CardContent>
                        </Card>
                );
        }

	// 住所が存在しない場合
	if (addresses.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center">
					<p className="text-muted-foreground mb-4">
						配送先住所を追加してください
					</p>
					<p className="text-sm text-gray-600 mb-4">
						決済を行うには配送先住所が必要です
					</p>
					<Button onClick={() => router.push("/profile")}>
						プロフィール設定へ
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-8 lg:grid-cols-2">
			{/* 配送情報 */}
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>配送先住所</CardTitle>
					</CardHeader>
					<CardContent>
						<CheckoutAddressForm
							addresses={addresses}
							selectedAddress={selectedShippingAddress}
							onAddressSelect={setSelectedShippingAddress}
							onAddressAdded={fetchAddresses}
							type="shipping"
						/>
					</CardContent>
				</Card>

				{/* 請求先住所 */}
				<Card>
					<CardHeader>
						<CardTitle>請求先住所</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="useShippingAsBilling"
								checked={useShippingAsBilling}
								onChange={(e) => setUseShippingAsBilling(e.target.checked)}
								className="h-4 w-4"
							/>
							<label htmlFor="useShippingAsBilling" className="text-sm">
								配送先住所と同じ
							</label>
						</div>

						{!useShippingAsBilling && (
							<CheckoutAddressForm
								addresses={addresses}
								selectedAddress={selectedBillingAddress}
								onAddressSelect={setSelectedBillingAddress}
								onAddressAdded={fetchAddresses}
								type="billing"
							/>
						)}
					</CardContent>
				</Card>
			</div>

			{/* 注文サマリー */}
			<div className="space-y-6">
				<CheckoutOrderSummary items={items} total={totalPrice} />

				<Card>
					<CardContent className="pt-6">
						{/* デバッグ情報 */}
						<div className="mb-4 p-2 bg-gray-100 rounded text-xs">
							<p>カート: {items.length}個</p>
							<p>配送先: {selectedShippingAddress ? "選択済み" : "未選択"}</p>
							<p>処理中: {isProcessing ? "はい" : "いいえ"}</p>
							<p>
								ボタン無効:{" "}
								{isProcessing || !selectedShippingAddress ? "はい" : "いいえ"}
							</p>
						</div>

						<Button
							size="lg"
							className="w-full"
							onClick={handleStripeCheckout}
							disabled={isProcessing || !selectedShippingAddress}
						>
							{isProcessing
								? "決済準備中..."
								: `Stripeで決済する（¥${totalPrice.toLocaleString()}）`}
						</Button>
						<p className="text-xs text-muted-foreground text-center mt-2">
							Stripeで安全に決済処理を行います
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
