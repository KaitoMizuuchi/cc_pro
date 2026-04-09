const API_BASE_URL = "/api";

export class ApiError extends Error {
	code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = "ApiError";
		this.code = code;
	}
}

export async function apiClient<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (response.status === 401) {
		const isAuthEndpoint = endpoint.startsWith("/auth/");
		if (!isAuthEndpoint) {
			window.location.href = "/login?expired=true";
		}
		const error = await response.json().catch(() => ({}));
		const errorData = error as { error?: { code?: string; message?: string } };
		throw new ApiError(
			errorData.error?.message || "認証が必要です",
			errorData.error?.code || "UNAUTHORIZED",
		);
	}

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		const errorData = error as { error?: { code?: string; message?: string } };
		throw new ApiError(
			errorData.error?.message || `API error: ${response.status}`,
			errorData.error?.code || "UNKNOWN_ERROR",
		);
	}

	return response.json() as Promise<T>;
}
