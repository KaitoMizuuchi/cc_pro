---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/__tests__/**"
  - "frontend/src/test/setup.ts"
  - "frontend/vitest.config.ts"
  - "backend/vitest.config.ts"
  - "shared/vitest.config.ts"
---

# テストガイド

このプロジェクトでテストファイル（`*.test.ts` / `*.test.tsx`）を作成・修正する際の指針。
Issue #12 のプロジェクト追加機能実装で得られた知見を反映しています。

## 基本方針

- **結合テスト中心**: ユーザーストーリー単位の結合テストを主軸とする
- サービス関数・コンポーネントの単体テストは zod の境界値や純粋関数のロジック分岐など、狭い対象に限定
- 振る舞いの検証は結合テストで担保し、単体テストで重複させない
- 受け入れ基準（PBI の「正常系/異常系/境界」）の項目を結合テストで直接検証できる構造にする

## ファイル配置と命名

- バックエンド: `backend/src/__tests__/{機能名}-{動作}.integration.test.ts`
  - 例: `project-create.integration.test.ts`, `employee-search.integration.test.ts`
- フロントエンド: `frontend/src/features/{機能}/__tests__/{機能名}-{動作}.integration.test.tsx`
- shared: バリデータと同じディレクトリに `{名前}.test.ts`（境界値テスト用）

## バックエンド結合テスト

### Hono の `app.request()` でルートを直接叩く

```ts
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = {
  employee: { findUnique: vi.fn(), findMany: vi.fn() },
  project: { findUnique: vi.fn(), create: vi.fn() },
  projectMember: { createMany: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock("../lib/prisma", () => ({ prisma: mockPrisma }));

const buildApp = async () => {
  const { projectRoutes } = await import("../routes/project");
  const app = new Hono();
  app.route("/api/projects", projectRoutes);
  return app;
};
```

### 認証ミドルウェアの扱い

`backend/src/index.ts` の `app.use("/api/*", authMiddleware)` は本物の app に紐づいているため、
**テスト用に空の `new Hono()` にルートだけマウントすれば auth を経由しない**。JWT クッキーを準備する必要はない。

### `$transaction` のモック

`prisma.$transaction(async (tx) => ...)` を使うサービスをテストする場合、`tx` を mockPrisma 自身で代用する:

```ts
mockPrisma.$transaction.mockImplementation(
  async (callback: (tx: typeof mockPrisma) => Promise<unknown>) =>
    callback(mockPrisma),
);
```

### `vi.clearAllMocks()` は `beforeEach` で呼ぶ

各テストで mock 呼び出し回数や引数が独立するように `beforeEach` で必ずクリアする。

## フロントエンド結合テスト

### vitest setup の正しい書き方

`frontend/src/test/setup.ts` で **`import "@testing-library/jest-dom/vitest"` だけでは matchers が登録されない**ことがある。明示的に `expect.extend(matchers)` を呼ぶ:

```ts
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);
```

### tsconfig に types を追加

`toBeInTheDocument()` などの TS 型を解決するため `frontend/tsconfig.json` に以下を追加:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### page + provider をラップする render ヘルパー

```tsx
import "@testing-library/jest-dom/vitest"; // 必要に応じて（基本は setup.ts で十分）
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "sonner";

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TargetPage />
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};
```

- `QueryClient` は **テストごとに新規作成**（キャッシュの持ち越しを避ける）
- `retry: false` 設定で API モック失敗時の無限リトライを防ぐ
- toast を検証するなら `<Toaster />` も同階層にレンダリング

### サービスをモックする（MSW は使わない）

```ts
import * as projectService from "../services/project-service";
import * as employeeService from "../../employees/services/employee-service";

vi.mock("../services/project-service");
vi.mock("../../employees/services/employee-service");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(projectService.listProjects).mockResolvedValue({ projects: [] });
  vi.mocked(employeeService.searchEmployees).mockImplementation(/* ... */);
});
```

サービスは `apiClient` の薄いラッパーなので、サービス層でモックすれば fetch 全体を差し替えられる。

### user-event を使う

```ts
import { userEvent } from "@testing-library/user-event";

