import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ProjectMemberTable } from "@/features/projects/components/ProjectMemberTable";
import { useProject } from "@/features/projects/hooks/useProjects";

export function ProjectDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: project, isLoading, error } = useProject(id ?? "");

	if (isLoading) {
		return <div className="py-12 text-center text-gray-500">読み込み中...</div>;
	}

	if (error || !project) {
		return (
			<div className="py-12 text-center">
				<p className="text-gray-500">プロジェクトが見つかりません</p>
				<Link
					to="/projects"
					className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
				>
					一覧に戻る
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6 flex items-center gap-3">
				<Link to="/projects" className="text-gray-400 hover:text-gray-600">
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
			</div>

			<div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
				<dl>
					<div className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3">
						<dt className="text-sm font-medium text-gray-500">説明</dt>
						<dd className="col-span-2 text-sm text-gray-900">
							{project.description}
						</dd>
					</div>
					<div className="grid grid-cols-3 gap-4 py-3">
						<dt className="text-sm font-medium text-gray-500">リーダー</dt>
						<dd className="col-span-2 text-sm text-gray-900">
							{project.leader.lastName} {project.leader.firstName}
						</dd>
					</div>
				</dl>
			</div>

			<h2 className="mb-4 text-lg font-bold text-gray-900">メンバー一覧</h2>
			<div className="rounded-lg border border-gray-200 bg-white shadow">
				<ProjectMemberTable members={project.members} projectId={id ?? ""} />
			</div>
		</div>
	);
}
