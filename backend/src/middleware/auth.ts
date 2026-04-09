import { AUTH_ERROR_CODES } from "@hr-management/shared";
import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import { getEnv } from "../lib/env";

const EXCLUDED_PATHS = ["/api/auth/signup", "/api/auth/login", "/api/health"];

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	if (EXCLUDED_PATHS.includes(c.req.path)) {
		return next();
	}

	const token = getCookie(c, "auth_token");

	if (!token) {
		return c.json(
			{
				error: {
					code: AUTH_ERROR_CODES.TOKEN_MISSING,
					message: "認証トークンが必要です",
				},
			},
			401,
		);
	}

	try {
		const payload = await verify(token, getEnv().JWT_SECRET, "HS256");
		c.set("jwtPayload", payload);
		return next();
	} catch (e) {
		if (e instanceof JwtTokenExpired) {
			return c.json(
				{
					error: {
						code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
						message: "認証トークンの有効期限が切れています",
					},
				},
				401,
			);
		}

		return c.json(
			{
				error: {
					code: AUTH_ERROR_CODES.TOKEN_INVALID,
					message: "認証トークンが無効です",
				},
			},
			401,
		);
	}
};
