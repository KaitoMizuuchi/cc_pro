import type { UpdateEmployeeRequest } from "@hr-management/shared";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import * as employeeService from "../services/employee-service";

export function useEmployees(page: number, limit: number) {
	return useQuery({
		queryKey: ["employees", page, limit],
		queryFn: () => employeeService.listEmployees(page, limit),
	});
}

export function useEmployee(id: string) {
	return useQuery({
		queryKey: ["employees", id],
		queryFn: () => employeeService.getEmployee(id),
		enabled: !!id,
	});
}

export function useDepartments() {
	return useQuery({
		queryKey: ["departments"],
		queryFn: () => employeeService.listDepartments(),
	});
}

export function useSearchEmployees(query: string, excludeId?: string) {
	return useQuery({
		queryKey: ["employees", "search", query, excludeId ?? null],
		queryFn: () => employeeService.searchEmployees(query, excludeId),
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}

export function useCreateEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: employeeService.createEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
		},
	});
}

export function useUpdateEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
			employeeService.updateEmployee(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
		},
	});
}

export function useDeleteEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: employeeService.deleteEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
		},
	});
}
