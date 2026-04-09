interface Env {
	JWT_SECRET: string;
}

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
	const jwtSecret = process.env.JWT_SECRET;

	if (!jwtSecret) {
		throw new Error(
			"JWT_SECRET 環境変数が設定されていません。.env ファイルに JWT_SECRET を設定してください。",
		);
	}

	validatedEnv = { JWT_SECRET: jwtSecret };
	return validatedEnv;
}

export function getEnv(): Env {
	if (!validatedEnv) {
		return validateEnv();
	}
	return validatedEnv;
}
