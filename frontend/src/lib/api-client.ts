const API_BASE_URL = "/api";

export async function apiClient<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			(error as { message?: string }).message ||
				`API error: ${response.status}`,
		);
	}

	return response.json() as Promise<T>;
}
