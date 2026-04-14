import type { UpdateBookRequest } from "@hr-management/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bookService from "../services/book-service";

export function useBooks(page: number, limit: number) {
	return useQuery({
		queryKey: ["books", page, limit],
		queryFn: () => bookService.listBooks(page, limit),
	});
}

export function useBook(id: string) {
	return useQuery({
		queryKey: ["books", id],
		queryFn: () => bookService.getBook(id),
		enabled: !!id,
	});
}

export function useCreateBook() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: bookService.createBook,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["books"] });
		},
	});
}

export function useUpdateBook() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookRequest }) =>
			bookService.updateBook(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["books"] });
		},
	});
}

export function useDeleteBook() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: bookService.deleteBook,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["books"] });
		},
	});
}

export function useIsbnLookup() {
	return useMutation({
		mutationFn: bookService.lookupIsbn,
	});
}
