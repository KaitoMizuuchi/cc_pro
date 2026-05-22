import { Plus } from "lucide-react";
import { useState } from "react";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectFormModal } from "@/features/projects/components/ProjectFormModal";
import { useProjects } from "@/features/projects/hooks/useProjects";

export function ProjectsPage() {
	const { data, isLoading, error } = useProjects();
	const [open, setOpen] = useState(false);

	if (isLoading) {
		return <div className="py-12 text-center text-gray-500">読み込み中...</div>;
	}

	if (error) {
		return (
			<div className="py-12 text-center text-gray-500">
				プロジェクトの取得に失敗しました
			</div>
		);
	}

	const projects = data?.projects ?? [];

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">プロジェクト一覧</h1>
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					<Plus className="h-4 w-4" />
					プロジェクト追加
				</button>
			</div>

			{projects.length === 0 ? (
				<div className="py-12 text-center text-gray-500">
					プロジェクトが登録されていません
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			)}

			<ProjectFormModal open={open} onClose={() => setOpen(false)} />
		</div>
	);
}
