"use client";

import { useEffect, useState, useMemo } from "react";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import type { Order } from "@/types";
import { OrderStatus } from "@/types";

interface OrderDetailPageClientProps {
	orderId: string;
}

export function OrderDetailPageClient({ orderId }: OrderDetailPageClientProps) {
	const { fetchOrder, cancelOrder } = useOrders();
	const [order, setOrder] = useState<Order | null>(null);
	const [isLoadingOrder, setIsLoadingOrder] = useState(true);
	const [isCanceling, setIsCanceling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasInitialized, setHasInitialized] = useState(false);

	useEffect(() => {
		const loadOrder = async () => {
			try {
				setIsLoadingOrder(true);
				setError(null);
				const orderData = await fetchOrder(orderId);
				if (orderData) {
					setOrder(orderData);
				} else {
					setError("注文が見つかりませんでした");
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "注文の取得に失敗しました",
				);
			} finally {
				setIsLoadingOrder(false);
				setHasInitialized(true);
			}
		};

		if (!hasInitialized) {
			loadOrder();
		}
	}, [orderId, fetchOrder, hasInitialized]);

	const handleCancelOrder = async () => {
		if (!order || order.status !== "pending") return;

		setIsCanceling(true);
		const success = await cancelOrder(order.id);
		if (success && order) {
			setOrder({ ...order, status: OrderStatus.CANCELLED });
		}
		setIsCanceling(false);
	};

	if (isLoadingOrder) {
		return (
			<div className="container max-w-4xl mx-auto py-8 min-h-screen">
				<div className="flex items-center space-x-2 mb-8">
					<Skeleton className="h-6 w-6" />
					<Skeleton className="h-8 w-48" />
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent className="space-y-4">
								{[...Array(3)].map((_, i) => (
									<div
										key={`skeleton-${
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											i
										}`}
										className="flex items-center space-x-3"
									>
										<Skeleton className="h-16 w-16 rounded-md" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-3/4" />
											<Skeleton className="h-3 w-1/2" />
										</div>
										<Skeleton className="h-4 w-16" />
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-24" />
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	// エラー状態の処理
	if (error) {
		return (
			<div className="container max-w-4xl mx-auto py-8 min-h-screen">
				<div className="flex items-center space-x-4 mb-8">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/orders">
							<ArrowLeft className="h-4 w-4 mr-2" />
							注文履歴に戻る
						</Link>
					</Button>
				</div>
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-destructive mb-4">{error}</p>
						<Button onClick={() => window.location.reload()}>再試行</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// 注文が見つからない場合
	if (!order) {
		return (
			<div className="container max-w-4xl mx-auto py-8 min-h-screen">
				<div className="flex items-center space-x-4 mb-8">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/orders">
							<ArrowLeft className="h-4 w-4 mr-2" />
							注文履歴に戻る
						</Link>
					</Button>
				</div>
				<Card>
					<CardContent className="py-8 text-center">
						<Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">注文が見つかりません</h3>
						<p className="text-muted-foreground">
							指定された注文は存在しないか、アクセス権限がありません。
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// 注文の日付処理（型の不一致に対応）
	const createdAtValue =
		(order as Order & { created_at?: string }).created_at || order.createdAt;
	const orderDate = new Date(createdAtValue);
	const isValidDate = !Number.isNaN(orderDate.getTime());

	const timeAgo = isValidDate
		? formatDistanceToNow(orderDate, {
				addSuffix: true,
				locale: ja,
			})
		: "日付不明";

	// 金額計算
	const subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
	const shipping = 0; // 配送料無料
	const tax = Math.floor(subtotal * 0.1);
	const total = subtotal + shipping + tax;

	return (
		<div className="container max-w-4xl mx-auto py-8 min-h-screen">
			{/* ヘッダー */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center space-x-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/orders">
							<ArrowLeft className="h-4 w-4 mr-2" />
							注文履歴に戻る
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold">注文詳細</h1>
						<p className="text-muted-foreground">
							注文番号: {order.id.slice(0, 8)}...
						</p>
					</div>
				</div>
				<OrderStatusBadge status={order.status} />
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* メインコンテンツ */}
				<div className="lg:col-span-2 space-y-6">
					{/* 注文情報 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Calendar className="h-5 w-5" />
								<span>注文情報</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">注文日時</p>
									<p className="font-medium">
										{isValidDate
											? orderDate.toLocaleDateString("ja-JP", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})
											: "日付不明"}
									</p>
									<p className="text-xs text-muted-foreground">{timeAgo}</p>
								</div>
								<div>
									<p className="text-muted-foreground">ステータス</p>
									<OrderStatusBadge status={order.status} />
								</div>
								<div>
									<p className="text-muted-foreground">合計金額</p>
									<p className="text-lg font-semibold">
										¥{order.total.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">支払い方法</p>
									<p className="font-medium">クレジットカード</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 注文アイテム */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Package className="h-5 w-5" />
								<span>注文商品</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{order.items.map((item) => {
								const mainImage = item.product?.images?.find(
									(img) => img.isMain,
								);
								const imageUrl = mainImage?.url || "/placeholder.jpg";

								return (
									<div
										key={item.id}
										className="flex items-start space-x-4 p-4 border rounded-lg"
									>
										<img
											src={imageUrl}
											alt={item.product?.name || "商品"}
											className="h-20 w-20 rounded-md object-cover"
										/>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium truncate">
												{item.product?.name || "商品名不明"}
											</h4>
											<p className="text-sm text-muted-foreground mb-2">
												{item.product?.description}
											</p>
											<div className="flex justify-between items-center">
												<div className="text-sm">
													<span className="text-muted-foreground">数量:</span>
													<span className="ml-1 font-medium">
														{item.quantity}
													</span>
													<span className="text-muted-foreground ml-3">
														単価:
													</span>
													<span className="ml-1 font-medium">
														¥{item.price.toLocaleString()}
													</span>
												</div>
												<p className="text-lg font-semibold">
													¥{item.total.toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>

				{/* サイドバー */}
				<div className="space-y-6">
					{/* 配送先住所 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<MapPin className="h-5 w-5" />
								<span>配送先</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{order.shippingAddress ? (
								<div className="text-sm space-y-1">
									<p className="font-medium">
										〒{order.shippingAddress.postalCode}
									</p>
									<p>
										{order.shippingAddress.state} {order.shippingAddress.city}
									</p>
									<p>{order.shippingAddress.line1}</p>
									{order.shippingAddress.line2 && (
										<p>{order.shippingAddress.line2}</p>
									)}
									<p className="text-muted-foreground">
										{order.shippingAddress.country}
									</p>
								</div>
							) : (
								<p className="text-muted-foreground">配送先情報がありません</p>
							)}
						</CardContent>
					</Card>

					{/* 金額詳細 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<CreditCard className="h-5 w-5" />
								<span>金額詳細</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span>小計</span>
								<span>¥{subtotal.toLocaleString()}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>配送料</span>
								<span>{shipping === 0 ? "無料" : `¥${shipping}`}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>消費税（10%）</span>
								<span>¥{tax.toLocaleString()}</span>
							</div>
							<Separator />
							<div className="flex justify-between font-semibold">
								<span>合計</span>
								<span>¥{total.toLocaleString()}</span>
							</div>
						</CardContent>
					</Card>

					{/* アクション */}
					{order.status === "pending" && (
						<Card>
							<CardContent className="pt-6">
								<Button
									variant="destructive"
									className="w-full"
									onClick={handleCancelOrder}
									disabled={isCanceling}
								>
									{isCanceling ? "キャンセル中..." : "注文をキャンセル"}
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
