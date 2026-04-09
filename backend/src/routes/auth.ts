import {
	AUTH_ERROR_CODES,
	type AuthUser,
	loginSchema,
	signupBaseSchema,
} from "@hr-management/shared";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import type { JwtVariables } from "hono/jwt";
import { prisma } from "../lib/prisma";
import { login, signup } from "../services/auth";

type Env = {
	Variables: JwtVariables;
};

export const authRoutes = new Hono<Env>();

authRoutes.post("/signup", async (c) => {
	const body = await c.req.json();
	const parsed = signupBaseSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: AUTH_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const result = await signup(parsed.data);

	if (!result.success) {
		const status =
			result.error.code === AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS ? 409 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data, 201);
});

authRoutes.post("/login", async (c) => {
	const body = await c.req.json();
	const parsed = loginSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: AUTH_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const result = await login(parsed.data);

	if (!result.success) {
		return c.json({ error: result.error }, 401);
	}

	setCookie(c, "auth_token", result.data.token, {
		httpOnly: true,
		sameSite: "Lax",
		path: "/",
		maxAge: 86400,
	});

	return c.json({ user: result.data.user });
});

authRoutes.post("/logout", (c) => {
	setCookie(c, "auth_token", "", {
		httpOnly: true,
		sameSite: "Lax",
		path: "/",
		maxAge: 0,
	});

	return c.json({ message: "ログアウトしました" });
});

authRoutes.get("/me", async (c) => {
	const payload = c.get("jwtPayload");
	const userId = payload.sub as string;

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		return c.json(
			{
				error: {
					code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
					message: "ユーザーが見つかりません",
				},
			},
			401,
		);
	}

	return c.json({
		id: user.id,
		name: user.name,
		email: user.email,
	} satisfies AuthUser);
});
