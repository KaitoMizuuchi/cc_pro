import type { AuthUser } from "@hr-management/shared";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/auth-service";

type AuthContextValue = {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (user: AuthUser) => void;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		authService
			.getMe()
			.then((data) => setUser(data))
			.catch(() => setUser(null))
			.finally(() => setIsLoading(false));
	}, []);

	const login = useCallback((user: AuthUser) => {
		setUser(user);
	}, []);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch {
			// ログアウトAPIが失敗してもクライアント側をクリアする
		}
		setUser(null);
		navigate("/login");
	}, [navigate]);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
