"use client";

import Link from "next/link";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

export function Header() {
	const { totalItems } = useCart();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<ShoppingBag className="h-6 w-6" />
						<span className="hidden font-bold sm:inline-block">
							ショッピングサイト
						</span>
					</Link>
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<Link
							href="/products"
							className="transition-colors hover:text-foreground/80"
						>
							商品一覧
						</Link>
						<Link
							href="/orders"
							className="transition-colors hover:text-foreground/80"
						>
							注文履歴
						</Link>
						<Link
							href="/categories"
							className="transition-colors hover:text-foreground/80"
						>
							カテゴリ
						</Link>
					</nav>
				</div>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">
						{/* Search component will go here */}
					</div>
					<nav className="flex items-center space-x-2">
						{/* カートアイコン */}
						<Button variant="ghost" size="sm" asChild className="relative">
							<Link href="/cart">
								<ShoppingCart className="h-5 w-5" />
								{totalItems > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
									>
										{totalItems > 99 ? "99+" : totalItems}
									</Badge>
								)}
								<span className="sr-only">カート ({totalItems}個)</span>
							</Link>
						</Button>
						<UserNav />
					</nav>
				</div>
			</div>
		</header>
	);
}
