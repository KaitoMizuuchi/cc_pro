import {
	createProjectSchema,
	PROJECT_ERROR_CODES,
} from "@hr-management/shared";
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

projectRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const parsed = createProjectSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: PROJECT_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const result = await projectService.createProject(parsed.data);

	if (!result.success) {
		const status =
			result.error.code === PROJECT_ERROR_CODES.NAME_ALREADY_EXISTS
				? 409
				: result.error.code === PROJECT_ERROR_CODES.LEADER_NOT_FOUND ||
						result.error.code === PROJECT_ERROR_CODES.MEMBER_NOT_FOUND ||
						result.error.code === PROJECT_ERROR_CODES.LEADER_IN_MEMBERS
					? 400
					: 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data, 201);
});
