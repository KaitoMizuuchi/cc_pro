import type { ProjectMember } from "@hr-management/shared";
import { useNavigate } from "react-router-dom";

type Props = {
	members: ProjectMember[];
	projectId: string;
};

export function ProjectMemberTable({ members, projectId }: Props) {
	const navigate = useNavigate();

	if (members.length === 0) {
		return (
			<div className="py-12 text-center text-gray-500">
				メンバーが登録されていません
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
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 bg-white">
					{members.map((member) => (
						<tr
							key={member.id}
							onClick={() =>
								navigate(`/employees/${member.employeeId}`, {
									state: { from: `/projects/${projectId}` },
								})
							}
							className="cursor-pointer hover:bg-gray-50"
						>
							<td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
								{member.lastName} {member.firstName}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{member.email}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{member.department.name}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{member.position}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
