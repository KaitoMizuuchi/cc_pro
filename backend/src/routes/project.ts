import { PROJECT_ERROR_CODES } from "@hr-management/shared";
import { Hono } from "hono";
import * as projectService from "../services/project";

export const projectRoutes = new Hono();

projectRoutes.get("/", async (c) => {
	const result = await projectService.listProjects();

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json(result.data);
});

projectRoutes.get("/:id", async (c) => {
	const result = await projectService.getProject(c.req.param("id"));

	if (!result.success) {
		const status =
			result.error.code === PROJECT_ERROR_CODES.NOT_FOUND ? 404 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});
