import {
	createEmployeeSchema,
	EMPLOYEE_ERROR_CODES,
	updateEmployeeSchema,
} from "@hr-management/shared";
import { Hono } from "hono";
import * as employeeService from "../services/employee";

export const employeeRoutes = new Hono();

employeeRoutes.get("/", async (c) => {
	const page = Number(c.req.query("page") || "1");
	const limit = Number(c.req.query("limit") || "10");
	const result = await employeeService.listEmployees(page, limit);

	if (!result.success) {
		return c.json({ error: result.error }, 500);
	}

	return c.json(result.data);
});

employeeRoutes.get("/:id", async (c) => {
	const result = await employeeService.getEmployee(c.req.param("id"));

	if (!result.success) {
		const status =
			result.error.code === EMPLOYEE_ERROR_CODES.NOT_FOUND ? 404 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});

employeeRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const parsed = createEmployeeSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: EMPLOYEE_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const result = await employeeService.createEmployee(parsed.data);

	if (!result.success) {
		const status =
			result.error.code === EMPLOYEE_ERROR_CODES.EMAIL_ALREADY_EXISTS
				? 409
				: result.error.code === EMPLOYEE_ERROR_CODES.DEPARTMENT_NOT_FOUND
					? 400
					: 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data, 201);
});

employeeRoutes.put("/:id", async (c) => {
	const body = await c.req.json();
	const parsed = updateEmployeeSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{
				error: {
					code: EMPLOYEE_ERROR_CODES.VALIDATION_ERROR,
					message: parsed.error.errors[0].message,
				},
			},
			400,
		);
	}

	const result = await employeeService.updateEmployee(
		c.req.param("id"),
		parsed.data,
	);

	if (!result.success) {
		const status =
			result.error.code === EMPLOYEE_ERROR_CODES.NOT_FOUND
				? 404
				: result.error.code === EMPLOYEE_ERROR_CODES.EMAIL_ALREADY_EXISTS
					? 409
					: result.error.code === EMPLOYEE_ERROR_CODES.DEPARTMENT_NOT_FOUND
						? 400
						: 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});

employeeRoutes.delete("/:id", async (c) => {
	const result = await employeeService.deleteEmployee(c.req.param("id"));

	if (!result.success) {
		const status =
			result.error.code === EMPLOYEE_ERROR_CODES.NOT_FOUND ? 404 : 500;
		return c.json({ error: result.error }, status);
	}

	return c.json(result.data);
});
