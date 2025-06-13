import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
	title: "サインイン",
	description: "アカウントにサインインしてください",
};

export default function LoginPage() {
	return (
		<div className="container relative flex h-screen flex-col items-center justify-center lg:px-0">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<SignInForm />
			</div>
		</div>
	);
}
