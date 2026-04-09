import { prisma } from "../lib/prisma";

export async function listDepartments() {
	return prisma.department.findMany({
		orderBy: { name: "asc" },
		select: { id: true, name: true },
	});
}
