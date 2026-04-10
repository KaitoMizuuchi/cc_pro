import { EMPLOYEE_STATUS_LABELS } from "@hr-management/shared";
import { ArrowLeft, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { EmployeeFormModal } from "@/features/employees/components/EmployeeFormModal";
import { useEmployee } from "@/features/employees/hooks/useEmployees";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ON_LEAVE: "bg-yellow-100 text-yellow-800",
  RETIRED: "bg-gray-100 text-gray-600",
};

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const fromProject = location.state?.from as string | undefined;
  const { data: employee, isLoading, error } = useEmployee(id ?? "");
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">読み込み中...</div>;
  }

  if (error || !employee) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">従業員が見つかりません</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
        >
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to={fromProject ?? "/"}
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {fromProject ? "プロジェクト詳細に戻る" : "従業員一覧に戻る"}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.lastName} {employee.firstName}
            </h1>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[employee.status] ?? ""}`}
            >
              {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            編集
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <dl>
          <DetailRow label="姓" value={employee.lastName} />
          <DetailRow label="名" value={employee.firstName} />
          <DetailRow label="メールアドレス" value={employee.email} />
          <DetailRow label="電話番号" value={employee.phone ?? "—"} />
          <DetailRow label="部署" value={employee.department.name} />
          <DetailRow label="役職" value={employee.position} />
          <DetailRow
            label="入社日"
            value={new Date(employee.hireDate).toLocaleDateString("ja-JP")}
          />
          <DetailRow label="備考" value={employee.note ?? "—"} />
        </dl>
      </div>

      <EmployeeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={employee}
      />
    </div>
  );
}
