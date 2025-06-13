import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";

export function Header() {
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
					<nav className="flex items-center">
						<UserNav />
					</nav>
				</div>
			</div>
		</header>
	);
}
