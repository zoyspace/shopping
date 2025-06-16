"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/hooks/use-cart";

interface CheckoutOrderSummaryProps {
	items: CartItem[];
	total: number;
}

export function CheckoutOrderSummary({
	items,
	total,
}: CheckoutOrderSummaryProps) {
	const subtotal = total;
	const shipping = 0; // 配送料は無料とする
	const tax = Math.floor(total * 0.1); // 10%の税金
	const grandTotal = subtotal + shipping + tax;

	return (
		<Card>
			<CardHeader>
				<CardTitle>注文内容</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* 商品一覧 */}
				<div className="space-y-3">
					{items.map((item) => {
						const mainImage = item.product.images?.find((img) => img.isMain);
						const imageUrl =
							mainImage?.url || item.product.image_url || "/placeholder.jpg";

						return (
							<div key={item.id} className="flex items-center space-x-3">
								<div className="relative">
									<img
										src={imageUrl}
										alt={mainImage?.altText || item.product.name}
										className="h-12 w-12 rounded-md object-cover"
									/>
									<div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
										{item.quantity}
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">
										{item.product.name}
									</p>
									<p className="text-xs text-muted-foreground">
										¥{item.product.price.toLocaleString()} × {item.quantity}
									</p>
								</div>
								<p className="text-sm font-medium">
									¥{(item.product.price * item.quantity).toLocaleString()}
								</p>
							</div>
						);
					})}
				</div>

				<Separator />

				{/* 金額サマリー */}
				<div className="space-y-2">
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
						<span>¥{grandTotal.toLocaleString()}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
