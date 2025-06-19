import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			{/* ページヘッダーのスケルトン */}
			<Skeleton className="h-10 w-1/3 mb-6" />
			{/* 商品一覧のスケルトン */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
					<div key={`skeleton-${num}`} className="space-y-4">
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
	);
}
