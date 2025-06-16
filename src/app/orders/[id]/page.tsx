import { OrderDetailPageClient } from "./order-detail-page-client";

interface OrderDetailPageProps {
	params: {
		id: string;
	};
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
	return <OrderDetailPageClient orderId={params.id} />;
}
