import type {
	Book,
	BookListResponse,
	CreateBookRequest,
	IsbnLookupResult,
	UpdateBookRequest,
} from "@hr-management/shared";
import { apiClient } from "@/lib/api-client";

export function listBooks(
	page: number,
	limit: number,
): Promise<BookListResponse> {
	return apiClient<BookListResponse>(`/books?page=${page}&limit=${limit}`);
}

export function getBook(id: string): Promise<Book> {
	return apiClient<Book>(`/books/${id}`);
}

export function createBook(input: CreateBookRequest): Promise<Book> {
	return apiClient<Book>("/books", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function updateBook(
	id: string,
	input: UpdateBookRequest,
): Promise<Book> {
	return apiClient<Book>(`/books/${id}`, {
		method: "PUT",
		body: JSON.stringify(input),
	});
}

export function deleteBook(id: string): Promise<{ id: string }> {
	return apiClient<{ id: string }>(`/books/${id}`, {
		method: "DELETE",
	});
}

export function lookupIsbn(isbn: string): Promise<IsbnLookupResult> {
	return apiClient<IsbnLookupResult>(`/books/lookup/${isbn}`);
}
