import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, CreditCard, Shield } from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-screen">
			{/* ヒーローセクション */}
			<section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<div className="container mx-auto max-w-4xl">
					<h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						最高のオンライン
						<br />
						ショッピング体験
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
						厳選された商品を安全・簡単にお買い物できます
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="text-lg px-8">
							<Link href="/products">
								<ShoppingBag className="mr-2 h-5 w-5" />
								商品を見る
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="text-lg px-8"
						>
							<Link href="/login">アカウント作成</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* 特徴セクション */}
			<section className="py-20 px-4">
				<div className="container mx-auto max-w-6xl">
					<h2 className="text-3xl font-bold text-center mb-12">
						なぜ選ばれるのか
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">厳選された商品</h3>
							<p className="text-gray-600 dark:text-gray-300">
								品質にこだわった商品のみを取り扱っています
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">安全な決済</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Stripeによる安全で簡単な決済システム
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
								<Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">プライバシー保護</h3>
							<p className="text-gray-600 dark:text-gray-300">
								お客様の個人情報を最高水準で保護します
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTAセクション */}
			<section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
				<div className="container mx-auto max-w-4xl text-center">
					<h2 className="text-3xl font-bold mb-6">
						今すぐショッピングを始めよう
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
						アカウント作成は無料で、すぐに始められます
					</p>
					<Button asChild size="lg" className="text-lg px-8">
						<Link href="/products">
							<ShoppingBag className="mr-2 h-5 w-5" />
							商品一覧を見る
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}
