import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CreateEmployeeRequest,
	createEmployeeSchema,
	EMPLOYEE_STATUS_LABELS,
	type Employee,
} from "@hr-management/shared";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import {
	useCreateEmployee,
	useDepartments,
	useUpdateEmployee,
} from "../hooks/useEmployees";

type Props = {
	open: boolean;
	onClose: () => void;
	employee?: Employee;
};

export function EmployeeFormModal({ open, onClose, employee }: Props) {
	const isEdit = !!employee;
	const { data: deptData } = useDepartments();
	const createMutation = useCreateEmployee();
	const updateMutation = useUpdateEmployee();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateEmployeeRequest>({
		resolver: zodResolver(createEmployeeSchema),
	});

	useEffect(() => {
		if (open) {
			reset(
				employee
					? {
							lastName: employee.lastName,
							firstName: employee.firstName,
							email: employee.email,
							phone: employee.phone ?? undefined,
							departmentId: employee.departmentId,
							position: employee.position,
							hireDate: employee.hireDate.slice(0, 10),
							status: employee.status,
							note: employee.note ?? undefined,
						}
					: {
							status: "ACTIVE",
						},
			);
		}
	}, [open, employee, reset]);

	if (!open) return null;

	const isPending = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (data: CreateEmployeeRequest) => {
		const onError = (error: Error) => {
			if (error instanceof ApiError) {
				toast.error(error.message);
			} else {
				toast.error("エラーが発生しました。再度お試しください");
			}
		};

		if (isEdit) {
			updateMutation.mutate(
				{ id: employee.id, data },
				{
					onSuccess: () => {
						toast.success("従業員情報を更新しました");
						onClose();
					},
					onError,
				},
			);
		} else {
			createMutation.mutate(data, {
				onSuccess: () => {
					toast.success("従業員を登録しました");
					onClose();
				},
				onError,
			});
		}
	};

	return (
		<div
			role="dialog"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={() => {}}
		>
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-bold text-gray-900">
						{isEdit ? "従業員編集" : "従業員登録"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="lastName"
								className="block text-sm font-medium text-gray-700"
							>
								姓
							</label>
							<input
								id="lastName"
								type="text"
								{...register("lastName")}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
							{errors.lastName && (
								<p className="mt-1 text-sm text-red-600">
									{errors.lastName.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="firstName"
								className="block text-sm font-medium text-gray-700"
							>
								名
							</label>
							<input
								id="firstName"
								type="text"
								{...register("firstName")}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
							{errors.firstName && (
								<p className="mt-1 text-sm text-red-600">
									{errors.firstName.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							メールアドレス
						</label>
						<input
							id="email"
							type="email"
							{...register("email")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="phone"
							className="block text-sm font-medium text-gray-700"
						>
							電話番号
						</label>
						<input
							id="phone"
							type="tel"
							{...register("phone")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="departmentId"
							className="block text-sm font-medium text-gray-700"
						>
							部署
						</label>
						<select
							id="departmentId"
							{...register("departmentId")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						>
							<option value="">選択してください</option>
							{deptData?.departments.map((dept) => (
								<option key={dept.id} value={dept.id}>
									{dept.name}
								</option>
							))}
						</select>
						{errors.departmentId && (
							<p className="mt-1 text-sm text-red-600">
								{errors.departmentId.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="position"
							className="block text-sm font-medium text-gray-700"
						>
							役職
						</label>
						<input
							id="position"
							type="text"
							{...register("position")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						{errors.position && (
							<p className="mt-1 text-sm text-red-600">
								{errors.position.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="hireDate"
							className="block text-sm font-medium text-gray-700"
						>
							入社日
						</label>
						<input
							id="hireDate"
							type="date"
							{...register("hireDate")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						{errors.hireDate && (
							<p className="mt-1 text-sm text-red-600">
								{errors.hireDate.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700"
						>
							ステータス
						</label>
						<select
							id="status"
							{...register("status")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						>
							{Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor="note"
							className="block text-sm font-medium text-gray-700"
						>
							備考
						</label>
						<textarea
							id="note"
							rows={3}
							{...register("note")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

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
							disabled={isPending}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isPending ? "処理中..." : isEdit ? "更新" : "登録"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
