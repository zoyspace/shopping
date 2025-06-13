import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
	title: "アカウント作成",
	description: "新しいアカウントを作成してください",
};

export default function RegisterPage() {
	return (
		<div className="container relative flex h-screen flex-col items-center justify-center lg:px-0">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<SignUpForm />
			</div>
		</div>
	);
}
