import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { useProjects } from "@/features/projects/hooks/useProjects";

export function ProjectsPage() {
	const { data, isLoading, error } = useProjects();

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
			<h1 className="mb-6 text-2xl font-bold text-gray-900">
				プロジェクト一覧
			</h1>

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
		</div>
	);
}
