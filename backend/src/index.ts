import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validateEnv } from "./lib/env";
import { authMiddleware } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import { bookRoutes } from "./routes/book";
import { departmentRoutes } from "./routes/department";
import { employeeRoutes } from "./routes/employee";
import { projectRoutes } from "./routes/project";

// サーバー起動時に必須環境変数をチェック。未設定の場合はプロセスを中断する
validateEnv();

const app = new Hono();

app.use("*", logger());
app.use(
	"*",
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);

app.use("/api/*", authMiddleware);

app.get("/api/health", (c) => {
	return c.json({ status: "ok" });
});

app.route("/api/auth", authRoutes);
app.route("/api/departments", departmentRoutes);
app.route("/api/employees", employeeRoutes);
app.route("/api/books", bookRoutes);
app.route("/api/projects", projectRoutes);

export default {
	port: 3000,
	fetch: app.fetch,
};
