/**
 * カートページ
 */

"use client";

import { useCart } from "@/hooks/use-cart";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
	const {
		items,
		totalItems,
		totalPrice,
		isLoading,
		error,
		updateQuantity,
		removeFromCart,
		clearCart,
		reloadCart,
	} = useCart();

	const [isRefreshing, setIsRefreshing] = useState(false);

	// デバッグログ
	useEffect(() => {
		console.log("🛒 Cart page state:", {
			itemsLength: items.length,
			totalItems,
			totalPrice,
			isLoading,
			error,
			items: items.map((item) => ({
				id: item.id,
				productId: item.product.id,
				quantity: item.quantity,
			})),
		});
	}, [items, totalItems, totalPrice, isLoading, error]);

	// カートを手動でリフレッシュする関数
	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await reloadCart();
		} finally {
			setIsRefreshing(false);
		}
	};

	// ローディング状態
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					<div className="mb-8">
						<Skeleton className="h-8 w-32 mb-2" />
						<Skeleton className="h-4 w-64" />
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-4">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
						</div>
						<div>
							<Skeleton className="h-96 w-full" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// エラー状態
	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					<div className="mt-4 flex gap-4">
						<Button asChild>
							<Link href="/products">
								<ArrowLeft className="h-4 w-4 mr-2" />
								商品一覧に戻る
							</Link>
						</Button>
						<Button
							variant="outline"
							onClick={handleRefresh}
							disabled={isRefreshing}
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
							/>
							リフレッシュ
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// カートが空の場合
	if (items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto text-center">
					<div className="mb-8">
						<ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
						<h1 className="text-2xl font-bold mb-2">カートは空です</h1>
						<p className="text-muted-foreground">
							お気に入りの商品をカートに追加してショッピングを楽しみましょう！
						</p>
					</div>

					<Button asChild size="lg">
						<Link href="/products">
							<ShoppingCart className="h-5 w-5 mr-2" />
							商品を見る
						</Link>
					</Button>

					<div className="mt-4">
						<Button
							variant="outline"
							onClick={handleRefresh}
							disabled={isRefreshing}
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
							/>
							リフレッシュ
						</Button>
					</div>
				</div>
			</div>
		);
	}
	// 正常
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-6xl mx-auto">
				{/* ヘッダー */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-2">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/products">
								<ArrowLeft className="h-4 w-4 mr-1" />
								商品一覧
							</Link>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={isRefreshing}
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
							/>
							リフレッシュ
						</Button>
					</div>
					<h1 className="text-3xl font-bold">ショッピングカート</h1>
					<p className="text-muted-foreground">
						{totalItems}個の商品が入っています
					</p>
				</div>

				{/* カート内容 */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* カートアイテム一覧 */}
					<div className="lg:col-span-2">
						<div className="space-y-4">
							{items.map((item) => (
								<CartItemCard
									key={item.id}
									item={item}
									onUpdateQuantity={updateQuantity}
									onRemoveItem={removeFromCart}
									isLoading={isLoading}
								/>
							))}
						</div>
					</div>

					{/* カートサマリー */}
					<div>
						<CartSummary
							totalItems={totalItems}
							totalPrice={totalPrice}
							isLoading={isLoading}
							onClearCart={clearCart}
							className="sticky top-4"
						/>
					</div>
				</div>

				{/* おすすめ商品セクション（将来的に追加） */}
				<div className="mt-12">
					<h2 className="text-xl font-semibold mb-4">こちらもおすすめ</h2>
					<div className="bg-muted p-8 rounded-lg text-center">
						<p className="text-muted-foreground">
							おすすめ商品機能は今後実装予定です
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
