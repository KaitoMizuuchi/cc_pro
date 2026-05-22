import type {
	AuthUser,
	LoginRequest,
	LoginResponse,
	SignupRequest,
	SignupResponse,
} from "@hr-management/shared";
import { apiClient } from "@/lib/api-client";

export function signup(input: SignupRequest): Promise<SignupResponse> {
	return apiClient<SignupResponse>("/auth/signup", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function login(input: LoginRequest): Promise<LoginResponse> {
	return apiClient<LoginResponse>("/auth/login", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function logout(): Promise<{ message: string }> {
	return apiClient<{ message: string }>("/auth/logout", {
		method: "POST",
	});
}

export function getMe(): Promise<AuthUser> {
	return apiClient<AuthUser>("/auth/me");
}
