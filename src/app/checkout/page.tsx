import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
	return (
		<div className="container max-w-4xl mx-auto py-8">
			<h1 className="text-3xl font-bold mb-8">チェックアウト</h1>
			<CheckoutForm />
		</div>
	);
}
