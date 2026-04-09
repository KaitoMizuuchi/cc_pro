export const PROJECT_ERROR_CODES = {
	NOT_FOUND: "PROJECT_NOT_FOUND",
	INTERNAL_ERROR: "PROJECT_INTERNAL_ERROR",
} as const;

export type ProjectErrorCode =
	(typeof PROJECT_ERROR_CODES)[keyof typeof PROJECT_ERROR_CODES];
