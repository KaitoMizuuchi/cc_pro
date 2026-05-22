import {
	type CreateProjectRequest,
	PROJECT_ERROR_CODES,
	type Project,
	type ProjectDetail,
	type ProjectMember,
} from "@hr-management/shared";
import { prisma } from "../lib/prisma";

type ProjectResult<T> =
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string } };

export async function listProjects(): Promise<
	ProjectResult<{ projects: Project[] }>
> {
	try {
		const projects = await prisma.project.findMany({
			include: {
				leader: {
					select: { id: true, lastName: true, firstName: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return {
			success: true,
			data: { projects: projects as unknown as Project[] },
		};
	} catch {
		return {
			success: false,
			error: {
				code: PROJECT_ERROR_CODES.INTERNAL_ERROR,
				message: "プロジェクト一覧の取得に失敗しました",
			},
		};
	}
}

export async function getProject(
	id: string,
): Promise<ProjectResult<ProjectDetail>> {
	try {
		const project = await prisma.project.findUnique({
			where: { id },
			include: {
				leader: {
					select: { id: true, lastName: true, firstName: true },
				},
				members: {
					include: {
						employee: {
							select: {
								id: true,
								lastName: true,
								firstName: true,
								email: true,
								position: true,
								department: { select: { id: true, name: true } },
							},
						},
					},
				},
			},
		});

		if (!project) {
			return {
				success: false,
				error: {
					code: PROJECT_ERROR_CODES.NOT_FOUND,
					message: "プロジェクトが見つかりません",
				},
			};
		}

		const members: ProjectMember[] = project.members.map((m) => ({
			id: m.id,
			employeeId: m.employee.id,
			lastName: m.employee.lastName,
			firstName: m.employee.firstName,
			email: m.employee.email,
			department: m.employee.department,
			position: m.employee.position,
		}));

		return {
			success: true,
			data: {
				id: project.id,
				name: project.name,
				description: project.description,
				leader: project.leader,
				members,
				createdAt: project.createdAt.toISOString(),
				updatedAt: project.updatedAt.toISOString(),
			},
		};
	} catch {
		return {
			success: false,
			error: {
				code: PROJECT_ERROR_CODES.INTERNAL_ERROR,
				message: "プロジェクトの取得に失敗しました",
			},
		};
	}
}

export async function createProject(
	input: CreateProjectRequest,
): Promise<ProjectResult<Project>> {
	try {
		if (input.memberIds.includes(input.leaderId)) {
			return {
				success: false,
				error: {
					code: PROJECT_ERROR_CODES.LEADER_IN_MEMBERS,
					message: "リーダーをメンバーに含めることはできません",
				},
			};
		}

		const uniqueMemberIds = Array.from(new Set(input.memberIds));

		const leader = await prisma.employee.findUnique({
			where: { id: input.leaderId },
		});
		if (!leader) {
			return {
				success: false,
				error: {
					code: PROJECT_ERROR_CODES.LEADER_NOT_FOUND,
					message: "選択されたリーダーが見つかりません",
				},
			};
		}

		const members = await prisma.employee.findMany({
			where: { id: { in: uniqueMemberIds } },
			select: { id: true },
		});
		if (members.length !== uniqueMemberIds.length) {
			return {
				success: false,
				error: {
					code: PROJECT_ERROR_CODES.MEMBER_NOT_FOUND,
					message: "選択されたメンバーが見つかりません",
				},
			};
		}

		const duplicated = await prisma.project.findUnique({
			where: { name: input.name },
		});
		if (duplicated) {
			return {
				success: false,
				error: {
					code: PROJECT_ERROR_CODES.NAME_ALREADY_EXISTS,
					message: "同名のプロジェクトが既に存在します",
				},
			};
		}

		const created = await prisma.$transaction(async (tx) => {
			const project = await tx.project.create({
				data: {
					name: input.name,
					description: input.description,
					leaderId: input.leaderId,
				},
				include: {
					leader: {
						select: { id: true, lastName: true, firstName: true },
					},
				},
			});

			await tx.projectMember.createMany({
				data: uniqueMemberIds.map((employeeId) => ({
					projectId: project.id,
					employeeId,
				})),
			});

			return project;
		});

		return {
			success: true,
			data: {
				id: created.id,
				name: created.name,
				description: created.description,
				leader: created.leader,
				createdAt: created.createdAt.toISOString(),
				updatedAt: created.updatedAt.toISOString(),
			},
		};
	} catch (error) {
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			(error as { code: string }).code === "P2002"
		) {
			return {
				success: false,
				error: {
					code: PROJECT_ERROR_CODES.NAME_ALREADY_EXISTS,
					message: "同名のプロジェクトが既に存在します",
				},
			};
		}
		return {
			success: false,
			error: {
				code: PROJECT_ERROR_CODES.INTERNAL_ERROR,
				message: "プロジェクトの登録に失敗しました",
			},
		};
	}
}