const user = userEvent.setup();
await user.click(screen.getByRole("button", { name: /プロジェクト追加/ }));
await user.type(screen.getByLabelText("プロジェクト名"), "テスト");
```

`fireEvent` ではなく `userEvent` を使い、実ユーザーに近い操作を再現する。

### TanStack Query `useMutation` の落とし穴

`mutate(payload)` を呼ぶと、内部で **mutationFn が `(payload, mutationContext)` の2引数で呼ばれる**。
そのため次の比較は失敗する:

```ts
// ❌ 失敗する: 第2引数の mutationContext が原因
expect(projectService.createProject).toHaveBeenCalledWith({ name: "x", ... });
```

第1引数だけ取り出して比較する:

```ts
// ✅ 正しい
await waitFor(() => {
  expect(projectService.createProject).toHaveBeenCalled();
});
expect(vi.mocked(projectService.createProject).mock.calls[0][0]).toEqual({
  name: "x",
  // ...
});
```

### debounce 入りコンポーネントの待ち

`EmployeeSearchSelect` のように `setTimeout(setDebouncedQuery, 200)` を使うコンポーネントでは、
入力後に `waitFor` で候補表示を待つ:

```ts
await user.type(screen.getByLabelText("リーダー"), "山");
await waitFor(() => screen.getByRole("button", { name: /山田 太郎/ }));
await user.click(screen.getByRole("button", { name: /山田 太郎/ }));
```

`vi.useFakeTimers()` でタイマーを進める方法もあるが、user-event との相性が悪いため
**実時間で `waitFor` する方が安定**。

### モックデータは shared の型に合わせる

`tsc --noEmit` を通すため、モックデータは `Employee` 型などをきっちり満たすこと。
`as any` で型を回避すると保守性が落ちる:

```ts
import type { Employee } from "@hr-management/shared";

const employees: Employee[] = [
  {
    id: "emp-1",
    lastName: "山田",
    firstName: "太郎",
    email: "yamada@example.com",
    phone: null,
    departmentId: "d1",
    status: "ACTIVE",
    department: { id: "d1", name: "営業" },
    position: "課長",
    hireDate: "2020-04-01",
    note: null,
    createdAt: "2020-04-01T00:00:00Z",
    updatedAt: "2020-04-01T00:00:00Z",
  },
  // ...
];
```

## shared の境界値テスト

zod スキーマは境界値だけ単体でテストする。サービス層・API層の振る舞いは結合テストでカバーするため、ここで重複させない。

```ts
import { describe, expect, it } from "vitest";
import { createProjectSchema } from "./project";

it("説明200文字ちょうどはOK", () => {
  const result = createProjectSchema.safeParse({
    ...validInput,
    description: "a".repeat(200),
  });
  expect(result.success).toBe(true);
});
```

新規 workspace で `vitest` をテストに使う場合は **devDependencies に明示的に追加**:

```json
{
  "devDependencies": { "vitest": "^4.1.7" },
  "scripts": { "test": "vitest run" }
}
```

## アンチパターン

- ❌ Real DB を使った結合テスト（テスト DB のセットアップ・クリーンアップが未整備のため）
- ❌ MSW セットアップを新規追加する（既存依存にないので vi.mock で十分）
- ❌ `as any` でモックの型を回避する → `Employee` などの shared 型を明示
- ❌ `setTimeout` を `vi.useFakeTimers()` で進めようとする → user-event との競合があるので `waitFor` でカバー
- ❌ コンポーネント単体テスト + 結合テストの両方を書く → どちらか片方に絞る（基本は結合テスト側）
- ❌ `// biome-ignore lint/suspicious/noExplicitAny` を残す → 型を整える

## 実行コマンド

```bash
bun run test                                  # 全 workspace のテスト
cd backend && bunx vitest run                 # backend のみ
cd frontend && bunx vitest run                # frontend のみ
cd shared && bunx vitest run                  # shared のみ
cd frontend && bunx vitest run path/to/file.test.tsx   # 単一ファイル
cd frontend && bunx vitest run -t "テスト名"         # 名前で絞り込み
```

## チェックリスト

新しいテストを追加するとき:

- [ ] 結合テストで「PBI の受け入れ基準」が直接検証されているか
- [ ] mock の cleanup (`vi.clearAllMocks()`) が `beforeEach` にあるか
- [ ] 型を `as any` で逃がしていないか
- [ ] `useMutation` を経由するアサーションは `mock.calls[0][0]` で第1引数を取り出しているか
- [ ] debounce やタイマー待ちは `waitFor` で吸収しているか
- [ ] `bun run lint` と `tsc --noEmit` が通るか
