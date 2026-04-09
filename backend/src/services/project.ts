import {
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
