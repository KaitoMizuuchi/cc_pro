import { useQuery } from "@tanstack/react-query";
import * as projectService from "../services/project-service";

export function useProjects() {
	return useQuery({
		queryKey: ["projects"],
		queryFn: () => projectService.listProjects(),
	});
}

export function useProject(id: string) {
	return useQuery({
		queryKey: ["projects", id],
		queryFn: () => projectService.getProject(id),
		enabled: !!id,
	});
}
