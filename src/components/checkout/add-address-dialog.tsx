"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddresses } from "@/hooks/use-addresses";
import { addressSchema, type AddressInput } from "@/lib/validations";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddAddressDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddressAdded: () => void;
}

export function AddAddressDialog({
	open,
	onOpenChange,
	onAddressAdded,
}: AddAddressDialogProps) {
	const { createAddress, isLoading } = useAddresses();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			line1: "",
			line2: "",
			city: "",
			state: "",
			postalCode: "",
			country: "JP",
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = form;

	const onSubmit = async (data: AddressInput) => {
		try {
			setIsSubmitting(true);
			const addressId = await createAddress(data);

			if (addressId) {
				reset();
				toast.success("住所が追加されました");
				onAddressAdded();
				onOpenChange(false);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "住所の追加に失敗しました";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>住所を追加</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid gap-4">
						<div>
							<Label htmlFor="postalCode">郵便番号</Label>
							<Input
								id="postalCode"
								{...register("postalCode")}
								placeholder="123-4567"
							/>
							{errors.postalCode && (
								<p className="text-sm text-destructive mt-1">
									{errors.postalCode.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="state">都道府県</Label>
							<Input id="state" {...register("state")} placeholder="東京都" />
							{errors.state && (
								<p className="text-sm text-destructive mt-1">
									{errors.state.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="city">市区町村</Label>
							<Input id="city" {...register("city")} placeholder="渋谷区" />
							{errors.city && (
								<p className="text-sm text-destructive mt-1">
									{errors.city.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="line1">住所1</Label>
							<Input id="line1" {...register("line1")} placeholder="1-1-1" />
							{errors.line1 && (
								<p className="text-sm text-destructive mt-1">
									{errors.line1.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="line2">住所2（任意）</Label>
							<Input
								id="line2"
								{...register("line2")}
								placeholder="マンション名・部屋番号"
							/>
							{errors.line2 && (
								<p className="text-sm text-destructive mt-1">
									{errors.line2.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="country">国</Label>
							<Input
								id="country"
								{...register("country")}
								placeholder="JP"
								defaultValue="JP"
							/>
							{errors.country && (
								<p className="text-sm text-destructive mt-1">
									{errors.country.message}
								</p>
							)}
						</div>
					</div>

					<div className="flex justify-end space-x-2">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting || isLoading}
						>
							キャンセル
						</Button>
						<Button type="submit" disabled={isSubmitting || isLoading}>
							{isSubmitting ? "追加中..." : "追加"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
