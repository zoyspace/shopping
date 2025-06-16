"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";
import { AddAddressDialog } from "./add-address-dialog";
import type { Address } from "@/types";

interface CheckoutAddressFormProps {
	addresses: Address[];
	selectedAddress: Address | null;
	onAddressSelect: (address: Address) => void;
	onAddressAdded?: () => void;
	type: "shipping" | "billing";
}

export function CheckoutAddressForm({
	addresses,
	selectedAddress,
	onAddressSelect,
	onAddressAdded,
	type,
}: CheckoutAddressFormProps) {
	const [showAddDialog, setShowAddDialog] = useState(false);

	const handleAddressAdded = () => {
		setShowAddDialog(false);
		if (onAddressAdded) {
			onAddressAdded();
		}
	};

	return (
		<div className="space-y-4">
			{/* 既存の住所一覧 */}
			<div className="grid gap-3">
				{addresses.map((address) => (
					<Card
						key={address.id}
						className={`cursor-pointer transition-colors ${
							selectedAddress?.id === address.id
								? "ring-2 ring-primary"
								: "hover:bg-muted/50"
						}`}
						onClick={() => onAddressSelect(address)}
					>
						<CardContent className="p-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										{address.isDefault && (
											<Badge variant="secondary" className="text-xs">
												デフォルト
											</Badge>
										)}
										{selectedAddress?.id === address.id && (
											<Check className="h-4 w-4 text-primary" />
										)}
									</div>
									<div className="text-sm">
										<p className="font-medium">
											〒{address.postalCode} {address.state} {address.city}
										</p>
										<p>{address.line1}</p>
										{address.line2 && <p>{address.line2}</p>}
										<p className="text-muted-foreground">{address.country}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* 住所追加ボタン */}
			<Button
				variant="outline"
				className="w-full"
				onClick={() => setShowAddDialog(true)}
			>
				<Plus className="h-4 w-4 mr-2" />
				新しい{type === "shipping" ? "配送先" : "請求先"}住所を追加
			</Button>

			{/* 住所追加ダイアログ */}
			<AddAddressDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				onAddressAdded={handleAddressAdded}
			/>
		</div>
	);
}
