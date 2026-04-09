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

const employees = [
	{
		lastName: "田中",
		firstName: "太郎",
		email: "tanaka.taro@example.com",
		phone: "090-1234-5678",
		department: "営業部",
		position: "部長",
		hireDate: "2018-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "佐藤",
		firstName: "花子",
		email: "sato.hanako@example.com",
		phone: "090-2345-6789",
		department: "営業部",
		position: "課長",
		hireDate: "2019-07-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "鈴木",
		firstName: "一郎",
		email: "suzuki.ichiro@example.com",
		phone: "090-3456-7890",
		department: "営業部",
		position: "主任",
		hireDate: "2020-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "高橋",
		firstName: "美咲",
		email: "takahashi.misaki@example.com",
		phone: "090-4567-8901",
		department: "営業部",
		position: "一般",
		hireDate: "2022-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "伊藤",
		firstName: "健太",
		email: "ito.kenta@example.com",
		phone: "090-5678-9012",
		department: "開発部",
		position: "部長",
		hireDate: "2017-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "渡辺",
		firstName: "さくら",
		email: "watanabe.sakura@example.com",
		phone: "090-6789-0123",
		department: "開発部",
		position: "課長",
		hireDate: "2019-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "山本",
		firstName: "大輔",
		email: "yamamoto.daisuke@example.com",
		phone: "090-7890-1234",
		department: "開発部",
		position: "主任",
		hireDate: "2020-10-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "中村",
		firstName: "愛",
		email: "nakamura.ai@example.com",
		phone: "090-8901-2345",
		department: "開発部",
		position: "一般",
		hireDate: "2023-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "小林",
		firstName: "翔太",
		email: "kobayashi.shota@example.com",
		phone: "090-9012-3456",
		department: "開発部",
		position: "一般",
		hireDate: "2024-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "加藤",
		firstName: "由美",
		email: "kato.yumi@example.com",
		phone: "090-0123-4567",
		department: "人事部",
		position: "部長",
		hireDate: "2016-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "吉田",
		firstName: "拓也",
		email: "yoshida.takuya@example.com",
		phone: "080-1234-5678",
		department: "人事部",
		position: "課長",
		hireDate: "2020-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "山田",
		firstName: "真理",
		email: "yamada.mari@example.com",
		phone: "080-2345-6789",
		department: "人事部",
		position: "一般",
		hireDate: "2021-04-01",
		status: "ON_LEAVE" as const,
		note: "育児休暇中",
	},
	{
		lastName: "松本",
		firstName: "隆",
		email: "matsumoto.takashi@example.com",
		phone: "080-3456-7890",
		department: "総務部",
		position: "部長",
		hireDate: "2015-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "井上",
		firstName: "陽子",
		email: "inoue.yoko@example.com",
		phone: "080-4567-8901",
		department: "総務部",
		position: "主任",
		hireDate: "2019-10-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "木村",
		firstName: "大地",
		email: "kimura.daichi@example.com",
		phone: "080-5678-9012",
		department: "総務部",
		position: "一般",
		hireDate: "2022-10-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "林",
		firstName: "恵",
		email: "hayashi.megumi@example.com",
		phone: "080-6789-0123",
		department: "総務部",
		position: "一般",
		hireDate: "2023-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "清水",
		firstName: "誠",
		email: "shimizu.makoto@example.com",
		phone: "080-7890-1234",
		department: "経理部",
		position: "部長",
		hireDate: "2014-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "森",
		firstName: "綾香",
		email: "mori.ayaka@example.com",
		phone: "080-8901-2345",
		department: "経理部",
		position: "課長",
		hireDate: "2018-04-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "池田",
		firstName: "修",
		email: "ikeda.osamu@example.com",
		phone: "080-9012-3456",
		department: "経理部",
		position: "一般",
		hireDate: "2021-10-01",
		status: "ACTIVE" as const,
	},
	{
		lastName: "橋本",
		firstName: "和也",
		email: "hashimoto.kazuya@example.com",
		phone: null,
		department: "営業部",
		position: "一般",
		hireDate: "2020-04-01",
		status: "RETIRED" as const,
		note: "2025年3月末退職",
	},
];

async function main() {
	// 部署の投入
	const departmentMap = new Map<string, string>();
	for (const dept of departments) {
		const result = await prisma.department.upsert({
			where: { name: dept.name },
			update: {},
			create: dept,
		});
		departmentMap.set(result.name, result.id);
	}
	console.log("部署データを投入しました");

	// 従業員の投入
	for (const emp of employees) {
		const departmentId = departmentMap.get(emp.department);
		if (!departmentId) {
			console.error(`部署が見つかりません: ${emp.department}`);
			continue;
		}
		await prisma.employee.upsert({
			where: { email: emp.email },
			update: {},
			create: {
				lastName: emp.lastName,
				firstName: emp.firstName,
				email: emp.email,
				phone: emp.phone,
				departmentId,
				position: emp.position,
				hireDate: new Date(emp.hireDate),
				status: emp.status,
				note: emp.note ?? null,
			},
		});
	}
	console.log(`従業員データ ${employees.length}件 を投入しました`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
