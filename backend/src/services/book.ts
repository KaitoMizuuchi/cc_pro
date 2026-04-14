import {
	BOOK_ERROR_CODES,
	type Book,
	type BookListResponse,
	type CreateBookRequest,
	type UpdateBookRequest,
} from "@hr-management/shared";
import { prisma } from "../lib/prisma";

type BookResult<T> =
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string } };

const bookInclude = {
	registrant: { select: { id: true, name: true } },
	borrower: { select: { id: true, lastName: true, firstName: true } },
} as const;

export async function listBooks(
	page: number,
	limit: number,
): Promise<BookResult<BookListResponse>> {
	try {
		const [books, total] = await Promise.all([
			prisma.book.findMany({
				skip: (page - 1) * limit,
				take: limit,
				include: bookInclude,
				orderBy: { createdAt: "desc" },
			}),
			prisma.book.count(),
		]);
		return {
			success: true,
			data: {
				books: books as unknown as Book[],
				total,
				page,
				limit,
			},
		};
	} catch {
		return {
			success: false,
			error: {
				code: BOOK_ERROR_CODES.INTERNAL_ERROR,
				message: "書籍一覧の取得に失敗しました",
			},
		};
	}
}

export async function getBook(id: string): Promise<BookResult<Book>> {
	try {
		const book = await prisma.book.findUnique({
			where: { id },
			include: bookInclude,
		});

		if (!book) {
			return {
				success: false,
				error: {
					code: BOOK_ERROR_CODES.NOT_FOUND,
					message: "書籍が見つかりません",
				},
			};
		}

		return { success: true, data: book as unknown as Book };
	} catch {
		return {
			success: false,
			error: {
				code: BOOK_ERROR_CODES.INTERNAL_ERROR,
				message: "書籍の取得に失敗しました",
			},
		};
	}
}

export async function createBook(
	input: CreateBookRequest,
	registrantId: string,
): Promise<BookResult<Book>> {
	try {
		const registrant = await prisma.user.findUnique({
			where: { id: registrantId },
		});
		if (!registrant) {
			return {
				success: false,
				error: {
					code: BOOK_ERROR_CODES.REGISTRANT_NOT_FOUND,
					message: "登録者が見つかりません",
				},
			};
		}

		if (input.borrowerId) {
			const borrower = await prisma.employee.findUnique({
				where: { id: input.borrowerId },
			});
			if (!borrower) {
				return {
					success: false,
					error: {
						code: BOOK_ERROR_CODES.BORROWER_NOT_FOUND,
						message: "貸出者が見つかりません",
					},
				};
			}
		}

		const borrowerId =
			input.status === "LENDING" ? (input.borrowerId ?? null) : null;

		const book = await prisma.book.create({
			data: {
				isbn: input.isbn,
				title: input.title,
				author: input.author,
				category: input.category ?? null,
				coverImageUrl: input.coverImageUrl ?? null,
				status: input.status,
				registrantId,
				borrowerId,
				note: input.note ?? null,
			},
			include: bookInclude,
		});

		return { success: true, data: book as unknown as Book };
	} catch {
		return {
			success: false,
			error: {
				code: BOOK_ERROR_CODES.INTERNAL_ERROR,
				message: "書籍の登録に失敗しました",
			},
		};
	}
}

export async function updateBook(
	id: string,
	input: UpdateBookRequest,
): Promise<BookResult<Book>> {
	try {
		const existing = await prisma.book.findUnique({ where: { id } });
		if (!existing) {
			return {
				success: false,
				error: {
					code: BOOK_ERROR_CODES.NOT_FOUND,
					message: "書籍が見つかりません",
				},
			};
		}

		if (input.borrowerId) {
			const borrower = await prisma.employee.findUnique({
				where: { id: input.borrowerId },
			});
			if (!borrower) {
				return {
					success: false,
					error: {
						code: BOOK_ERROR_CODES.BORROWER_NOT_FOUND,
						message: "貸出者が見つかりません",
					},
				};
			}
		}

		const borrowerId =
			input.status === "LENDING" ? (input.borrowerId ?? null) : null;

		const book = await prisma.book.update({
			where: { id },
			data: {
				isbn: input.isbn,
				title: input.title,
				author: input.author,
				category: input.category ?? null,
				coverImageUrl: input.coverImageUrl ?? null,
				status: input.status,
				borrowerId,
				note: input.note ?? null,
			},
			include: bookInclude,
		});

		return { success: true, data: book as unknown as Book };
	} catch {
		return {
			success: false,
			error: {
				code: BOOK_ERROR_CODES.INTERNAL_ERROR,
				message: "書籍の更新に失敗しました",
			},
		};
	}
}

export async function deleteBook(
	id: string,
): Promise<BookResult<{ id: string }>> {
	try {
		const existing = await prisma.book.findUnique({ where: { id } });
		if (!existing) {
			return {
				success: false,
				error: {
					code: BOOK_ERROR_CODES.NOT_FOUND,
					message: "書籍が見つかりません",
				},
			};
		}

		await prisma.book.delete({ where: { id } });
		return { success: true, data: { id } };
	} catch {
		return {
			success: false,
			error: {
				code: BOOK_ERROR_CODES.INTERNAL_ERROR,
				message: "書籍の削除に失敗しました",
			},
		};
	}
}
