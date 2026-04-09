export type ProjectLeader = {
	id: string;
	lastName: string;
	firstName: string;
};

export type ProjectMember = {
	id: string;
	employeeId: string;
	lastName: string;
	firstName: string;
	email: string;
	department: {
		id: string;
		name: string;
	};
	position: string;
};

export type Project = {
	id: string;
	name: string;
	description: string;
	leader: ProjectLeader;
	createdAt: string;
	updatedAt: string;
};

export type ProjectDetail = Project & {
	members: ProjectMember[];
};
