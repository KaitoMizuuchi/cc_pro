export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "RETIRED";

export type Department = {
	id: string;
	name: string;
};

export type Employee = {
	id: string;
	lastName: string;
	firstName: string;
	email: string;
	phone: string | null;
	departmentId: string;
	department: Department;
	position: string;
	hireDate: string;
	status: EmployeeStatus;
	note: string | null;
	createdAt: string;
	updatedAt: string;
};

export type EmployeeListResponse = {
	employees: Employee[];
	total: number;
	page: number;
	limit: number;
};
