"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	ShoppingCart,
	Heart,
	Share2,
	ArrowLeft,
	Minus,
	Plus,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductDetailProps {
	product: Product;
	onAddToCart?: (productId: string, quantity: number) => void;
	onToggleFavorite?: (productId: string) => void;
	isFavorite?: boolean;
}

export function ProductDetail({
	product,
	onAddToCart,
	onToggleFavorite,
	isFavorite = false,
}: ProductDetailProps) {
	const router = useRouter();
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isImageLoading, setIsImageLoading] = useState(true);
	const [imageError, setImageError] = useState(false);

	const handleAddToCart = () => {
		if (quantity > product.stock_quantity) {
			toast.error("在庫数を超えています");
			return;
		}
		onAddToCart?.(product.id, quantity);
		toast.success(`${product.name} を ${quantity}個 カートに追加しました`);
	};

	const handleToggleFavorite = () => {
		onToggleFavorite?.(product.id);
		toast.success(
			isFavorite ? "お気に入りから削除しました" : "お気に入りに追加しました",
		);
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: product.name,
					text: product.description,
					url: window.location.href,
				});
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					console.error("Error sharing:", error);
				}
			}
		} else {
			// フォールバック: URLをクリップボードにコピー
			try {
				await navigator.clipboard.writeText(window.location.href);
				toast.success("URLをクリップボードにコピーしました");
			} catch {
				toast.error("URLのコピーに失敗しました");
			}
		}
	};

	const adjustQuantity = (delta: number) => {
		const newQuantity = Math.max(
			1,
			Math.min(product.stock_quantity, quantity + delta),
		);
		setQuantity(newQuantity);
	};

	const images =
		product.images.length > 0
			? product.images
			: [
					{
						id: "default",
						url: product.image_url || "/placeholder-product.png",
						altText: product.name,
						isMain: true,
						sortOrder: 0,
					},
				];

	const currentImage = images[selectedImageIndex] || images[0];

	return (
		<div className="container mx-auto px-4 py-8">
			{/* 戻るボタン */}
			<Button variant="ghost" className="mb-6" onClick={() => router.back()}>
				<ArrowLeft className="h-4 w-4 mr-2" />
				戻る
			</Button>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* 商品画像 */}
				<div className="space-y-4">
					{/* メイン画像 */}
					<div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
						{!imageError ? (
							<Image
								src={currentImage.url}
								alt={currentImage.altText || product.name}
								fill
								className={`object-cover transition-opacity duration-300 ${
									isImageLoading ? "opacity-0" : "opacity-100"
								}`}
								onLoad={() => setIsImageLoading(false)}
								onError={() => {
									setImageError(true);
									setIsImageLoading(false);
								}}
								priority
								sizes="(max-width: 1024px) 100vw, 50vw"
							/>
						) : (
							<div className="flex items-center justify-center h-full text-gray-400">
								<span>画像を読み込めませんでした</span>
							</div>
						)}

						{/* 在庫切れオーバーレイ */}
						{product.stock_quantity === 0 && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<span className="text-white font-semibold text-xl">
									在庫切れ
								</span>
							</div>
						)}
					</div>

					{/* サムネイル */}
					{images.length > 1 && (
						<div className="grid grid-cols-4 gap-2">
							{images.map((image, index) => (
								<button
									key={image.id}
									type="button"
									className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
										index === selectedImageIndex
											? "border-primary"
											: "border-gray-200"
									}`}
									onClick={() => setSelectedImageIndex(index)}
								>
									<Image
										src={image.url}
										alt={image.altText || `${product.name} ${index + 1}`}
										fill
										className="object-cover"
										sizes="100px"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* 商品情報 */}
				<div className="space-y-6">
					{/* 基本情報 */}
					<div>
						<h1 className="text-3xl font-bold mb-2">{product.name}</h1>
						<div className="flex items-center gap-4 mb-4">
							<span className="text-3xl font-bold text-primary">
								{formatPrice(product.price)}
							</span>
							{product.original_price &&
								product.original_price > product.price && (
									<span className="text-xl text-gray-500 line-through">
										{formatPrice(product.original_price)}
									</span>
								)}
						</div>

						{/* カテゴリ */}
						{product.category && (
							<Badge variant="secondary" className="mb-4">
								{product.category.name}
							</Badge>
						)}

						{/* 在庫状況 */}
						<div className="flex items-center gap-2 mb-4">
							<span className="text-sm text-gray-600">在庫:</span>
							{product.stock_quantity > 0 ? (
								<Badge
									variant="outline"
									className="text-green-600 border-green-600"
								>
									{product.stock_quantity}個 在庫あり
								</Badge>
							) : (
								<Badge variant="destructive">在庫切れ</Badge>
							)}
						</div>
					</div>

					<Separator />

					{/* 商品説明 */}
					{product.description && (
						<div>
							<h3 className="font-semibold mb-2">商品説明</h3>
							<p className="text-gray-700 whitespace-pre-wrap">
								{product.description}
							</p>
						</div>
					)}

					<Separator />

					{/* 数量選択・カート追加 */}
					<Card>
						<CardContent className="p-4">
							<div className="space-y-4">
								{/* 数量選択 */}
								<div className="flex items-center gap-4">
									<span className="font-medium">数量:</span>
									<div className="flex items-center border rounded-md">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => adjustQuantity(-1)}
											disabled={quantity <= 1}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="w-12 text-center">{quantity}</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => adjustQuantity(1)}
											disabled={quantity >= product.stock_quantity}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* アクションボタン */}
								<div className="space-y-2">
									<Button
										onClick={handleAddToCart}
										disabled={product.stock_quantity === 0}
										className="w-full"
										size="lg"
									>
										<ShoppingCart className="h-4 w-4 mr-2" />
										{product.stock_quantity === 0 ? "在庫切れ" : "カートに追加"}
									</Button>

									<div className="grid grid-cols-2 gap-2">
										<Button
											variant="outline"
											onClick={handleToggleFavorite}
											className="flex-1"
										>
											<Heart
												className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current text-red-500" : ""}`}
											/>
											{isFavorite ? "お気に入り済み" : "お気に入り"}
										</Button>

										<Button
											variant="outline"
											onClick={handleShare}
											className="flex-1"
										>
											<Share2 className="h-4 w-4 mr-2" />
											シェア
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
