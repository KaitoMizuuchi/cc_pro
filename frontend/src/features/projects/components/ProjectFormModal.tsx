import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateProjectRequest } from "@hr-management/shared";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { useCreateProject } from "../hooks/useProjects";
import { EmployeeSearchSelect } from "./EmployeeSearchSelect";

const selectedEmployeeSchema = z.object({
	id: z.string().min(1),
	lastName: z.string(),
	firstName: z.string(),
});

const projectFormSchema = z.object({
	name: z.string().min(1, "プロジェクト名を入力してください"),
	description: z
		.string()
		.min(1, "説明を入力してください")
		.max(200, "説明は200文字以内で入力してください"),
	leader: selectedEmployeeSchema
		.nullable()
		.refine((v): v is z.infer<typeof selectedEmployeeSchema> => v !== null, {
			message: "リーダーを選択してください",
		}),
	members: z
		.array(selectedEmployeeSchema)
		.min(1, "メンバーを1名以上選択してください"),
});

type FormInput = z.input<typeof projectFormSchema>;
type FormOutput = z.output<typeof projectFormSchema>;

type Props = {
	open: boolean;
	onClose: () => void;
};

export function ProjectFormModal({ open, onClose }: Props) {
	const createMutation = useCreateProject();

	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FormInput, unknown, FormOutput>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: {
			name: "",
			description: "",
			leader: null,
			members: [],
		},
	});

	const description = watch("description");
	const leader = watch("leader");
	const members = watch("members");

	useEffect(() => {
		if (open) {
			reset({
				name: "",
				description: "",
				leader: null,
				members: [],
			});
		}
	}, [open, reset]);

	useEffect(() => {
		if (leader && members.some((m) => m.id === leader.id)) {
			setValue(
				"members",
				members.filter((m) => m.id !== leader.id),
			);
		}
	}, [leader, members, setValue]);

	if (!open) return null;

	const onSubmit = (data: FormOutput) => {
		const payload: CreateProjectRequest = {
			name: data.name,
			description: data.description,
			leaderId: data.leader.id,
			memberIds: data.members.map((m) => m.id),
		};

		createMutation.mutate(payload, {
			onSuccess: () => {
				toast.success("プロジェクトを登録しました");
				onClose();
			},
			onError: (error: Error) => {
				if (error instanceof ApiError) {
					toast.error(error.message);
				} else {
					toast.error("エラーが発生しました。再度お試しください");
				}
			},
		});
	};

	return (
		<div
			role="dialog"
			aria-labelledby="project-form-title"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={() => {}}
		>
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
				<div className="mb-4 flex items-center justify-between">
					<h2
						id="project-form-title"
						className="text-lg font-bold text-gray-900"
					>
						プロジェクト追加
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						aria-label="閉じる"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700"
						>
							プロジェクト名
						</label>
						<input
							id="name"
							type="text"
							{...register("name")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						{errors.name && (
							<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
						)}
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700"
						>
							説明
						</label>
						<textarea
							id="description"
							rows={3}
							{...register("description")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.description ? (
								<p className="text-sm text-red-600">
									{errors.description.message}
								</p>
							) : (
								<span />
							)}
							<span
								className={`text-xs ${
									(description?.length ?? 0) > 200
										? "text-red-600"
										: "text-gray-500"
								}`}
							>
								{description?.length ?? 0} / 200
							</span>
						</div>
					</div>

					<Controller
						name="leader"
						control={control}
						render={({ field }) => (
							<EmployeeSearchSelect
								mode="single"
								label="リーダー"
								value={field.value}
								onChange={field.onChange}
								error={errors.leader?.message as string | undefined}
							/>
						)}
					/>

					<Controller
						name="members"
						control={control}
						render={({ field }) => (
							<EmployeeSearchSelect
								mode="multi"
								label="メンバー"
								value={field.value}
								onChange={field.onChange}
								excludeId={leader?.id}
								error={errors.members?.message as string | undefined}
							/>
						)}
					/>

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
						>
							キャンセル
						</button>
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{createMutation.isPending ? "処理中..." : "登録"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
