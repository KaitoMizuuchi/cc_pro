import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Environment Variable Validation", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should export JWT_SECRET when the environment variable is set", async () => {
		process.env.JWT_SECRET = "test-secret-key-for-jwt";
		const { validateEnv } = await import("../env");
		const env = validateEnv();
		expect(env.JWT_SECRET).toBe("test-secret-key-for-jwt");
	});

	it("should throw an error when JWT_SECRET is not set", async () => {
		delete process.env.JWT_SECRET;
		const { validateEnv } = await import("../env");
		expect(() => validateEnv()).toThrowError("JWT_SECRET");
	});

	it("should throw an error when JWT_SECRET is an empty string", async () => {
		process.env.JWT_SECRET = "";
		const { validateEnv } = await import("../env");
		expect(() => validateEnv()).toThrowError("JWT_SECRET");
	});

	it("should include a descriptive error message when JWT_SECRET is missing", async () => {
		delete process.env.JWT_SECRET;
		const { validateEnv } = await import("../env");
		expect(() => validateEnv()).toThrowError(/JWT_SECRET.*環境変数.*設定/);
	});
});
