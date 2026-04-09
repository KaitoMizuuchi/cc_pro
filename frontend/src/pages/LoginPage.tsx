import { Link, useSearchParams } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
	const [searchParams] = useSearchParams();
	const isExpired = searchParams.get("expired") === "true";

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
					<p className="mt-2 text-sm text-gray-600">
						HR管理システムにログインします
					</p>
				</div>

				{isExpired && (
					<div className="rounded-md bg-yellow-50 p-4">
						<p className="text-sm text-yellow-800">
							セッションの有効期限が切れました。再度ログインしてください。
						</p>
					</div>
				)}

				<div className="rounded-lg bg-white p-6 shadow">
					<LoginForm />
				</div>

				<p className="text-center text-sm text-gray-600">
					アカウントをお持ちでないですか？{" "}
					<Link
						to="/signup"
						className="font-medium text-blue-600 hover:text-blue-500"
					>
						サインアップはこちら
					</Link>
				</p>
			</div>
		</div>
	);
}
