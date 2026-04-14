import {
	BOOK_ERROR_CODES,
	createBookSchema,
	updateBookSchema,
} from "@hr-management/shared";
import { Hono } from "hono";
import * as bookService from "../services/book";
import { lookupIsbn } from "../services/isbn-lookup";

export const bookRoutes = new Hono();

bookRoutes.get("/", async (c) => {
	const page = Number(c.req.query("page") || "1");
	const limit = Number(c.req.query("limit") || "10");
	const result = await bookService.listBooks(page, limit);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json(result.data);
});

bookRoutes.get("/lookup/:isbn", async (c) => {
	const isbn = c.req.param("isbn");
	const result = await lookupIsbn(isbn);

	if (!result.success) {
		return c.json({ error: result.error }, 404);
	}

	return c.json(result.data);
});

bookRoutes.get("/:id", async (c) => {
	const result = await bookService.getBook(c.req.param("id"));

	if (!result.success) {
		const status = result.error.code === BOOK_ERROR_CODES.NOT_FOUND ? 404 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});

bookRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const parsed = createBookSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: BOOK_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const payload = c.get("jwtPayload") as { sub: string };
	const registrantId = payload.sub;
	const result = await bookService.createBook(parsed.data, registrantId);

	if (!result.success) {
		const status =
			result.error.code === BOOK_ERROR_CODES.BORROWER_NOT_FOUND ? 400 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data, 201);
});

bookRoutes.put("/:id", async (c) => {
	const body = await c.req.json();
	const parsed = updateBookSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: BOOK_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const result = await bookService.updateBook(c.req.param("id"), parsed.data);

	if (!result.success) {
		const status =
			result.error.code === BOOK_ERROR_CODES.NOT_FOUND
				? 404
				: result.error.code === BOOK_ERROR_CODES.BORROWER_NOT_FOUND
					? 400
					: 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});

bookRoutes.delete("/:id", async (c) => {
	const result = await bookService.deleteBook(c.req.param("id"));

	if (!result.success) {
		const status = result.error.code === BOOK_ERROR_CODES.NOT_FOUND ? 404 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});
