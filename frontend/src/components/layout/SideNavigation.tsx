import { LogOut, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
		isActive
			? "bg-blue-50 font-medium text-blue-700"
			: "text-gray-700 hover:bg-gray-100"
	}`;

export function SideNavigation() {
	const { user, logout } = useAuth();

	return (
		<aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
			<div className="border-b border-gray-200 p-4">
				<h2 className="text-lg font-bold text-gray-900">HR管理</h2>
			</div>

			<nav className="flex-1 space-y-1 p-4">
				<NavLink to="/" end className={navLinkClass}>
					<Users className="h-4 w-4" />
					従業員管理
				</NavLink>
			</nav>

			<div className="border-t border-gray-200 p-4">
				<p className="truncate text-sm text-gray-600">{user?.email}</p>
				<button
					type="button"
					onClick={logout}
					className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
				>
					<LogOut className="h-4 w-4" />
					ログアウト
				</button>
			</div>
		</aside>
	);
}
