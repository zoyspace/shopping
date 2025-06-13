"use client";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { useProduct } from "@/hooks/use-products";
import { ProductDetail } from "@/components/product/product-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductPageProps {
	params: Promise<{ id: string }>;
}

function ProductDetailContent({ productId }: { productId: string }) {
	const { product, loading, error, refetch } = useProduct(productId);

	if (error) {
		if (error.includes("PGRST116")) {
			notFound();
		}

		return (
			<div className="container mx-auto px-4 py-8">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<Button onClick={refetch} className="mt-4" variant="outline">
					<RefreshCw className="h-4 w-4 mr-2" />
					再試行
				</Button>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="space-y-6">
					{/* 戻るボタンのスケルトン */}
					<Skeleton className="h-10 w-20" />

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* 画像のスケルトン */}
						<div className="space-y-4">
							<Skeleton className="aspect-square w-full" />
							<div className="grid grid-cols-4 gap-2">
								{Array.from({ length: 4 }, (_, index) => (
									<Skeleton
										key={`thumb-${index + 1}`}
										className="aspect-square w-full"
									/>
								))}
							</div>
						</div>

						{/* 詳細のスケルトン */}
						<div className="space-y-6">
							<div className="space-y-4">
								<Skeleton className="h-8 w-3/4" />
								<Skeleton className="h-6 w-1/2" />
								<Skeleton className="h-4 w-1/4" />
								<Skeleton className="h-4 w-1/3" />
							</div>

							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
							</div>

							<div className="space-y-4">
								<Skeleton className="h-32 w-full" />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		notFound();
	}

	return (
		<ProductDetail
			product={product}
			onAddToCart={(productId, quantity) => {
				// TODO: カート機能実装時に追加
				console.log("Add to cart:", productId, "quantity:", quantity);
			}}
			onToggleFavorite={(productId) => {
				// TODO: お気に入り機能実装時に追加
				console.log("Toggle favorite:", productId);
			}}
			isFavorite={false}
		/>
	);
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;

	return (
		<Suspense
			fallback={
				<div className="container mx-auto px-4 py-8">
					<div className="space-y-6">
						<Skeleton className="h-10 w-20" />

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="space-y-4">
								<Skeleton className="aspect-square w-full" />
								<div className="grid grid-cols-4 gap-2">
									{Array.from({ length: 4 }, (_, index) => (
										<Skeleton
											key={`fallback-thumb-${index + 1}`}
											className="aspect-square w-full"
										/>
									))}
								</div>
							</div>

							<div className="space-y-6">
								<div className="space-y-4">
									<Skeleton className="h-8 w-3/4" />
									<Skeleton className="h-6 w-1/2" />
									<Skeleton className="h-4 w-1/4" />
									<Skeleton className="h-4 w-1/3" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
								</div>

								<div className="space-y-4">
									<Skeleton className="h-32 w-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			}
		>
			<ProductDetailContent productId={id} />
		</Suspense>
	);
}
