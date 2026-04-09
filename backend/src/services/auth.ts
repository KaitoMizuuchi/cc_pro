import {
	AUTH_ERROR_CODES,
	type AuthResult,
	type AuthUser,
	type LoginRequest,
	type SignupRequest,
} from "@hr-management/shared";
import { sign } from "hono/jwt";
import { getEnv } from "../lib/env";
import { prisma } from "../lib/prisma";

export async function signup(
	input: SignupRequest,
): Promise<AuthResult<AuthUser>> {
	try {
		const existing = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (existing) {
			return {
				success: false,
				error: {
					code: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
					message: "このメールアドレスは既に登録されています",
				},
			};
		}

		const hashedPassword = await Bun.password.hash(input.password, {
			algorithm: "bcrypt",
		});

		const user = await prisma.user.create({
			data: {
				name: input.name,
				email: input.email,
				password: hashedPassword,
			},
		});

		return {
			success: true,
			data: { id: user.id, name: user.name, email: user.email },
		};
	} catch {
		return {
			success: false,
			error: {
				code: AUTH_ERROR_CODES.INTERNAL_ERROR,
				message: "サーバーエラーが発生しました",
			},
		};
	}
}

export async function login(
	input: LoginRequest,
): Promise<AuthResult<{ token: string; user: AuthUser }>> {
	try {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (!user) {
			return {
				success: false,
				error: {
					code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
					message: "メールアドレスまたはパスワードが正しくありません",
				},
			};
		}

		const isValid = await Bun.password.verify(input.password, user.password);

		if (!isValid) {
			return {
				success: false,
				error: {
					code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
					message: "メールアドレスまたはパスワードが正しくありません",
				},
			};
		}

		const token = await sign(
			{
				sub: user.id,
				email: user.email,
				exp: Math.floor(Date.now() / 1000) + 86400,
			},
			getEnv().JWT_SECRET,
			"HS256",
		);

		return {
			success: true,
			data: {
				token,
				user: { id: user.id, name: user.name, email: user.email },
			},
		};
	} catch {
		return {
			success: false,
			error: {
				code: AUTH_ERROR_CODES.INTERNAL_ERROR,
				message: "サーバーエラーが発生しました",
			},
		};
	}
}
