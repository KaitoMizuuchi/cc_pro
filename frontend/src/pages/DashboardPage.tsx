import type { Employee } from "@hr-management/shared";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmployeeFormModal } from "@/features/employees/components/EmployeeFormModal";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import {
	useDeleteEmployee,
	useEmployees,
} from "@/features/employees/hooks/useEmployees";

const LIMIT = 10;

export function DashboardPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Number(searchParams.get("page") || "1");
	const { data, isLoading } = useEmployees(page, LIMIT);
	const deleteMutation = useDeleteEmployee();

	const [modalOpen, setModalOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState<
		Employee | undefined
	>();
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

	const openCreate = () => {
		setEditingEmployee(undefined);
		setModalOpen(true);
	};

	const openEdit = (employee: Employee) => {
		setEditingEmployee(employee);
		setModalOpen(true);
	};

	const handleDeleteRequest = (id: string) => {
		setDeleteTargetId(id);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTargetId) return;
		deleteMutation.mutate(deleteTargetId, {
			onSuccess: () => {
				toast.success("従業員を削除しました");
				setDeleteTargetId(null);
			},
			onError: () => toast.error("削除に失敗しました。再度お試しください"),
		});
	};

	const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">従業員一覧</h1>
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
				>
					<Plus className="h-4 w-4" />
					従業員を登録
				</button>
			</div>

			{isLoading ? (
				<div className="py-12 text-center text-gray-500">読み込み中...</div>
			) : data ? (
				<>
					<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
						<EmployeeTable
							employees={data.employees}
							onEdit={openEdit}
							onDelete={handleDeleteRequest}
						/>
					</div>

					{totalPages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-gray-600">
								全{data.total}件中 {(page - 1) * LIMIT + 1}〜
								{Math.min(page * LIMIT, data.total)}件
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setSearchParams({ page: String(page - 1) })}
									disabled={page <= 1}
									className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									前へ
								</button>
								<button
									type="button"
									onClick={() => setSearchParams({ page: String(page + 1) })}
									disabled={page >= totalPages}
									className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									次へ
								</button>
							</div>
						</div>
					)}
				</>
			) : null}

			<EmployeeFormModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				employee={editingEmployee}
			/>

			<ConfirmDialog
				open={!!deleteTargetId}
				title="従業員の削除"
				message="この従業員を削除しますか？この操作は取り消せません。"
				onConfirm={handleDeleteConfirm}
				onCancel={() => setDeleteTargetId(null)}
				isPending={deleteMutation.isPending}
			/>
		</div>
	);
}
