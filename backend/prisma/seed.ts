import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const departments = [
	{ name: "営業部" },
	{ name: "開発部" },
	{ name: "人事部" },
	{ name: "総務部" },
	{ name: "経理部" },
];

async function main() {
	for (const dept of departments) {
		await prisma.department.upsert({
			where: { name: dept.name },
			update: {},
			create: dept,
		});
	}
	console.log("部署データを投入しました");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
