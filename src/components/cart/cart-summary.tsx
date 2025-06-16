/**
 * カートサマリーコンポーネント
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard } from "lucide-react";
import Link from "next/link";

interface CartSummaryProps {
	totalItems: number;
	totalPrice: number;
	isLoading?: boolean;
	onClearCart?: () => void;
	className?: string;
}

export function CartSummary({
	totalItems,
	totalPrice,
	isLoading = false,
	onClearCart,
	className,
}: CartSummaryProps) {
	// 配送料計算（仮の実装）
	const shippingFee = totalPrice >= 5000 ? 0 : 500;
	const tax = Math.floor(totalPrice * 0.1); // 10%税込み
	const finalTotal = totalPrice + shippingFee + tax;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<ShoppingCart className="h-5 w-5" />
					<span>注文サマリー</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* アイテム数 */}
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">商品数</span>
					<Badge variant="secondary">{totalItems}個</Badge>
				</div>

				<Separator />

				{/* 価格詳細 */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>商品合計</span>
						<span>¥{totalPrice.toLocaleString()}</span>
					</div>

					<div className="flex justify-between text-sm">
						<span className="flex items-center space-x-1">
							<span>配送料</span>
							{shippingFee === 0 && (
								<Badge variant="secondary" className="text-xs">
									無料
								</Badge>
							)}
						</span>
						<span>
							{shippingFee === 0 ? "無料" : `¥${shippingFee.toLocaleString()}`}
						</span>
					</div>

					<div className="flex justify-between text-sm">
						<span>税込み (10%)</span>
						<span>¥{tax.toLocaleString()}</span>
					</div>
				</div>

				<Separator />

				{/* 合計金額 */}
				<div className="flex justify-between font-semibold text-lg">
					<span>合計</span>
					<span>¥{finalTotal.toLocaleString()}</span>
				</div>

				{/* 送料無料まであといくら */}
				{shippingFee > 0 && (
					<div className="text-sm text-muted-foreground bg-muted p-2 rounded">
						あと¥{(5000 - totalPrice).toLocaleString()}で送料無料！
					</div>
				)}

				<Separator />

				{/* アクションボタン */}
				<div className="space-y-2">
					<Button
						asChild
						className="w-full"
						size="lg"
						disabled={isLoading || totalItems === 0}
					>
						<Link href="/checkout">
							<CreditCard className="h-4 w-4 mr-2" />
							レジに進む
						</Link>
					</Button>

					<Button
						variant="outline"
						className="w-full"
						asChild
						disabled={isLoading}
					>
						<Link href="/products">ショッピングを続ける</Link>
					</Button>

					{onClearCart && totalItems > 0 && (
						<Button
							variant="ghost"
							className="w-full text-destructive hover:text-destructive"
							onClick={onClearCart}
							disabled={isLoading}
						>
							カートを空にする
						</Button>
					)}
				</div>

				{/* 注意事項 */}
				<div className="text-xs text-muted-foreground space-y-1 pt-2">
					<p>• 税込み価格で表示しています</p>
					<p>• ¥5,000以上のご注文で送料無料</p>
					<p>• 在庫状況により配送が遅れる場合があります</p>
				</div>
			</CardContent>
		</Card>
	);
}
