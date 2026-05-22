import { BOOK_ERROR_CODES, type IsbnLookupResult } from "@hr-management/shared";

type IsbnLookupResponse =
	| { success: true; data: IsbnLookupResult }
	| { success: false; error: { code: string; message: string } };

type GoogleBooksVolume = {
	volumeInfo: {
		title?: string;
		authors?: string[];
		categories?: string[];
		imageLinks?: {
			thumbnail?: string;
		};
	};
};

type GoogleBooksResponse = {
	totalItems: number;
	items?: GoogleBooksVolume[];
};

export async function lookupIsbn(isbn: string): Promise<IsbnLookupResponse> {
	try {
		const res = await fetch(
			`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
		);

		if (!res.ok) {
			const errorBody = await res.text();
			console.error(`Google Books API error: ${res.status} ${errorBody}`);
			return {
				success: false,
				error: {
					code: BOOK_ERROR_CODES.ISBN_LOOKUP_FAILED,
					message: `ISBN検索に失敗しました（ステータス: ${res.status}）`,
				},
			};
		}

		const data: GoogleBooksResponse = await res.json();

		if (data.totalItems === 0 || !data.items?.length) {
			return {
				success: false,
				error: {
					code: BOOK_ERROR_CODES.ISBN_LOOKUP_FAILED,
					message: "ISBNに該当する書籍が見つかりません",
				},
			};
		}

		const volume = data.items[0].volumeInfo;
		const title = volume.title ?? "";
		const author = volume.authors?.join(", ") ?? "不明";
		const category = volume.categories?.[0] ?? null;
		const coverImageUrl = volume.imageLinks?.thumbnail ?? null;

		return {
			success: true,
			data: { title, author, category, coverImageUrl },
		};
	} catch {
		return {
			success: false,
			error: {
				code: BOOK_ERROR_CODES.ISBN_LOOKUP_FAILED,
				message: "ISBN検索中にエラーが発生しました",
			},
		};
	}
}
