export type AuthUser = {
	id: string;
	name: string;
	email: string;
};

export type LoginResponse = {
	user: AuthUser;
};

export type SignupResponse = AuthUser;

export type AuthErrorResponse = {
	error: {
		code: string;
		message: string;
	};
};

export type AuthResult<T> =
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string } };
