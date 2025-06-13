"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
	product: Product;
	onAddToCart?: (productId: string) => void;
	onToggleFavorite?: (productId: string) => void;
	isFavorite?: boolean;
	className?: string;
}

export function ProductCard({
	product,
	onAddToCart,
	onToggleFavorite,
	isFavorite = false,
	className = "",
}: ProductCardProps) {
	const [isImageLoading, setIsImageLoading] = useState(true);
	const [imageError, setImageError] = useState(false);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		onAddToCart?.(product.id);
	};

	const handleToggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		onToggleFavorite?.(product.id);
	};

	return (
		<Card
			className={`group overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
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
						{product.stock_quantity === 0 && (
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
						<div className="flex items-center justify-between">
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
					</div>
				</CardContent>
			</Link>

			<CardFooter className="p-4 pt-0">
				<Button
					onClick={handleAddToCart}
					disabled={product.stock_quantity === 0}
					className="w-full"
					variant={product.stock_quantity === 0 ? "secondary" : "default"}
				>
					<ShoppingCart className="h-4 w-4 mr-2" />
					{product.stock_quantity === 0 ? "在庫切れ" : "カートに追加"}
				</Button>
			</CardFooter>
		</Card>
	);
}
