import { Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { GuestGuard } from "@/components/guards/GuestGuard";
import { ManagementLayout } from "@/components/layout/ManagementLayout";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { BookDetailPage } from "@/pages/BookDetailPage";
import { BookListPage } from "@/pages/BookListPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { EmployeeDetailPage } from "@/pages/EmployeeDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { SignupPage } from "@/pages/SignupPage";

export function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route element={<GuestGuard />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
				</Route>

				<Route element={<AuthGuard />}>
					<Route element={<ManagementLayout />}>
						<Route path="/" element={<DashboardPage />} />
						<Route path="/employees/:id" element={<EmployeeDetailPage />} />
						<Route path="/projects" element={<ProjectsPage />} />
						<Route path="/projects/:id" element={<ProjectDetailPage />} />
						<Route path="/books" element={<BookListPage />} />
						<Route path="/books/:id" element={<BookDetailPage />} />
					</Route>
				</Route>
			</Routes>
		</AuthProvider>
	);
}
