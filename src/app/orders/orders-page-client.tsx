"use client";

import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { ShoppingBag, Package, Receipt } from "lucide-react";
import type { Order } from "@/types";

export function OrdersPageClient() {
	const { orders, isLoading, error } = useOrders();

	if (isLoading) {
		return (
			<div className="container max-w-4xl mx-auto py-8 min-h-screen">
				<h1 className="text-3xl font-bold mb-8">注文履歴</h1>
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Card key={i}>
							<CardContent className="p-6">
								<Skeleton className="h-4 w-1/4 mb-2" />
								<Skeleton className="h-6 w-1/2 mb-4" />
								<div className="grid grid-cols-2 gap-4">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container max-w-4xl mx-auto py-8 min-h-screen">
				<h1 className="text-3xl font-bold mb-8">注文履歴</h1>
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-destructive mb-4">{error}</p>
						<Button onClick={() => window.location.reload()}>再試行</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (orders.length === 0) {
		return (
			<div className="container max-w-4xl mx-auto py-8 min-h-screen">
				<h1 className="text-3xl font-bold mb-8">注文履歴</h1>
				<Card>
					<CardContent className="py-12 text-center">
						<Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">注文履歴がありません</h3>
						<p className="text-muted-foreground mb-6">
							まだ注文をされていません。商品を見てみましょう。
						</p>
						<Button asChild>
							<Link href="/products">
								<ShoppingBag className="h-4 w-4 mr-2" />
								商品を見る
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-4xl mx-auto py-8 min-h-screen">
			<div className="flex items-center space-x-2 mb-8">
				<Receipt className="h-8 w-8" />
				<h1 className="text-3xl font-bold">注文履歴</h1>
			</div>

			<div className="space-y-6">
				{orders.map((order) => (
					<OrderCard key={order.id} order={order} />
				))}
			</div>
		</div>
	);
}

interface OrderCardProps {
	order: Order;
}

function OrderCard({ order }: OrderCardProps) {
	// created_atフィールドから日付を取得（型の不一致を回避）
	const createdAtValue =
		(order as Order & { created_at?: string }).created_at || order.createdAt;
	const orderDate = new Date(createdAtValue);

	// 日付の有効性をチェック
	const isValidDate = !Number.isNaN(orderDate.getTime());

	const timeAgo = isValidDate
		? formatDistanceToNow(orderDate, {
				addSuffix: true,
				locale: ja,
			})
		: "日付不明";

	return (
		<Card className="overflow-hidden">
			<CardHeader className="bg-muted/50">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-lg">
							注文番号: {order.id.slice(0, 8)}...
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							{isValidDate ? orderDate.toLocaleDateString("ja-JP") : "日付不明"}{" "}
							({timeAgo})
						</p>
					</div>
					<div className="text-right">
						<OrderStatusBadge status={order.status} />
						<p className="text-lg font-semibold mt-1">
							¥{order.total.toLocaleString()}
						</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-6">
				{/* 注文アイテム */}
				<div className="space-y-3 mb-6">
					{order.items.slice(0, 3).map((item) => {
						const mainImage = item.product?.images?.find((img) => img.isMain);
						const imageUrl = mainImage?.url || "/placeholder.jpg";

						return (
							<div key={item.id} className="flex items-center space-x-3">
								<img
									src={imageUrl}
									alt={item.product?.name || "商品"}
									className="h-12 w-12 rounded-md object-cover"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">
										{item.product?.name || "商品名不明"}
									</p>
									<p className="text-xs text-muted-foreground">
										数量: {item.quantity} | 単価: ¥{item.price.toLocaleString()}
									</p>
								</div>
								<p className="text-sm font-medium">
									¥{item.total.toLocaleString()}
								</p>
							</div>
						);
					})}

					{order.items.length > 3 && (
						<p className="text-sm text-muted-foreground text-center">
							他 {order.items.length - 3} 個の商品
						</p>
					)}
				</div>

				{/* 配送先情報 */}
				{order.shippingAddress && (
					<div className="mb-4">
						<h4 className="text-sm font-medium mb-2">配送先</h4>
						<p className="text-sm text-muted-foreground">
							〒{order.shippingAddress.postalCode} {order.shippingAddress.state}{" "}
							{order.shippingAddress.city}
						</p>
						<p className="text-sm text-muted-foreground">
							{order.shippingAddress.line1}
							{order.shippingAddress.line2 && ` ${order.shippingAddress.line2}`}
						</p>
					</div>
				)}

				{/* アクション */}
				<div className="flex justify-end space-x-2">
					<Button variant="outline" size="sm" asChild>
						<Link href={`/orders/${order.id}`}>詳細を見る</Link>
					</Button>
					{order.status === "pending" && (
						<Button variant="outline" size="sm">
							キャンセル
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
