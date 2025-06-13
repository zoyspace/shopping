"use client";

import Link from "next/link";
import { LogOut, Settings, ShoppingCart, User } from "lucide-react";
import { useAuth } from "./auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
	const { user, loading, signOut } = useAuth();

	if (loading) {
		return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
	}

	if (!user) {
		return (
			<div className="flex gap-2">
				<Button variant="ghost" asChild>
					<Link href="/login">サインイン</Link>
				</Button>
				<Button asChild>
					<Link href="/register">アカウント作成</Link>
				</Button>
			</div>
		);
	}

	const initials = user.email?.split("@")[0].slice(0, 2).toUpperCase() || "U";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarImage src="" alt={user.email || ""} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.email}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="cursor-pointer">
						<User className="mr-2 h-4 w-4" />
						<span>プロフィール</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/cart" className="cursor-pointer">
						<ShoppingCart className="mr-2 h-4 w-4" />
						<span>カート</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/orders" className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						<span>注文履歴</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={signOut} className="cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					<span>サインアウト</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
