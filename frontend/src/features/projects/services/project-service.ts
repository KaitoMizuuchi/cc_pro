import type {
	CreateProjectRequest,
	Project,
	ProjectDetail,
} from "@hr-management/shared";
import { apiClient } from "@/lib/api-client";

export function listProjects(): Promise<{ projects: Project[] }> {
	return apiClient<{ projects: Project[] }>("/projects");
}

export function getProject(id: string): Promise<ProjectDetail> {
	return apiClient<ProjectDetail>(`/projects/${id}`);
}

export function createProject(input: CreateProjectRequest): Promise<Project> {
	return apiClient<Project>("/projects", {
		method: "POST",
		body: JSON.stringify(input),
	});
}
