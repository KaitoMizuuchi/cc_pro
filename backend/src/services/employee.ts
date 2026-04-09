import {
	type CreateEmployeeRequest,
	EMPLOYEE_ERROR_CODES,
	type Employee,
	type EmployeeListResponse,
	type UpdateEmployeeRequest,
} from "@hr-management/shared";
import { prisma } from "../lib/prisma";

type EmployeeResult<T> =
	| { success: true; data: T }
	| { success: false; error: { code: string; message: string } };

const employeeInclude = {
	department: { select: { id: true, name: true } },
} as const;

export async function listEmployees(
	page: number,
	limit: number,
): Promise<EmployeeResult<EmployeeListResponse>> {
	try {
		const [employees, total] = await Promise.all([
			prisma.employee.findMany({
				skip: (page - 1) * limit,
				take: limit,
				include: employeeInclude,
				orderBy: { createdAt: "desc" },
			}),
			prisma.employee.count(),
		]);
		return {
			success: true,
			data: {
				employees: employees as unknown as Employee[],
				total,
				page,
				limit,
			},
		};
	} catch {
		return {
			success: false,
			error: {
				code: EMPLOYEE_ERROR_CODES.INTERNAL_ERROR,
				message: "従業員一覧の取得に失敗しました",
			},
		};
	}
}

export async function getEmployee(
	id: string,
): Promise<EmployeeResult<Employee>> {
	try {
		const employee = await prisma.employee.findUnique({
			where: { id },
			include: employeeInclude,
		});

		if (!employee) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.NOT_FOUND,
					message: "従業員が見つかりません",
				},
			};
		}

		return { success: true, data: employee as unknown as Employee };
	} catch {
		return {
			success: false,
			error: {
				code: EMPLOYEE_ERROR_CODES.INTERNAL_ERROR,
				message: "従業員の取得に失敗しました",
			},
		};
	}
}

export async function createEmployee(
	input: CreateEmployeeRequest,
): Promise<EmployeeResult<Employee>> {
	try {
		const department = await prisma.department.findUnique({
			where: { id: input.departmentId },
		});
		if (!department) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.DEPARTMENT_NOT_FOUND,
					message: "選択された部署が見つかりません",
				},
			};
		}

		const existing = await prisma.employee.findUnique({
			where: { email: input.email },
		});
		if (existing) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.EMAIL_ALREADY_EXISTS,
					message: "このメールアドレスは既に使用されています",
				},
			};
		}

		const employee = await prisma.employee.create({
			data: {
				...input,
				phone: input.phone ?? null,
				note: input.note ?? null,
				hireDate: new Date(input.hireDate),
			},
			include: employeeInclude,
		});

		return { success: true, data: employee as unknown as Employee };
	} catch {
		return {
			success: false,
			error: {
				code: EMPLOYEE_ERROR_CODES.INTERNAL_ERROR,
				message: "従業員の登録に失敗しました",
			},
		};
	}
}

export async function updateEmployee(
	id: string,
	input: UpdateEmployeeRequest,
): Promise<EmployeeResult<Employee>> {
	try {
		const existing = await prisma.employee.findUnique({ where: { id } });
		if (!existing) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.NOT_FOUND,
					message: "従業員が見つかりません",
				},
			};
		}

		const department = await prisma.department.findUnique({
			where: { id: input.departmentId },
		});
		if (!department) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.DEPARTMENT_NOT_FOUND,
					message: "選択された部署が見つかりません",
				},
			};
		}

		const emailConflict = await prisma.employee.findFirst({
			where: { email: input.email, id: { not: id } },
		});
		if (emailConflict) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.EMAIL_ALREADY_EXISTS,
					message: "このメールアドレスは既に使用されています",
				},
			};
		}

		const employee = await prisma.employee.update({
			where: { id },
			data: {
				...input,
				phone: input.phone ?? null,
				note: input.note ?? null,
				hireDate: new Date(input.hireDate),
			},
			include: employeeInclude,
		});

		return { success: true, data: employee as unknown as Employee };
	} catch {
		return {
			success: false,
			error: {
				code: EMPLOYEE_ERROR_CODES.INTERNAL_ERROR,
				message: "従業員の更新に失敗しました",
			},
		};
	}
}

export async function deleteEmployee(
	id: string,
): Promise<EmployeeResult<{ id: string }>> {
	try {
		const existing = await prisma.employee.findUnique({ where: { id } });
		if (!existing) {
			return {
				success: false,
				error: {
					code: EMPLOYEE_ERROR_CODES.NOT_FOUND,
					message: "従業員が見つかりません",
				},
			};
		}

		await prisma.employee.delete({ where: { id } });
		return { success: true, data: { id } };
	} catch {
		return {
			success: false,
			error: {
				code: EMPLOYEE_ERROR_CODES.INTERNAL_ERROR,
				message: "従業員の削除に失敗しました",
			},
		};
	}
}
