# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

HR管理Webアプリ（hr-management）。AI駆動開発フローの検証用プロジェクト。
TypeScript + bun monorepo（`frontend/` / `backend/` workspaces）。

## コマンド

### 開発サーバー

```bash
bun run dev              # frontend + backend 同時起動
bun run dev:frontend     # frontend のみ (Vite, localhost:5173)
bun run dev:backend      # backend のみ (Hono, localhost:3000)
```

### DB（PostgreSQL on Docker）

```bash
docker compose up -d            # DB起動
bun run db:migrate              # マイグレーション実行
bun run db:generate             # Prisma Client 生成
bun run db:studio               # Prisma Studio 起動
```

- DB接続情報: `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`, `POSTGRES_DB=hr_management`, ポート5432
- 環境変数 `DATABASE_URL` と `JWT_SECRET` が必須（`.env`に設定）

### リント・フォーマット

```bash
bun run lint             # Biome check
bun run lint:fix         # Biome check --write（自動修正）
bun run format           # Biome format --write
```

### テスト

```bash
bun run test                           # 全workspace テスト実行
cd frontend && bunx vitest run         # frontend テストのみ
cd backend && bunx vitest run          # backend テストのみ
cd frontend && bunx vitest run src/path/to/file.test.ts  # 単一テスト
```

### ビルド

```bash
bun run build            # 全workspace ビルド
```

## アーキテクチャ

### モノレポ構成

- **`frontend/`**: React + Vite。`@` エイリアスで `src/` を参照。Vite devサーバーが `/api` を backend (localhost:3000) にプロキシ。
- **`backend/`**: Hono。`bun run --hot` でホットリロード。APIエンドポイントは `/api/` プレフィックス。

### Prisma

- スキーマ: `backend/prisma/schema.prisma`
- 生成先: `backend/src/generated/prisma/`（gitで管理されている）
- 設定: `backend/prisma.config.ts` で `dotenv/config` を読み込み
- アダプタ: `@prisma/adapter-pg`（PostgreSQL直接接続）
- モデル: User, Department, Employee（snake_case `@@map` でDB上のテーブル名・カラム名をマッピング）

### コードスタイル（Biome）

- インデント: タブ
- クォート: ダブルクォート
- セミコロン: あり
- `*.config.ts` では `noDefaultExport` ルール無効

### 命名規則

基本は **camelCase**。以下の例外と用途別ルール:

**ファイル名**
- React コンポーネント / ページ: `PascalCase.tsx`（例: `EmployeeFormModal.tsx`, `ProjectsPage.tsx`）
- カスタムフック: `useXxx.ts`（例: `useProjects.ts`）
- フロントエンドの service: `camelCase` + `Service` 接尾辞（例: `projectService.ts`, `employeeService.ts`）
- バックエンドのルート・サービス、shared の validator/type/constant: `camelCase`（単一名詞はそのまま小文字、複合語も camelCase 例: `employee.ts`, `project.ts`, `isbnLookup.ts`）

**識別子（関数・変数・型・定数）**
- 関数・変数: `camelCase`（例: `listEmployees`, `createProject`, `searchEmployees`）
- React コンポーネント関数: `PascalCase`（例: `ProjectFormModal`）
- カスタムフック関数: `useXxx`（例: `useCreateProject`）
- 型・interface: `PascalCase`（例: `Employee`, `CreateProjectRequest`, `ProjectErrorCode`）
- 定数オブジェクト: `SCREAMING_SNAKE_CASE`（例: `PROJECT_ERROR_CODES`, `EMPLOYEE_STATUS_LABELS`）
- zod スキーマ: `camelCase` + `Schema` 接尾辞（例: `createProjectSchema`, `loginSchema`）
- Request/Response 型: 操作名 + `Request` / `Response`（例: `CreateProjectRequest`, `EmployeeListResponse`）

**API クエリパラメータ**
- 短縮形（`q`, `id`, `cnt` 等）は避け、意図が明確な完全な単語を使う（例: `query`, `excludeId`）

### shared workspace

- バリデーション（zod スキーマ）、型、エラーコードは `shared/src/` に集約する（`validators/`, `types/`, `constants/`）
- フロント/バックで同じ定義を重複定義しない
- `shared/src/index.ts` から re-export し、`@hr-management/shared` 経由で参照する

### 注意事項

- `frontend/tsconfig.json` に `composite: true`、`declaration: true`、`emitDeclarationOnly: true` が設定されている。型チェック時は必ず `tsc --noEmit` を使うこと。`tsc` を `--noEmit` なしで実行すると `frontend/src/` 配下に大量の `.d.ts` ファイルが生成されるため注意。
- `frontend/tsconfig.json` の `types: ["vitest/globals", "@testing-library/jest-dom"]` を維持する（テストで `toBeInTheDocument` などの型を解決するため）。

### 開発ガイドライン

- 一つのファイルに複数の役割を持たせないようにする
- テストの書き方は `.claude/rules/test-guide.md` を参照（結合テスト中心、`useMutation` のアサーション、jest-dom matchers の登録など）
- プロジェクト方針・プロダクト要件・ロードマップは `docs/steering/` を参照（`product.md`, `tech.md`, `structure.md`, `mvp-roadmap.md`）

## 開発環境

| レイヤー                 | ライブラリ                     |
| ------------------------ | ------------------------------ |
| フロントエンド           | React + Vite                   |
| バックエンド             | Hono                           |
| DB                       | PostgreSQL（Docker）           |
| ORM                      | Prisma                         |
| ルーティング             | react-router-dom               |
| キャッシュ               | TanStack Query                 |
| 入力ハンドラ             | react-hook-form                |
| バリデーション           | zod                            |
| スタイル                 | Tailwind CSS                   |
| アイコン                 | lucide-react                   |
| テスト                   | vitest, @testing-library/react |
| リンター・フォーマッター | Biome                          |

## プロジェクト方針ドキュメント

プロダクト要件・技術選定・構造・ロードマップは `docs/steering/` を参照する:

- `docs/steering/product.md` - プロダクトの目的・対象ユーザー
- `docs/steering/tech.md` - 技術選定とその理由
- `docs/steering/structure.md` - ディレクトリ構造・モジュール境界
- `docs/steering/mvp-roadmap.md` - MVP に向けたロードマップ

## ルール・ガイド

`.claude/rules/` に作業時の参照ガイドを集約する:

- `.claude/rules/test-guide.md` - テスト作成・修正時の指針（結合テスト中心、setup・モック・アサーションの落とし穴）

## 開発スタンス

- ユーザーの指示の範囲内で自律的に動く: 必要な情報を集め、エンドツーエンドで完遂する
- 情報が決定的に不足している場合・指示が極めて曖昧な場合のみ確認する
- 思考は英語でも構わないが、ユーザーへの応答とプロジェクトの Markdown は日本語で書く
