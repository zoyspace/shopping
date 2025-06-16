/**
 * 決済成功ページ
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ShoppingBag, Receipt } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CheckoutSuccessPage() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");
	const [isLoading, setIsLoading] = useState(true);
	const [sessionData, setSessionData] = useState<{
		payment_status: string;
		amount_total?: number;
		customer_email?: string;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { clearCart } = useCart();

	useEffect(() => {
		const fetchSessionData = async () => {
			if (!sessionId) {
				setError("セッションIDが見つかりません");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/stripe/checkout-session?session_id=${sessionId}`,
				);

				if (!response.ok) {
					throw new Error("セッション情報の取得に失敗しました");
				}

				const data = await response.json();
				setSessionData(data);

				// 決済成功時にカートをクリア
				if (data.payment_status === "paid") {
					await clearCart();
				}
			} catch (error) {
				console.error("Session fetch error:", error);
				setError(
					error instanceof Error
						? error.message
						: "予期しないエラーが発生しました",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSessionData();
	}, [sessionId, clearCart]);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">決済情報を確認中...</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					<div className="mt-4 text-center">
						<Button asChild>
							<Link href="/cart">カートに戻る</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const isPaid = sessionData?.payment_status === "paid";

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4">
							{isPaid ? (
								<CheckCircle2 className="h-16 w-16 text-green-500" />
							) : (
								<Receipt className="h-16 w-16 text-orange-500" />
							)}
						</div>
						<CardTitle className="text-2xl">
							{isPaid ? "決済が完了しました！" : "決済を確認中です"}
						</CardTitle>
						<p className="text-muted-foreground">
							{isPaid
								? "ご注文ありがとうございました。"
								: "決済の処理が進行中です。"}
						</p>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* 決済情報 */}
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">決済情報</h3>
							<div className="grid gap-2 text-sm">
								<div className="flex justify-between">
									<span>セッションID:</span>
									<span className="font-mono text-xs">{sessionId}</span>
								</div>
								<div className="flex justify-between">
									<span>決済ステータス:</span>
									<span
										className={`font-semibold ${isPaid ? "text-green-600" : "text-orange-600"}`}
									>
										{sessionData?.payment_status === "paid" ? "完了" : "処理中"}
									</span>
								</div>
								{sessionData?.amount_total && (
									<div className="flex justify-between">
										<span>合計金額:</span>
										<span className="font-semibold">
											¥{sessionData.amount_total.toLocaleString()}
										</span>
									</div>
								)}
								{sessionData?.customer_email && (
									<div className="flex justify-between">
										<span>メールアドレス:</span>
										<span>{sessionData.customer_email}</span>
									</div>
								)}
							</div>
						</div>

						{/* 次のステップ */}
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">次のステップ</h3>
							<div className="text-sm text-muted-foreground space-y-2">
								<p>• 注文確認メールを送信いたします</p>
								<p>• 商品の準備が完了次第、発送通知をお送りします</p>
								<p>• 注文履歴からいつでも詳細を確認できます</p>
							</div>
						</div>

						{/* アクションボタン */}
						<div className="flex flex-col sm:flex-row gap-4">
							<Button asChild className="flex-1">
								<Link href="/orders">
									<Receipt className="h-4 w-4 mr-2" />
									注文履歴を見る
								</Link>
							</Button>
							<Button variant="outline" asChild className="flex-1">
								<Link href="/products">
									<ShoppingBag className="h-4 w-4 mr-2" />
									買い物を続ける
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
