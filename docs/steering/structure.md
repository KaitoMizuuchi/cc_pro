# プロジェクト構造

## 設計思想

フロントエンドとバックエンドを同一リポジトリ内で分離管理するモノレポ構成を想定する。フロントエンドは機能（feature）単位でコードを整理し、共通UIコンポーネントとビジネスロジックを分離する。バックエンドはリソース単位でルーティング・ハンドラを整理する。

## ディレクトリパターン

### フロントエンドソース
**場所**: `/frontend/src/`
**目的**: React SPAのソースコード
**構成パターン**:
- `pages/` - ルーティング対応のページコンポーネント
- `components/` - 再利用可能なUIコンポーネント（ビジネスロジックを持たない）
- `features/` - 機能単位のコンポーネント・ロジック（従業員管理、部署管理、認証等）
- `hooks/` - カスタムフック（TanStack Queryのラッパー等）
- `lib/` - ユーティリティ関数、APIクライアント設定
- `types/` - 共通型定義

### バックエンドソース
**場所**: `/backend/src/`
**目的**: Hono REST APIサーバーのソースコード
**構成パターン**:
- `routes/` - リソース単位のルーティング定義（employees, departments, auth）
- `middleware/` - 認証ミドルウェア等の共通処理
- `services/` - ビジネスロジック
- `validators/` - zodスキーマ定義（フロントエンドと共有可能）

### 共有リソース
**場所**: `/shared/`（必要に応じて）
**目的**: フロントエンド・バックエンド間で共有するzodスキーマ・型定義

### データベース
**場所**: `/backend/prisma/`
**目的**: Prismaスキーマ・マイグレーションファイル

## 命名規則

- **ファイル名（コンポーネント）**: PascalCase（例: `EmployeeList.tsx`, `LoginForm.tsx`）
- **ファイル名（ユーティリティ・フック）**: camelCase（例: `useEmployees.ts`, `apiClient.ts`）
- **ファイル名（ルート・設定）**: kebab-case（例: `employee-routes.ts`, `auth-middleware.ts`）
- **コンポーネント名**: PascalCase（ファイル名と一致させる）
- **関数名**: camelCase
- **型・インターフェース名**: PascalCase
- **定数**: UPPER_SNAKE_CASE

## インポート整理

```typescript
// 1. 外部ライブラリ
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 内部モジュール（絶対パス）
import { Button } from '@/components/Button'
import { useEmployees } from '@/hooks/useEmployees'

// 3. 相対パス（同一feature内）
import { EmployeeCard } from './EmployeeCard'
import type { Employee } from './types'
```

**パスエイリアス**:
- `@/`: `src/` ディレクトリのルートにマッピング（フロントエンド）

## コード設計原則

- **関心の分離**: UIコンポーネントにビジネスロジックを混在させない。カスタムフックやサービス層に切り出す
- **コロケーション**: 機能に関連するコンポーネント・フック・型は同一ディレクトリに配置する
- **単一責任**: 1ファイル1コンポーネント/1フック/1サービスを原則とする
- **バリデーションの共通化**: zodスキーマをフロントエンド（react-hook-form連携）とバックエンド（リクエスト検証）で共有する

---
_パターンを記述。ファイルツリーの網羅ではない。パターンに従う新規ファイルは、このドキュメントの更新を必要としない_
