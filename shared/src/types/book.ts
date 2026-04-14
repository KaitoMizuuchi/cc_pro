export type BookStatus = "STORED" | "LENDING";

export type BookRegistrant = {
	id: string;
	name: string;
};

export type BookBorrower = {
	id: string;
	lastName: string;
	firstName: string;
};

export type Book = {
	id: string;
	isbn: string;
	title: string;
	author: string;
	category: string | null;
	coverImageUrl: string | null;
	status: BookStatus;
	registrantId: string;
	registrant: BookRegistrant;
	borrowerId: string | null;
	borrower: BookBorrower | null;
	note: string | null;
	createdAt: string;
	updatedAt: string;
};

export type BookListResponse = {
	books: Book[];
	total: number;
	page: number;
	limit: number;
};

export type IsbnLookupResult = {
	title: string;
	author: string;
	category: string | null;
	coverImageUrl: string | null;
};
