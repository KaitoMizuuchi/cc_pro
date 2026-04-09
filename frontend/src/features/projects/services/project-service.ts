import type { Project, ProjectDetail } from "@hr-management/shared";
import { apiClient } from "@/lib/api-client";

export function listProjects(): Promise<{ projects: Project[] }> {
	return apiClient<{ projects: Project[] }>("/projects");
}

export function getProject(id: string): Promise<ProjectDetail> {
	return apiClient<ProjectDetail>(`/projects/${id}`);
}
