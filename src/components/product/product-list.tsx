"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { Product, Category } from "@/types";

interface ProductListProps {
	products: Product[];
	categories: Category[];
	onToggleFavorite?: (productId: string) => void;
	favoriteIds?: string[];
}

type SortOption =
	| "name-asc"
	| "name-desc"
	| "price-asc"
	| "price-desc"
	| "created-desc";
type ViewMode = "grid" | "list";

export function ProductList({
	products,
	categories,
	onToggleFavorite,
	favoriteIds = [],
}: ProductListProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// フィルタ状態
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [selectedCategory, setSelectedCategory] = useState(
		searchParams.get("category") || "",
	);
	const [sortBy, setSortBy] = useState<SortOption>(
		(searchParams.get("sort") as SortOption) || "created-desc",
	);
	const [priceRange, setPriceRange] = useState({
		min: searchParams.get("minPrice") || "",
		max: searchParams.get("maxPrice") || "",
	});
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [showFilters, setShowFilters] = useState(false);

	// フィルタされた商品
	const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
	const [isFiltering, setIsFiltering] = useState(false);

	// URLクエリパラメータを更新
	const updateUrl = () => {
		const params = new URLSearchParams();

		if (searchQuery) params.set("q", searchQuery);
		if (selectedCategory) params.set("category", selectedCategory);
		if (sortBy !== "created-desc") params.set("sort", sortBy);
		if (priceRange.min) params.set("minPrice", priceRange.min);
		if (priceRange.max) params.set("maxPrice", priceRange.max);

		const queryString = params.toString();
		const url = queryString ? `?${queryString}` : "";

		router.push(url, { scroll: false });
	};

	// フィルタリング処理
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setIsFiltering(true);

		let filtered = [...products];

		// 検索クエリフィルタ
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(product) =>
					product.name.toLowerCase().includes(query) ||
					product.description?.toLowerCase().includes(query),
			);
		}

		// カテゴリフィルタ
		if (selectedCategory) {
			filtered = filtered.filter(
				(product) => product.categoryId === selectedCategory,
			);
		}

		// 価格範囲フィルタ
		if (priceRange.min) {
			const minPrice = Number.parseFloat(priceRange.min);
			if (!Number.isNaN(minPrice)) {
				filtered = filtered.filter((product) => product.price >= minPrice);
			}
		}
		if (priceRange.max) {
			const maxPrice = Number.parseFloat(priceRange.max);
			if (!Number.isNaN(maxPrice)) {
				filtered = filtered.filter((product) => product.price <= maxPrice);
			}
		}

		// ソート
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "name-asc":
					return a.name.localeCompare(b.name);
				case "name-desc":
					return b.name.localeCompare(a.name);
				case "price-asc":
					return a.price - b.price;
				case "price-desc":
					return b.price - a.price;
				default:
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
			}
		});

		setFilteredProducts(filtered);
		setIsFiltering(false);
		updateUrl();
	}, [searchQuery, selectedCategory, sortBy, priceRange, products]);

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedCategory("");
		setSortBy("created-desc");
		setPriceRange({ min: "", max: "" });
	};

	const hasActiveFilters =
		searchQuery || selectedCategory || priceRange.min || priceRange.max;

	return (
		<div className="space-y-6">
			{/* 検索・フィルタヘッダー */}
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row gap-4">
					{/* 検索バー */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="商品を検索..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* ビューモード切り替え */}
					<div className="flex gap-2">
						<Button
							variant={showFilters ? "default" : "outline"}
							size="icon"
							onClick={() => setShowFilters(!showFilters)}
						>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "grid" ? "default" : "outline"}
							size="icon"
							onClick={() => setViewMode("grid")}
						>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "default" : "outline"}
							size="icon"
							onClick={() => setViewMode("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* 詳細フィルタ */}
				{showFilters && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
						{/* カテゴリフィルタ */}
						<div>
							<span className="text-sm font-medium mb-2 block">カテゴリ</span>
							<Select
								value={selectedCategory}
								onValueChange={setSelectedCategory}
							>
								<SelectTrigger>
									<SelectValue placeholder="すべて" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">すべて</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* 価格範囲 */}
						<div>
							<span className="text-sm font-medium mb-2 block">最低価格</span>
							<Input
								type="number"
								placeholder="0"
								value={priceRange.min}
								onChange={(e) =>
									setPriceRange((prev) => ({ ...prev, min: e.target.value }))
								}
							/>
						</div>
						<div>
							<span className="text-sm font-medium mb-2 block">最高価格</span>
							<Input
								type="number"
								placeholder="99999"
								value={priceRange.max}
								onChange={(e) =>
									setPriceRange((prev) => ({ ...prev, max: e.target.value }))
								}
							/>
						</div>

						{/* ソート */}
						<div>
							<span className="text-sm font-medium mb-2 block">並び順</span>
							<Select
								value={sortBy}
								onValueChange={(value: SortOption) => setSortBy(value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="created-desc">新着順</SelectItem>
									<SelectItem value="name-asc">名前（昇順）</SelectItem>
									<SelectItem value="name-desc">名前（降順）</SelectItem>
									<SelectItem value="price-asc">価格（安い順）</SelectItem>
									<SelectItem value="price-desc">価格（高い順）</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				{/* アクティブフィルタバッジ */}
				{hasActiveFilters && (
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-sm text-muted-foreground">フィルタ:</span>
						{searchQuery && (
							<Badge variant="secondary" className="gap-1">
								検索: {searchQuery}
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="ml-1 hover:text-destructive"
								>
									×
								</button>
							</Badge>
						)}
						{selectedCategory && (
							<Badge variant="secondary" className="gap-1">
								カテゴリ:{" "}
								{categories.find((c) => c.id === selectedCategory)?.name}
								<button
									type="button"
									onClick={() => setSelectedCategory("")}
									className="ml-1 hover:text-destructive"
								>
									×
								</button>
							</Badge>
						)}
						{(priceRange.min || priceRange.max) && (
							<Badge variant="secondary" className="gap-1">
								価格: {priceRange.min || "0"}円 - {priceRange.max || "∞"}円
								<button
									type="button"
									onClick={() => setPriceRange({ min: "", max: "" })}
									className="ml-1 hover:text-destructive"
								>
									×
								</button>
							</Badge>
						)}
						<Button variant="ghost" size="sm" onClick={clearFilters}>
							すべてクリア
						</Button>
					</div>
				)}
			</div>

			{/* 商品一覧 */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<p className="text-sm text-muted-foreground">
						{isFiltering ? "検索中..." : `${filteredProducts.length}件の商品`}
					</p>
				</div>

				{filteredProducts.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">
							条件に合う商品が見つかりませんでした
						</p>
						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters}>
								フィルタをクリア
							</Button>
						)}
					</div>
				) : (
					<div
						className={
							viewMode === "grid"
								? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
								: "space-y-4"
						}
					>
						{filteredProducts.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								onToggleFavorite={onToggleFavorite}
								isFavorite={favoriteIds.includes(product.id)}
								className={viewMode === "list" ? "flex flex-row" : ""}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
