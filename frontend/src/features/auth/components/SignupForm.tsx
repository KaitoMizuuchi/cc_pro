import { zodResolver } from "@hookform/resolvers/zod";
import { type SignupFormInput, signupFormSchema } from "@hr-management/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import * as authService from "../services/auth-service";

export function SignupForm() {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormInput>({
		resolver: zodResolver(signupFormSchema),
	});

	const mutation = useMutation({
		mutationFn: (data: SignupFormInput) =>
			authService.signup({
				name: data.name,
				email: data.email,
				password: data.password,
			}),
		onSuccess: () => {
			toast.success("アカウントが作成されました。ログインしてください");
			navigate("/login");
		},
		onError: (error) => {
			if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
				toast.error("このメールアドレスは既に登録されています");
			} else {
				toast.error("アカウントの作成に失敗しました。再度お試しください");
			}
		},
	});

	return (
		<form
			onSubmit={handleSubmit((data) => mutation.mutate(data))}
			className="space-y-4"
		>
			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700"
				>
					ユーザー名
				</label>
				<input
					id="name"
					type="text"
					{...register("name")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
				{errors.name && (
					<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700"
				>
					メールアドレス
				</label>
				<input
					id="email"
					type="email"
					{...register("email")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
				{errors.email && (
					<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700"
				>
					パスワード
				</label>
				<input
					id="password"
					type="password"
					{...register("password")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
				{errors.password && (
					<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="passwordConfirm"
					className="block text-sm font-medium text-gray-700"
				>
					パスワード確認
				</label>
				<input
					id="passwordConfirm"
					type="password"
					{...register("passwordConfirm")}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
				{errors.passwordConfirm && (
					<p className="mt-1 text-sm text-red-600">
						{errors.passwordConfirm.message}
					</p>
				)}
			</div>

			<button
				type="submit"
				disabled={mutation.isPending}
				className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{mutation.isPending ? "作成中..." : "アカウント作成"}
			</button>
		</form>
	);
}
