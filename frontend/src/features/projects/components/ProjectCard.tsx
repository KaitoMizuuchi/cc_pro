import type { Project } from "@hr-management/shared";
import { Link } from "react-router-dom";

type Props = {
	project: Project;
};

export function ProjectCard({ project }: Props) {
	return (
		<Link
			to={`/projects/${project.id}`}
			className="block rounded-lg border border-gray-200 bg-white p-5 shadow transition-shadow hover:shadow-md"
		>
			<h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
			<p className="mt-2 line-clamp-2 text-sm text-gray-600">
				{project.description}
			</p>
			<p className="mt-3 text-sm text-gray-500">
				<span className="font-medium text-gray-700">リーダー:</span>{" "}
				{project.leader.lastName} {project.leader.firstName}
			</p>
		</Link>
	);
}
