import { Hono } from "hono";
import { listDepartments } from "../services/department";

export const departmentRoutes = new Hono();

departmentRoutes.get("/", async (c) => {
	const departments = await listDepartments();
	return c.json({ departments });
});
