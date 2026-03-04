import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Server Startup - Environment Validation", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should fail to start when JWT_SECRET is not set", async () => {
		delete process.env.JWT_SECRET;

		await expect(async () => {
			await import("../index");
		}).rejects.toThrowError("JWT_SECRET");
	});

	it("should start successfully when JWT_SECRET is set", async () => {
		process.env.JWT_SECRET = "test-secret";

		const mod = await import("../index");
		expect(mod.default).toBeDefined();
		expect(mod.default.port).toBe(3000);
	});
});
