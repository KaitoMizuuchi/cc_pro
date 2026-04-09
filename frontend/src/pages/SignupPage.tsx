import { Link } from "react-router-dom";
import { SignupForm } from "@/features/auth/components/SignupForm";

export function SignupPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">アカウント作成</h1>
					<p className="mt-2 text-sm text-gray-600">
						HR管理システムの新規アカウントを作成します
					</p>
				</div>

				<div className="rounded-lg bg-white p-6 shadow">
					<SignupForm />
				</div>

				<p className="text-center text-sm text-gray-600">
					既にアカウントをお持ちですか？{" "}
					<Link
						to="/login"
						className="font-medium text-blue-600 hover:text-blue-500"
					>
						ログインに戻る
					</Link>
				</p>
			</div>
		</div>
	);
}
