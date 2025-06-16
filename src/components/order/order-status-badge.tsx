"use client";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";
import {
	Clock,
	Package,
	Truck,
	CheckCircle,
	XCircle,
	RotateCcw,
} from "lucide-react";

interface OrderStatusBadgeProps {
	status: OrderStatus | string;
	showIcon?: boolean;
}

export function OrderStatusBadge({
	status,
	showIcon = true,
}: OrderStatusBadgeProps) {
	const getStatusConfig = (status: OrderStatus | string) => {
		switch (status) {
			case "pending":
				return {
					label: "処理待ち",
					variant: "secondary" as const,
					icon: Clock,
					className: "text-orange-600 border-orange-200 bg-orange-50",
				};
			case "processing":
				return {
					label: "処理中",
					variant: "default" as const,
					icon: Package,
					className: "text-blue-600 border-blue-200 bg-blue-50",
				};
			case "shipped":
				return {
					label: "配送中",
					variant: "default" as const,
					icon: Truck,
					className: "text-purple-600 border-purple-200 bg-purple-50",
				};
			case "delivered":
				return {
					label: "配送完了",
					variant: "default" as const,
					icon: CheckCircle,
					className: "text-green-600 border-green-200 bg-green-50",
				};
			case "cancelled":
				return {
					label: "キャンセル",
					variant: "destructive" as const,
					icon: XCircle,
					className: "text-red-600 border-red-200 bg-red-50",
				};
			case "refunded":
				return {
					label: "返金済み",
					variant: "outline" as const,
					icon: RotateCcw,
					className: "text-gray-600 border-gray-200 bg-gray-50",
				};
			default:
				return {
					label: "不明",
					variant: "outline" as const,
					icon: Clock,
					className: "text-gray-600 border-gray-200 bg-gray-50",
				};
		}
	};

	const config = getStatusConfig(status);
	const Icon = config.icon;

	return (
		<Badge
			variant={config.variant}
			className={`${config.className} ${showIcon ? "flex items-center space-x-1" : ""}`}
		>
			{showIcon && <Icon className="h-3 w-3" />}
			<span>{config.label}</span>
		</Badge>
	);
}
