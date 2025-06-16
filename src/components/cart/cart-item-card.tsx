/**
 * カートアイテムコンポーネント
 */

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CartItem } from "@/hooks/use-cart";

interface CartItemCardProps {
	item: CartItem;
	onUpdateQuantity: (productId: string, quantity: number) => void;
	onRemoveItem: (productId: string) => void;
	isLoading?: boolean;
}

export function CartItemCard({
	item,
	onUpdateQuantity,
	onRemoveItem,
	isLoading = false,
}: CartItemCardProps) {
	const [quantity, setQuantity] = useState(item.quantity);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleQuantityChange = async (newQuantity: number) => {
		if (newQuantity < 1 || newQuantity > item.product.inventory) return;

		setIsUpdating(true);
		setQuantity(newQuantity);
		try {
			await onUpdateQuantity(item.product.id, newQuantity);
		} catch (error) {
			// エラーの場合は元の値に戻す
			setQuantity(item.quantity);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleRemove = async () => {
		setIsUpdating(true);
		try {
			await onRemoveItem(item.product.id);
		} finally {
			setIsUpdating(false);
		}
	};

	const mainImage =
		item.product.images.find((img) => img.isMain) || item.product.images[0];
	const totalPrice = item.product.price * item.quantity;

	return (
		<div className="flex items-center space-x-4 p-4 border rounded-lg bg-card">
			{/* 商品画像 */}
			<div className="flex-shrink-0">
				<div className="relative w-20 h-20 rounded-md overflow-hidden">
					{mainImage ? (
						<Image
							src={mainImage.url}
							alt={mainImage.altText || item.product.name}
							fill
							className="object-cover"
							sizes="80px"
						/>
					) : (
						<div className="w-full h-full bg-muted flex items-center justify-center">
							<span className="text-xs text-muted-foreground">No Image</span>
						</div>
					)}
				</div>
			</div>

			{/* 商品情報 */}
			<div className="flex-1 min-w-0">
				<h3 className="font-medium text-sm truncate">{item.product.name}</h3>
				<p className="text-sm text-muted-foreground mt-1">
					¥{item.product.price.toLocaleString()}
				</p>
				<div className="flex items-center space-x-2 mt-2">
					<Badge variant="secondary" className="text-xs">
						在庫: {item.product.inventory}個
					</Badge>
					{item.product.inventory <= 5 && (
						<Badge variant="destructive" className="text-xs">
							残りわずか
						</Badge>
					)}
				</div>
			</div>

			{/* 数量調整 */}
			<div className="flex items-center space-x-2">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => handleQuantityChange(quantity - 1)}
					disabled={isLoading || isUpdating || quantity <= 1}
				>
					<Minus className="h-3 w-3" />
				</Button>

				<Input
					type="number"
					min="1"
					max={item.product.inventory}
					value={quantity}
					onChange={(e) => {
						const newValue = Number.parseInt(e.target.value) || 1;
						setQuantity(newValue);
					}}
					onBlur={() => {
						if (quantity !== item.quantity) {
							handleQuantityChange(quantity);
						}
					}}
					className="w-16 h-8 text-center"
					disabled={isLoading || isUpdating}
				/>

				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={() => handleQuantityChange(quantity + 1)}
					disabled={
						isLoading || isUpdating || quantity >= item.product.inventory
					}
				>
					<Plus className="h-3 w-3" />
				</Button>
			</div>

			{/* 小計 */}
			<div className="text-right min-w-0">
				<p className="font-semibold">¥{totalPrice.toLocaleString()}</p>
				<p className="text-xs text-muted-foreground">{item.quantity}個</p>
			</div>

			{/* 削除ボタン */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-destructive hover:text-destructive"
				onClick={handleRemove}
				disabled={isLoading || isUpdating}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
