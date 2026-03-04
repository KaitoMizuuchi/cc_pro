import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock PrismaClient before importing the module under test
vi.mock("../../generated/prisma/client", () => {
	const MockPrismaClient = vi.fn().mockImplementation(() => ({
		user: {},
		$connect: vi.fn(),
		$disconnect: vi.fn(),
	}));
	return { PrismaClient: MockPrismaClient };
});

describe("PrismaClient Singleton", () => {
	beforeEach(() => {
		// Clean up global cache before each test
		const globalForPrisma = globalThis as unknown as {
			prisma: unknown | undefined;
		};
		globalForPrisma.prisma = undefined;
		// Reset module registry so we get fresh imports
		vi.resetModules();
	});

	it("should export a PrismaClient instance", async () => {
		const { prisma } = await import("../prisma");
		expect(prisma).toBeDefined();
		expect(prisma).toHaveProperty("user");
	});

	it("should return the same instance on multiple imports (singleton)", async () => {
		const mod1 = await import("../prisma");
		const mod2 = await import("../prisma");
		expect(mod1.prisma).toBe(mod2.prisma);
	});

	it("should cache the instance on globalThis in non-production environment", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		const { prisma } = await import("../prisma");

		const globalForPrisma = globalThis as unknown as {
			prisma: unknown | undefined;
		};
		expect(globalForPrisma.prisma).toBe(prisma);

		process.env.NODE_ENV = originalEnv;
	});

	it("should reuse globalThis cached instance instead of creating new one", async () => {
		const cachedInstance = { user: {}, _isCached: true };
		const globalForPrisma = globalThis as unknown as {
			prisma: unknown | undefined;
		};
		globalForPrisma.prisma = cachedInstance;

		const { prisma } = await import("../prisma");
		expect(prisma).toBe(cachedInstance);
	});
});
