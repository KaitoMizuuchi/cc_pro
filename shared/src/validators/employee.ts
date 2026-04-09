import { z } from "zod";

export const employeeStatusSchema = z.enum(["ACTIVE", "ON_LEAVE", "RETIRED"]);

export const createEmployeeSchema = z.object({
	lastName: z.string().min(1, "姓を入力してください"),
	firstName: z.string().min(1, "名を入力してください"),
	email: z
		.string()
		.min(1, "メールアドレスを入力してください")
		.email("有効なメールアドレスを入力してください"),
	phone: z.string().optional(),
	departmentId: z.string().min(1, "部署を選択してください"),
	position: z.string().min(1, "役職を入力してください"),
	hireDate: z.string().min(1, "入社日を入力してください"),
	status: employeeStatusSchema,
	note: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema;

export type CreateEmployeeRequest = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeRequest = z.infer<typeof updateEmployeeSchema>;
