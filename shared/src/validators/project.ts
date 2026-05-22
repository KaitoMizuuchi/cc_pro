import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string().min(1, "プロジェクト名を入力してください"),
	description: z
		.string()
		.min(1, "説明を入力してください")
		.max(200, "説明は200文字以内で入力してください"),
	leaderId: z.string().min(1, "リーダーを選択してください"),
	memberIds: z
		.array(z.string().min(1))
		.min(1, "メンバーを1名以上選択してください"),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
