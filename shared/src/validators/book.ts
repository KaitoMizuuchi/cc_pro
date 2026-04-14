import { z } from "zod";

export const bookStatusSchema = z.enum(["STORED", "LENDING"]);

export const createBookSchema = z.object({
	isbn: z.string().min(1, "ISBNを入力してください"),
	title: z.string().min(1, "タイトルを入力してください"),
	author: z.string().min(1, "著者を入力してください"),
	category: z.string().optional(),
	coverImageUrl: z.string().optional(),
	status: bookStatusSchema,
	borrowerId: z.string().optional(),
	note: z.string().optional(),
});

export const updateBookSchema = createBookSchema;

export type CreateBookRequest = z.infer<typeof createBookSchema>;
export type UpdateBookRequest = z.infer<typeof updateBookSchema>;
