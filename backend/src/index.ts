import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validateEnv } from "./lib/env";
import { authMiddleware } from "./middleware/auth";
import { authRoutes } from "./routes/auth";

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

export default {
	port: 3000,
	fetch: app.fetch,
};
