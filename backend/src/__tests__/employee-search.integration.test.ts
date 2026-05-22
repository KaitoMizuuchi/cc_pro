import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = {
	employee: {
		findMany: vi.fn(),
	},
};

vi.mock("../lib/prisma", () => ({
	prisma: mockPrisma,
}));

const buildApp = async () => {
	const { employeeRoutes } = await import("../routes/employee");
	const app = new Hono();
	app.route("/api/employees", employeeRoutes);
	return app;
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("GET /api/employees/search - 結合テスト", () => {
	it("query にマッチする ACTIVE 従業員を返す", async () => {
		mockPrisma.employee.findMany.mockResolvedValue([
			{
				id: "e1",
				lastName: "山田",
				firstName: "太郎",
				email: "yamada@example.com",
				status: "ACTIVE",
				department: { id: "d1", name: "営業" },
			},
		]);

		const app = await buildApp();
		const res = await app.request("/api/employees/search?query=山田");

		expect(res.status).toBe(200);
		const body = (await res.json()) as { employees: { id: string }[] };
		expect(body.employees).toHaveLength(1);
		expect(body.employees[0].id).toBe("e1");

		const findManyCall = mockPrisma.employee.findMany.mock.calls[0][0];
		expect(findManyCall.where.status).toBe("ACTIVE");
		expect(findManyCall.where.OR).toEqual([
			{ lastName: { contains: "山田", mode: "insensitive" } },
			{ firstName: { contains: "山田", mode: "insensitive" } },
		]);
		expect(findManyCall.take).toBe(50);
	});

	it("excludeId 指定で対象従業員を除外する", async () => {
		mockPrisma.employee.findMany.mockResolvedValue([]);

		const app = await buildApp();
		const res = await app.request(
			"/api/employees/search?query=山田&excludeId=leader-1",
		);

		expect(res.status).toBe(200);
		const findManyCall = mockPrisma.employee.findMany.mock.calls[0][0];
		expect(findManyCall.where.id).toEqual({ not: "leader-1" });
	});

	it("query が空文字のときも全ACTIVE従業員を返す", async () => {
		mockPrisma.employee.findMany.mockResolvedValue([]);

		const app = await buildApp();
		const res = await app.request("/api/employees/search?query=");

		expect(res.status).toBe(200);
		const findManyCall = mockPrisma.employee.findMany.mock.calls[0][0];
		expect(findManyCall.where.OR).toBeUndefined();
		expect(findManyCall.where.status).toBe("ACTIVE");
	});
});
