"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { signInSchema, type SignInInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function SignInForm() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInInput>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInInput) => {
		try {
			setLoading(true);

			const { error } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password,
			});

			if (error) {
				toast.error("サインインに失敗しました", {
					description: error.message,
				});
				return;
			}

			toast.success("サインインしました");
			router.push("/");
			router.refresh();
		} catch (error) {
			toast.error("予期しないエラーが発生しました");
			console.error("Sign in error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">サインイン</CardTitle>
				<CardDescription>アカウントにサインインしてください</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">メールアドレス</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								{...register("email")}
								aria-invalid={errors.email ? "true" : "false"}
							/>
							{errors.email && (
								<p className="text-sm text-destructive">
									{errors.email.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">パスワード</Label>
							<Input
								id="password"
								type="password"
								{...register("password")}
								aria-invalid={errors.password ? "true" : "false"}
							/>
							{errors.password && (
								<p className="text-sm text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter className="grid gap-4">
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "サインイン中..." : "サインイン"}
					</Button>
					<div className="text-center text-sm">
						アカウントをお持ちでない方は{" "}
						<Link href="/register" className="underline">
							アカウント作成
						</Link>
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}
