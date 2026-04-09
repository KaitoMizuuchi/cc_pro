import type {
	CreateEmployeeRequest,
	Department,
	Employee,
	EmployeeListResponse,
	UpdateEmployeeRequest,
} from "@hr-management/shared";
import { apiClient } from "@/lib/api-client";

export function listEmployees(
	page: number,
	limit: number,
): Promise<EmployeeListResponse> {
	return apiClient<EmployeeListResponse>(
		`/employees?page=${page}&limit=${limit}`,
	);
}

export function getEmployee(id: string): Promise<Employee> {
	return apiClient<Employee>(`/employees/${id}`);
}

export function createEmployee(
	input: CreateEmployeeRequest,
): Promise<Employee> {
	return apiClient<Employee>("/employees", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function updateEmployee(
	id: string,
	input: UpdateEmployeeRequest,
): Promise<Employee> {
	return apiClient<Employee>(`/employees/${id}`, {
		method: "PUT",
		body: JSON.stringify(input),
	});
}

export function deleteEmployee(id: string): Promise<{ id: string }> {
	return apiClient<{ id: string }>(`/employees/${id}`, {
		method: "DELETE",
	});
}

export function listDepartments(): Promise<{ departments: Department[] }> {
	return apiClient<{ departments: Department[] }>("/departments");
}
