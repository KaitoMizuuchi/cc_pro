import type { Employee } from "@hr-management/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { ProjectsPage } from "@/pages/ProjectsPage";
import * as employeeService from "../../employees/services/employee-service";
import * as projectService from "../services/project-service";

vi.mock("../../employees/services/employee-service");
vi.mock("../services/project-service");

const employees: Employee[] = [
	{
		id: "emp-1",
		lastName: "山田",
		firstName: "太郎",
		email: "yamada@example.com",
		phone: null,
		departmentId: "d1",
		status: "ACTIVE",
		department: { id: "d1", name: "営業" },
		position: "課長",
		hireDate: "2020-04-01",
		note: null,
		createdAt: "2020-04-01T00:00:00Z",
		updatedAt: "2020-04-01T00:00:00Z",
	},
	{
		id: "emp-2",
		lastName: "佐藤",
		firstName: "花子",
		email: "sato@example.com",
		phone: null,
		departmentId: "d1",
		status: "ACTIVE",
		department: { id: "d1", name: "営業" },
		position: "主任",
		hireDate: "2021-04-01",
		note: null,
		createdAt: "2021-04-01T00:00:00Z",
		updatedAt: "2021-04-01T00:00:00Z",
	},
	{
		id: "emp-3",
		lastName: "鈴木",
		firstName: "一郎",
		email: "suzuki@example.com",
		phone: null,
		departmentId: "d2",
		status: "ACTIVE",
		department: { id: "d2", name: "開発" },
		position: "エンジニア",
		hireDate: "2022-04-01",
		note: null,
		createdAt: "2022-04-01T00:00:00Z",
		updatedAt: "2022-04-01T00:00:00Z",
	},
];

const renderPage = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<ProjectsPage />
				<Toaster />
			</MemoryRouter>
		</QueryClientProvider>,
	);
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(projectService.listProjects).mockResolvedValue({ projects: [] });
	vi.mocked(employeeService.searchEmployees).mockImplementation(
		async (query: string, excludeId?: string) => {
			const filtered = employees
				.filter((e) => (excludeId ? e.id !== excludeId : true))
				.filter((e) =>
					query
						? e.lastName.includes(query) || e.firstName.includes(query)
						: true,
				);
			return { employees: filtered };
		},
	);
});

