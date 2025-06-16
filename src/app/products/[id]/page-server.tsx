import { Suspense } from "react";
import { ProductPageClient } from "./product-page-client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductPageProps {
	params: Promise<{ id: string }>;
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
			<ProductPageClient productId={id} />
		</Suspense>
	);
}
