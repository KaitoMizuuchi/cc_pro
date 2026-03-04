# Research & Design Decisions

## Summary
- **Feature**: `auth-foundation`
- **Discovery Scope**: New Feature（認証基盤はグリーンフィールド実装であり、セキュリティに関わるため Full Discovery を実施）
- **Key Findings**:
  - Hono は `hono/jwt` にビルトインの JWT ヘルパー（sign/verify/decode）とミドルウェアを提供しており、外部ライブラリ不要で JWT 認証を実現可能
  - Bun ランタイムは `Bun.password` API でビルトインのパスワードハッシュ（bcrypt/argon2id）を提供しており、サードパーティ依存なしでセキュアなハッシュ化が可能
  - トースト通知には sonner が React 19 互換かつ軽量で、本プロジェクトのスタック（Tailwind CSS）と親和性が高い

## Research Log

### Hono JWT 認証
- **Context**: 認証トークンの発行・検証に使用するライブラリの選定
- **Sources Consulted**:
  - [JWT Auth Middleware - Hono](https://hono.dev/docs/middleware/builtin/jwt)
  - [JWT Authentication Helper - Hono](https://hono.dev/docs/helpers/jwt)
- **Findings**:
  - `hono/jwt` から `sign`, `verify`, `decode` をインポート可能
  - `sign(payload, secret, alg?)` で JWT トークンを生成（非同期）
  - `verify(token, secret, alg)` で署名検証と `exp`/`nbf`/`iat` クレーム検証を自動実行
  - ビルトインミドルウェア `jwt({ secret, alg })` で Authorization ヘッダーから自動検証
  - `c.get('jwtPayload')` でデコード済みペイロードにアクセス可能
  - エラー型: `JwtTokenInvalid`, `JwtTokenExpired`, `JwtTokenSignatureMismatched` 等
  - 対応アルゴリズム: HS256, HS384, HS512, RS256 等
- **Implications**: MVP では HS256（対称鍵）で十分。`hono/jwt` のみで完結し、外部依存を追加する必要がない

### Bun パスワードハッシュ
- **Context**: ユーザーパスワードのセキュアなハッシュ化手段の選定
- **Sources Consulted**:
  - [Hash a password - Bun](https://bun.com/docs/guides/util/hash-a-password)
  - [Bun.password API Reference](https://bun.com/reference/bun/password)
- **Findings**:
  - `Bun.password.hash(password, options?)` で非同期ハッシュ化（ワーカースレッドで実行）
  - `Bun.password.verify(password, hash)` で非同期検証（アルゴリズムはハッシュ文字列から自動検出）
  - デフォルトアルゴリズムは argon2id、`{ algorithm: "bcrypt" }` で bcrypt 指定可能
  - bcrypt の場合 72 バイト超のパスワードは SHA-512 で前処理される（安全なデフォルト動作）
  - サードパーティ依存不要
- **Implications**: `Bun.password` を使用し bcrypt アルゴリズムでハッシュ化。互換性が高く、既存の bcrypt 実装との相互運用も可能

### トースト通知ライブラリ
- **Context**: 成功・エラー通知の表示に適したライブラリの選定
- **Sources Consulted**:
  - [Comparing the top React toast libraries - LogRocket Blog](https://blog.logrocket.com/react-toast-libraries-compared-2025/)
  - [sonner - npm](https://www.npmjs.com/package/sonner)
- **Findings**:
  - sonner: React 18+ 対応、TypeScript ファースト、軽量、shadcn/ui エコシステムで標準的
  - react-hot-toast: シンプルだが React 19 対応の明示情報が少ない
  - sonner は Tailwind CSS との統合が容易で、カスタマイズ性が高い
- **Implications**: sonner を採用。新規依存として frontend に追加

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| JWT ステートレス認証 | サーバー側にセッション状態を持たず、JWT トークンで認証状態を管理 | スケーラブル、サーバー負荷低、実装シンプル | トークン無効化が困難、トークンサイズ | MVP にはステートレスで十分 |
| セッションベース認証 | サーバー側でセッション状態を管理 | トークン無効化が容易 | ステート管理が必要、スケーリング困難 | 本プロジェクトの規模には過剰 |
| localStorage トークン保存 | JWT を localStorage に保存 | 実装シンプル、ページリロード耐性あり | XSS に対して脆弱 | CORS 設定と CSP で軽減。MVP 段階では許容 |
| httpOnly Cookie 保存 | JWT を httpOnly Cookie に保存 | XSS 耐性が高い | CSRF 対策が必要、同一ドメイン制約 | 将来的な強化候補 |

## Design Decisions

### Decision: JWT アルゴリズムに HS256 を採用
- **Context**: トークン署名アルゴリズムの選定
- **Alternatives Considered**:
  1. HS256 -- 対称鍵、シンプル、高速
  2. RS256 -- 非対称鍵、トークン検証のみを分離可能
- **Selected Approach**: HS256
- **Rationale**: 単一バックエンドサーバー構成であり、非対称鍵のメリット（検証キーの分離配布）が不要。`hono/jwt` でネイティブサポートされている
- **Trade-offs**: マイクロサービス化時にはRS256への移行が必要になる可能性がある
- **Follow-up**: JWT_SECRET の環境変数管理を徹底

### Decision: パスワードハッシュに Bun.password（bcrypt）を採用
- **Context**: パスワードの安全な保存方式
- **Alternatives Considered**:
  1. `Bun.password`（bcrypt） -- ランタイムビルトイン、外部依存なし
  2. `bcryptjs` npm パッケージ -- pure JS 実装
  3. `Bun.password`（argon2id） -- より新しいアルゴリズム
- **Selected Approach**: `Bun.password` with bcrypt
- **Rationale**: 外部依存を追加せずにセキュアなハッシュ化が可能。bcrypt は広く検証済みのアルゴリズムであり、業界標準。Bun ランタイムのワーカースレッドで非同期実行されるためパフォーマンスも良好
- **Trade-offs**: argon2id の方が理論的にはより強固だが、bcrypt で十分な保護を提供
- **Follow-up**: コストパラメータのデフォルト値（10）の妥当性を実装時に確認

### Decision: JWT トークンを localStorage に保存
- **Context**: クライアント側でのトークン保存場所
- **Alternatives Considered**:
  1. localStorage -- シンプル、永続的
  2. httpOnly Cookie -- XSS 耐性高
  3. メモリ（変数）-- 最もセキュアだがリロードで消失
- **Selected Approach**: localStorage
- **Rationale**: MVP フェーズでの実装シンプルさを優先。Vite dev server のプロキシ設定により同一オリジンで動作するため、CORS の複雑さを回避。将来的に httpOnly Cookie への移行パスは確保
- **Trade-offs**: XSS 攻撃に対して脆弱。本番環境では CSP ヘッダーや入力サニタイズで軽減
- **Follow-up**: Post-MVP で httpOnly Cookie への移行を検討

### Decision: トースト通知に sonner を採用
- **Context**: ユーザーへの成功・エラーフィードバック表示手段
- **Alternatives Considered**:
  1. sonner -- TypeScript ファースト、React 18+ 対応、軽量
  2. react-hot-toast -- シンプルだが React 19 明示対応不明
  3. 自前実装 -- 完全制御可能だが開発コスト高
- **Selected Approach**: sonner
- **Rationale**: React 19 対応、TypeScript ファースト設計、Tailwind CSS との高い親和性。`toast.success()` / `toast.error()` のシンプルな API で要件を満たす
- **Trade-offs**: 新規依存の追加
- **Follow-up**: `<Toaster />` コンポーネントの配置場所を main.tsx に統一

## Risks & Mitigations
- **XSS によるトークン窃取** -- CSP ヘッダー設定、入力サニタイズの徹底。Post-MVP で httpOnly Cookie へ移行
- **JWT シークレットの漏洩** -- 環境変数で管理し、コードベースにハードコードしない。`.env` を `.gitignore` に含める
- **トークン有効期限切れ時の UX** -- フロントエンド側で API レスポンスの 401 を検知し、自動リダイレクトとメッセージ表示
- **bcrypt のコスト設定** -- デフォルト（cost: 10）で開始し、レスポンス時間を測定して調整

## References
- [JWT Auth Middleware - Hono](https://hono.dev/docs/middleware/builtin/jwt) -- Hono ビルトイン JWT ミドルウェアの公式ドキュメント
- [JWT Authentication Helper - Hono](https://hono.dev/docs/helpers/jwt) -- sign/verify/decode ヘルパー関数の API リファレンス
- [Hash a password - Bun](https://bun.com/docs/guides/util/hash-a-password) -- Bun.password API の使用ガイド
- [Bun.password API Reference](https://bun.com/reference/bun/password) -- Bun.password の詳細 API リファレンス
- [sonner - npm](https://www.npmjs.com/package/sonner) -- sonner トーストライブラリ
- [Comparing the top React toast libraries - LogRocket Blog](https://blog.logrocket.com/react-toast-libraries-compared-2025/) -- React トーストライブラリ比較記事
