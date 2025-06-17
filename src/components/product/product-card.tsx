"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types";

interface ProductCardProps {
	product: Product;
	onToggleFavorite?: (productId: string) => void;
	isFavorite?: boolean;
	className?: string;
}

export function ProductCard({
	product,
	onToggleFavorite,
	isFavorite = false,
	className = "",
}: ProductCardProps) {
	const { addToCart } = useCart(); // isLoadingを取得しない
	const [isImageLoading, setIsImageLoading] = useState(true);
	const [imageError, setImageError] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	// フォールバック: 5秒後にローディング状態をリセット
	useEffect(() => {
		if (isAddingToCart) {
			const timeout = setTimeout(() => {
				setIsAddingToCart(false);
			}, 5000);

			return () => clearTimeout(timeout);
		}
	}, [isAddingToCart]);

	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// 重複実行を防止
		if (isAddingToCart) return;

		setIsAddingToCart(true);

		try {
			await addToCart(product, 1);
		} catch (error) {
			// エラーは useCart 内で処理される
			console.error("カート追加エラー:", error);
		} finally {
			// 必ずローディング状態をリセット
			setIsAddingToCart(false);
		}
	};

	const handleToggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleFavorite?.(product.id);
	};

	return (
		<Card
			className={`pt-0 group overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
		>
			<Link href={`/products/${product.id}`}>
				<CardContent className="p-0">
					<div className="relative aspect-square overflow-hidden bg-gray-100">
						{!imageError ? (
							<Image
								src={product.image_url || "/placeholder-product.png"}
								alt={product.name}
								fill
								className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
									isImageLoading ? "opacity-0" : "opacity-100"
								}`}
								onLoad={() => setIsImageLoading(false)}
								onError={() => {
									setImageError(true);
									setIsImageLoading(false);
								}}
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							/>
						) : (
							<div className="flex items-center justify-center h-full text-gray-400">
								<span>画像なし</span>
							</div>
						)}

						{/* お気に入りボタン */}
						{onToggleFavorite && (
							<Button
								variant="ghost"
								size="icon"
								className={`absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
									isFavorite ? "text-red-500" : "text-gray-600"
								}`}
								onClick={handleToggleFavorite}
							>
								<Heart
									className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
								/>
							</Button>
						)}

						{/* 在庫切れ表示 */}
						{product.inventory === 0 && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<span className="text-white font-semibold">在庫切れ</span>
							</div>
						)}
					</div>

					<div className="p-4">
						<h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
							{product.name}
						</h3>
						<p className="text-gray-600 text-sm mb-2 line-clamp-2">
							{product.description}
						</p>
						<div className="flex items-center justify-between mb-2">
							<span className="text-xl font-bold text-gray-900">
								{formatPrice(product.price)}
							</span>
							{product.original_price &&
								product.original_price > product.price && (
									<span className="text-sm text-gray-500 line-through">
										{formatPrice(product.original_price)}
									</span>
								)}
						</div>
						<div className="flex items-center justify-between">
							<Badge
								variant={product.inventory <= 5 ? "destructive" : "secondary"}
								className="text-xs"
							>
								在庫: {product.inventory}個
							</Badge>
							{product.inventory <= 5 && product.inventory > 0 && (
								<Badge variant="outline" className="text-xs">
									残りわずか
								</Badge>
							)}
						</div>
					</div>
				</CardContent>
			</Link>

			<CardFooter className="p-4 pt-0">
				<Button
					onClick={handleAddToCart}
					disabled={product.inventory === 0 || isAddingToCart}
					className="w-full"
					variant={product.inventory === 0 ? "secondary" : "default"}
				>
					<ShoppingCart className="h-4 w-4 mr-2" />
					{product.inventory === 0
						? "在庫切れ"
						: isAddingToCart
							? "追加中..."
							: "カートに追加"}
				</Button>
			</CardFooter>
		</Card>
	);
}
