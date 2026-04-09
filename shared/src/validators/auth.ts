import { z } from "zod";

const passwordRegex =
	/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/;

export const signupBaseSchema = z.object({
	name: z.string().min(1, "ユーザー名を入力してください"),
	email: z
		.string()
		.min(1, "メールアドレスを入力してください")
		.email("有効なメールアドレスを入力してください"),
	password: z
		.string()
		.min(1, "パスワードを入力してください")
		.min(8, "パスワードは8文字以上で入力してください")
		.regex(
			passwordRegex,
			"パスワードは半角英字・数字・記号をそれぞれ1文字以上含めてください",
		),
});

export const signupFormSchema = signupBaseSchema
	.extend({
		passwordConfirm: z.string().min(1, "パスワード確認を入力してください"),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "パスワードが一致しません",
		path: ["passwordConfirm"],
	});

export const loginSchema = z.object({
	email: z.string().min(1, "メールアドレスを入力してください"),
	password: z.string().min(1, "パスワードを入力してください"),
});

export type SignupRequest = z.infer<typeof signupBaseSchema>;
export type SignupFormInput = z.infer<typeof signupFormSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
