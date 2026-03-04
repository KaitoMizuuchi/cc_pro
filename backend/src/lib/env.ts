interface Env {
	JWT_SECRET: string;
}

export function validateEnv(): Env {
	const jwtSecret = process.env.JWT_SECRET;

	if (!jwtSecret) {
		throw new Error(
			"JWT_SECRET 環境変数が設定されていません。.env ファイルに JWT_SECRET を設定してください。",
		);
	}

	return {
		JWT_SECRET: jwtSecret,
	};
}
