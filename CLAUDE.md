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

### 注意事項

- `frontend/tsconfig.json` に `composite: true`、`declaration: true`、`emitDeclarationOnly: true` が設定されている。型チェック時は必ず `tsc --noEmit` を使うこと。`tsc` を `--noEmit` なしで実行すると `frontend/src/` 配下に大量の `.d.ts` ファイルが生成されるため注意。

### 開発ガイドライン

一つのファイルに複数の役割を持たせないようにする。

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

# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow

- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules

- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration

- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)
