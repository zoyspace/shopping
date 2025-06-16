"use client";

import { Suspense } from "react";
import { useProducts, useCategories } from "@/hooks/use-products";
import { ProductList } from "@/components/product/product-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

function ProductListContent() {
	const {
		products,
		loading: productsLoading,
		error: productsError,
		refetch: refetchProducts,
	} = useProducts();
	const {
		categories,
		loading: categoriesLoading,
		error: categoriesError,
	} = useCategories();

	if (productsError || categoriesError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{productsError || categoriesError}
					</AlertDescription>
				</Alert>
				<Button onClick={refetchProducts} className="mt-4" variant="outline">
					<RefreshCw className="h-4 w-4 mr-2" />
					再試行
				</Button>
			</div>
		);
	}

	if (productsLoading || categoriesLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="space-y-6">
					{/* ヘッダーのスケルトン */}
					<div className="space-y-4">
						<Skeleton className="h-10 w-full max-w-md" />
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>

					{/* 商品カードのスケルトン */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 8 }, (_, index) => (
							<div key={`skeleton-main-${index + 1}`} className="space-y-4">
								<Skeleton className="aspect-square w-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-8 w-full" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">商品一覧</h1>
				<p className="text-muted-foreground">
					お気に入りの商品を見つけてください
				</p>
			</div>

			<ProductList
				products={products}
				categories={categories}
				onToggleFavorite={(productId) => {
					// TODO: お気に入り機能実装時に追加
					console.log("Toggle favorite:", productId);
				}}
				favoriteIds={[]}
			/>
		</div>
	);
}

export default function ProductsPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto px-4 py-8">
					<div className="space-y-6">
						<div className="space-y-4">
							<Skeleton className="h-10 w-full max-w-md" />
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{Array.from({ length: 8 }, (_, index) => (
								<div
									key={`skeleton-fallback-${index + 1}`}
									className="space-y-4"
								>
									<Skeleton className="aspect-square w-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
										<Skeleton className="h-8 w-full" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			}
		>
			<ProductListContent />
		</Suspense>
	);
}
