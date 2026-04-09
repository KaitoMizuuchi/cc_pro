import { EMPLOYEE_STATUS_LABELS, type Employee } from "@hr-management/shared";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
	ACTIVE: "bg-green-100 text-green-800",
	ON_LEAVE: "bg-yellow-100 text-yellow-800",
	RETIRED: "bg-gray-100 text-gray-600",
};

type Props = {
	employees: Employee[];
	onEdit: (employee: Employee) => void;
	onDelete: (id: string) => void;
};

export function EmployeeTable({ employees, onEdit, onDelete }: Props) {
	if (employees.length === 0) {
		return (
			<div className="py-12 text-center text-gray-500">
				従業員が登録されていません
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							氏名
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							メール
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							部署
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							役職
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							入社日
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							ステータス
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							操作
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 bg-white">
					{employees.map((emp) => (
						<tr key={emp.id} className="hover:bg-gray-50">
							<td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
								{emp.lastName} {emp.firstName}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{emp.email}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{emp.department.name}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{emp.position}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{new Date(emp.hireDate).toLocaleDateString("ja-JP")}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm">
								<span
									className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[emp.status] ?? ""}`}
								>
									{EMPLOYEE_STATUS_LABELS[emp.status] ?? emp.status}
								</span>
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm">
								<div className="flex items-center gap-2">
									<Link
										to={`/employees/${emp.id}`}
										className="text-gray-400 hover:text-blue-600"
										title="詳細"
									>
										<Eye className="h-4 w-4" />
									</Link>
									<button
										type="button"
										onClick={() => onEdit(emp)}
										className="text-gray-400 hover:text-blue-600"
										title="編集"
									>
										<Pencil className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={() => onDelete(emp.id)}
										className="text-gray-400 hover:text-red-600"
										title="削除"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
