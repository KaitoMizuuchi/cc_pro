---
name: create-issue
description: knowledgebase プロジェクトの GitHub Issue（PBI / Sub-task / バグ）を対話式に作成する。PBI・Sub-task・バグを新規作成したいときに使用する。
disable-model-invocation: true
allowed-tools: Bash(gh issue view:*), Bash(gh issue create:*), Bash(gh repo view:*), Bash(gh api:*), Read, Glob
argument-hint: （引数なし、起動後に対話で選択）
---

# GitHub Issue 作成スキル

knowledgebase リポジトリ向けに、`.github/ISSUE_TEMPLATE/` のテンプレートに沿った Issue を対話式で作成する。
対象は **PBI** / **Sub-task** / **バグ** の 3 タイプ。

## 共通方針

### 文体ガイド

#### 受け入れ基準（PBI）

- 「主語 + 操作 + 期待結果」を 1 行に圧縮し、語尾は **「〜している」** で揃える
- 1 ケース 1 行（結合テストのテストケースに 1:1 対応する粒度）
- 観測可能な振る舞いで書く（曖昧表現・内部実装の話は避ける）
- 正常系 / 異常系 / 境界 で区分する

#### 完了条件（Sub-task）

- 「対象 + 作業内容」を 1 行に圧縮し、語尾は **「〜している」** で揃える
- 対象ファイル名・コンポーネント名を含めて具体的に書く

### 確認ループの扱い

中間確認・最終確認のステップでは、ユーザーに `OK / 修正したい箇所がある` を選択してもらう。

- `修正したい箇所がある` が選ばれた場合は、何をどう変えたいかをテキストで聞き、該当部分のみ反映してプレビューを再表示する
- **`OK` が出るまで同じステップでループする**
- 修正の差し戻しはフィールド単位（やり直しではなくピンポイント修正）

### Issue 作成コマンド

`gh issue create` を使用する。リポジトリは `dreamcareer/knowledgebase` を明示する。

## 手順

### Step 0: タイプ選択

`AskUserQuestion` ツールで以下を提示し、ユーザーに選択させる:

- 質問: `どのタイプの Issue を作成しますか？`
- 選択肢:
  1. `PBI` — Product Backlog Item（ユーザーストーリー、機能追加・UX 改善・具体的な非機能改善など）
  2. `Sub-task` — PBI から切り出した実装単位のサブタスク
  3. `バグ` — 運用中に発見された不具合の起票

### Step 1: タイプ別フローへ分岐

選択結果に応じて、対応する手順書を **Read** して、その手順に従って続行する:

- `PBI` を選択 → `.agents/skills/create-issue/pbi.md` を Read
- `Sub-task` を選択 → `.agents/skills/create-issue/sub-task.md` を Read
- `バグ` を選択 → `.agents/skills/create-issue/bug.md` を Read

各手順書には、対応する Issue テンプレート（`.github/ISSUE_TEMPLATE/pbi.yml` / `sub-task.yml` / `bug.yml`）の読み込み指示を含む。
