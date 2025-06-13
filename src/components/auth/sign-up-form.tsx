"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
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

export function SignUpForm() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpInput>({
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = async (data: SignUpInput) => {
		try {
			setLoading(true);

			const { error } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
				options: {
					data: {
						first_name: "",
						last_name: "",
					},
				},
			});

			if (error) {
				toast.error("アカウント作成に失敗しました", {
					description: error.message,
				});
				return;
			}

			toast.success("アカウントを作成しました", {
				description:
					"メールアドレスに送信された確認リンクをクリックしてください",
			});

			router.push("/login");
		} catch (error) {
			toast.error("予期しないエラーが発生しました");
			console.error("Sign up error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">アカウント作成</CardTitle>
				<CardDescription>新しいアカウントを作成してください</CardDescription>
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
								placeholder="8文字以上"
								{...register("password")}
								aria-invalid={errors.password ? "true" : "false"}
							/>
							{errors.password && (
								<p className="text-sm text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirmPassword">パスワード確認</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="パスワードを再入力"
								{...register("confirmPassword")}
								aria-invalid={errors.confirmPassword ? "true" : "false"}
							/>
							{errors.confirmPassword && (
								<p className="text-sm text-destructive">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter className="grid gap-4">
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "アカウント作成中..." : "アカウント作成"}
					</Button>
					<div className="text-center text-sm">
						すでにアカウントをお持ちの方は{" "}
						<Link href="/login" className="underline">
							サインイン
						</Link>
					</div>
				</CardFooter>
			</form>
		</Card>
	);
}
