import { Outlet } from "react-router-dom";
import { SideNavigation } from "./SideNavigation";

export function ManagementLayout() {
	return (
		<div className="flex h-screen">
			<SideNavigation />
			<main className="flex-1 overflow-auto bg-gray-50 p-6">
				<Outlet />
			</main>
		</div>
	);
}
