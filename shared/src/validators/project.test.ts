import { describe, expect, it } from "vitest";
import { createProjectSchema } from "./project";

const validInput = {
	name: "プロジェクト",
	description: "説明",
	leaderId: "leader-1",
	memberIds: ["member-1"],
};

describe("createProjectSchema - 境界値テスト", () => {
	it("有効な入力をパースできる", () => {
		const result = createProjectSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it("説明200文字ちょうどはOK", () => {
		const result = createProjectSchema.safeParse({
			...validInput,
			description: "a".repeat(200),
		});
		expect(result.success).toBe(true);
	});

	it("説明201文字はエラー", () => {
		const result = createProjectSchema.safeParse({
			...validInput,
			description: "a".repeat(201),
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.errors[0].message).toContain("200文字");
		}
	});

	it("プロジェクト名が空文字はエラー", () => {
		const result = createProjectSchema.safeParse({ ...validInput, name: "" });
		expect(result.success).toBe(false);
	});

	it("説明が空文字はエラー", () => {
		const result = createProjectSchema.safeParse({
			...validInput,
			description: "",
		});
		expect(result.success).toBe(false);
	});

	it("リーダーが空文字はエラー", () => {
		const result = createProjectSchema.safeParse({
			...validInput,
			leaderId: "",
		});
		expect(result.success).toBe(false);
	});

	it("メンバーが空配列はエラー", () => {
		const result = createProjectSchema.safeParse({
			...validInput,
			memberIds: [],
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.errors[0].message).toContain("1名以上");
		}
	});

	it("メンバーが1名でもOK", () => {
		const result = createProjectSchema.safeParse({
			...validInput,
			memberIds: ["m1"],
		});
		expect(result.success).toBe(true);
	});
});
