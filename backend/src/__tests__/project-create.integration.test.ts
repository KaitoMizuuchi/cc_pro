import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = {
	employee: {
		findUnique: vi.fn(),
		findMany: vi.fn(),
	},
	project: {
		findUnique: vi.fn(),
		create: vi.fn(),
	},
	projectMember: {
		createMany: vi.fn(),
	},
	$transaction: vi.fn(),
};

vi.mock("../lib/prisma", () => ({
	prisma: mockPrisma,
}));

const buildApp = async () => {
	const { projectRoutes } = await import("../routes/project");
	const app = new Hono();
	app.route("/api/projects", projectRoutes);
	return app;
};

const validLeader = { id: "leader-1", lastName: "山田", firstName: "太郎" };
const validMembers = [{ id: "member-1" }, { id: "member-2" }];

const validPayload = {
	name: "新規プロジェクト",
	description: "説明文",
	leaderId: validLeader.id,
	memberIds: validMembers.map((m) => m.id),
};

beforeEach(() => {
	vi.clearAllMocks();
	mockPrisma.$transaction.mockImplementation(
		async (callback: (tx: typeof mockPrisma) => Promise<unknown>) =>
			callback(mockPrisma),
	);
});

describe("POST /api/projects - 結合テスト", () => {
	describe("正常系", () => {
		it("有効な入力で 201 を返し、プロジェクトが作成される", async () => {
			mockPrisma.employee.findUnique.mockResolvedValue(validLeader);
			mockPrisma.employee.findMany.mockResolvedValue(validMembers);
			mockPrisma.project.findUnique.mockResolvedValue(null);
			mockPrisma.project.create.mockResolvedValue({
				id: "proj-1",
				name: validPayload.name,
				description: validPayload.description,
				leaderId: validLeader.id,
				leader: validLeader,
				createdAt: new Date("2026-05-22T00:00:00Z"),
				updatedAt: new Date("2026-05-22T00:00:00Z"),
			});
			mockPrisma.projectMember.createMany.mockResolvedValue({ count: 2 });

			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validPayload),
			});

			expect(res.status).toBe(201);
			const body = (await res.json()) as {
				name: string;
				leader: { id: string };
			};
			expect(body.name).toBe(validPayload.name);
			expect(body.leader.id).toBe(validLeader.id);
			expect(mockPrisma.projectMember.createMany).toHaveBeenCalledWith({
				data: [
					{ projectId: "proj-1", employeeId: "member-1" },
					{ projectId: "proj-1", employeeId: "member-2" },
				],
			});
		});

		it("メンバー1名のみでも 201 を返す", async () => {
			mockPrisma.employee.findUnique.mockResolvedValue(validLeader);
			mockPrisma.employee.findMany.mockResolvedValue([{ id: "member-1" }]);
			mockPrisma.project.findUnique.mockResolvedValue(null);
			mockPrisma.project.create.mockResolvedValue({
				id: "proj-1",
				name: "X",
				description: "Y",
				leaderId: validLeader.id,
				leader: validLeader,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			mockPrisma.projectMember.createMany.mockResolvedValue({ count: 1 });

			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...validPayload,
					memberIds: ["member-1"],
				}),
			});

			expect(res.status).toBe(201);
		});

		it("説明200文字ちょうどでも 201 を返す", async () => {
			mockPrisma.employee.findUnique.mockResolvedValue(validLeader);
			mockPrisma.employee.findMany.mockResolvedValue(validMembers);
			mockPrisma.project.findUnique.mockResolvedValue(null);
			mockPrisma.project.create.mockResolvedValue({
				id: "proj-1",
				name: validPayload.name,
				description: "a".repeat(200),
				leaderId: validLeader.id,
				leader: validLeader,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			mockPrisma.projectMember.createMany.mockResolvedValue({ count: 2 });

			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...validPayload,
					description: "a".repeat(200),
				}),
			});

			expect(res.status).toBe(201);
		});
	});

	describe("異常系", () => {
		it("プロジェクト名未入力で 400 を返す", async () => {
			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...validPayload, name: "" }),
			});

			expect(res.status).toBe(400);
			const body = (await res.json()) as {
				error: { code: string; message: string };
			};
			expect(body.error.code).toBe("PROJECT_VALIDATION_ERROR");
			expect(body.error.message).toContain("プロジェクト名");
		});

		it("説明未入力で 400 を返す", async () => {
			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...validPayload, description: "" }),
			});

			expect(res.status).toBe(400);
		});

		it("説明201文字以上で 400 を返す", async () => {
			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...validPayload,
					description: "a".repeat(201),
				}),
			});

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: { message: string } };
			expect(body.error.message).toContain("200文字以内");
		});

		it("リーダー未選択で 400 を返す", async () => {
			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...validPayload, leaderId: "" }),
			});

			expect(res.status).toBe(400);
		});

		it("メンバー0名で 400 を返す", async () => {
			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...validPayload, memberIds: [] }),
			});

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: { message: string } };
			expect(body.error.message).toContain("メンバー");
		});

		it("既存と同名で 409 を返す", async () => {
			mockPrisma.employee.findUnique.mockResolvedValue(validLeader);
			mockPrisma.employee.findMany.mockResolvedValue(validMembers);
			mockPrisma.project.findUnique.mockResolvedValue({
				id: "existing",
				name: validPayload.name,
			});

			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validPayload),
			});

			expect(res.status).toBe(409);
			const body = (await res.json()) as { error: { code: string } };
			expect(body.error.code).toBe("PROJECT_NAME_ALREADY_EXISTS");
		});

		it("リーダーがメンバーに含まれる場合 400 を返す", async () => {
			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...validPayload,
					memberIds: [validLeader.id, "member-1"],
				}),
			});

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: { code: string } };
			expect(body.error.code).toBe("PROJECT_LEADER_IN_MEMBERS");
		});

		it("リーダーが存在しない従業員IDの場合 400 を返す", async () => {
			mockPrisma.employee.findUnique.mockResolvedValue(null);

			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validPayload),
			});

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: { code: string } };
			expect(body.error.code).toBe("PROJECT_LEADER_NOT_FOUND");
		});

		it("メンバーIDの一部が存在しない場合 400 を返す", async () => {
			mockPrisma.employee.findUnique.mockResolvedValue(validLeader);
			mockPrisma.employee.findMany.mockResolvedValue([{ id: "member-1" }]);

			const app = await buildApp();
			const res = await app.request("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(validPayload),
			});

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: { code: string } };
			expect(body.error.code).toBe("PROJECT_MEMBER_NOT_FOUND");
		});
	});
});