describe("プロジェクト追加フロー - 結合テスト", () => {
	it("「プロジェクト追加」ボタンが表示される", async () => {
		renderPage();
		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "プロジェクト一覧" }),
			).toBeInTheDocument();
		});
		expect(
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		).toBeInTheDocument();
	});

	it("ボタン押下でモーダルが表示される", async () => {
		const user = userEvent.setup();
		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);

		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));

		expect(
			screen.getByRole("heading", { name: "プロジェクト追加" }),
		).toBeInTheDocument();
	});

	it("必須項目未入力で送信するとバリデーションエラーを表示", async () => {
		const user = userEvent.setup();
		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);
		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));
		await user.click(screen.getByRole("button", { name: "登録" }));

		await waitFor(() => {
			expect(
				screen.getByText("プロジェクト名を入力してください"),
			).toBeInTheDocument();
		});
		expect(screen.getByText("説明を入力してください")).toBeInTheDocument();
		expect(screen.getByText("リーダーを選択してください")).toBeInTheDocument();
		expect(
			screen.getByText("メンバーを1名以上選択してください"),
		).toBeInTheDocument();
		expect(projectService.createProject).not.toHaveBeenCalled();
	});

	it("説明201文字でバリデーションエラー", async () => {
		const user = userEvent.setup();
		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);
		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));

		await user.type(screen.getByLabelText("プロジェクト名"), "テスト");
		await user.type(screen.getByLabelText("説明"), "a".repeat(201));
		await user.click(screen.getByRole("button", { name: "登録" }));

		await waitFor(() => {
			expect(
				screen.getByText("説明は200文字以内で入力してください"),
			).toBeInTheDocument();
		});
	});

	it("リーダー選択後、メンバー候補からリーダーが除外される", async () => {
		const user = userEvent.setup();
		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);
		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));

		await user.type(screen.getByLabelText("リーダー"), "山");
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /山田 太郎/ }),
			).toBeInTheDocument();
		});
		await user.click(screen.getByRole("button", { name: /山田 太郎/ }));

		await user.click(screen.getByLabelText("メンバー"));
		await waitFor(() => {
			expect(vi.mocked(employeeService.searchEmployees)).toHaveBeenCalledWith(
				"",
				"emp-1",
			);
		});
	});

	it("リーダーを変更すると、旧リーダーがメンバー候補に再登場する", async () => {
		const user = userEvent.setup();
		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);
		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));

		await user.type(screen.getByLabelText("リーダー"), "山");
		await waitFor(() => screen.getByRole("button", { name: /山田 太郎/ }));
		await user.click(screen.getByRole("button", { name: /山田 太郎/ }));

		await user.click(screen.getByRole("button", { name: "リーダー選択解除" }));

		await user.type(screen.getByLabelText("リーダー"), "佐");
		await waitFor(() => screen.getByRole("button", { name: /佐藤 花子/ }));
		await user.click(screen.getByRole("button", { name: /佐藤 花子/ }));

		await user.click(screen.getByLabelText("メンバー"));
		await waitFor(() => {
			expect(vi.mocked(employeeService.searchEmployees)).toHaveBeenCalledWith(
				"",
				"emp-2",
			);
		});
	});

	it("正常系: 必須項目入力 + メンバー1名で登録成功", async () => {
		const user = userEvent.setup();
		vi.mocked(projectService.createProject).mockResolvedValue({
			id: "p1",
			name: "新規プロジェクト",
			description: "説明",
			leader: { id: "emp-1", lastName: "山田", firstName: "太郎" },
			createdAt: "2026-05-22T00:00:00Z",
			updatedAt: "2026-05-22T00:00:00Z",
		});

		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);
		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));

		await user.type(
			screen.getByLabelText("プロジェクト名"),
			"新規プロジェクト",
		);
		await user.type(screen.getByLabelText("説明"), "説明文");

		await user.type(screen.getByLabelText("リーダー"), "山");
		await waitFor(() => screen.getByRole("button", { name: /山田 太郎/ }));
		await user.click(screen.getByRole("button", { name: /山田 太郎/ }));

		await user.type(screen.getByLabelText("メンバー"), "佐");
		await waitFor(() => screen.getByRole("button", { name: /佐藤 花子/ }));
		await user.click(screen.getByRole("button", { name: /佐藤 花子/ }));

		await user.click(screen.getByRole("button", { name: "登録" }));

		await waitFor(() => {
			expect(projectService.createProject).toHaveBeenCalled();
		});
		expect(vi.mocked(projectService.createProject).mock.calls[0][0]).toEqual({
			name: "新規プロジェクト",
			description: "説明文",
			leaderId: "emp-1",
			memberIds: ["emp-2"],
		});

		await waitFor(() => {
			expect(
				screen.queryByRole("heading", { name: "プロジェクト追加" }),
			).not.toBeInTheDocument();
		});
	});

	it("既存と同名で 409 エラー時に toast が表示される", async () => {
		const user = userEvent.setup();
		vi.mocked(projectService.createProject).mockRejectedValue(
			new ApiError(
				"同名のプロジェクトが既に存在します",
				"PROJECT_NAME_ALREADY_EXISTS",
			),
		);

		renderPage();
		await waitFor(() =>
			screen.getByRole("button", { name: /プロジェクト追加/ }),
		);
		await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));

		await user.type(screen.getByLabelText("プロジェクト名"), "重複名");
		await user.type(screen.getByLabelText("説明"), "説明");

		await user.type(screen.getByLabelText("リーダー"), "山");
		await waitFor(() => screen.getByRole("button", { name: /山田 太郎/ }));
		await user.click(screen.getByRole("button", { name: /山田 太郎/ }));

		await user.type(screen.getByLabelText("メンバー"), "佐");
		await waitFor(() => screen.getByRole("button", { name: /佐藤 花子/ }));
		await user.click(screen.getByRole("button", { name: /佐藤 花子/ }));

		await user.click(screen.getByRole("button", { name: "登録" }));

		const toast = await screen.findByText("同名のプロジェクトが既に存在します");
		expect(toast).toBeInTheDocument();
		// モーダルは閉じない
		expect(
			screen.getByRole("heading", { name: "プロジェクト追加" }),
		).toBeInTheDocument();
	});
});
