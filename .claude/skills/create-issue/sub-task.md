# Sub-task 作成フロー

## 前提

Sub-task は、PBI から切り出した実装単位のサブタスク。
親 PBI と必ず紐付ける（GitHub の Sub-issues 機能を使用）。

## Step 1: テンプレート読み込み

以下のファイルを Read して、フィールド構造（label / value / required）を把握する:

- `.github/ISSUE_TEMPLATE/sub-task.yml`

このテンプレートのフィールドに沿って、最終プレビューと Issue 本文を組み立てる。

## Step 2: 親 PBI の指定

ユーザーに以下を聞く:

```
親となる PBI の Issue 番号を教えてください。
```

回答を取得後、`gh issue view` で親 PBI の内容を取得する:

```bash
gh issue view <親番号> \
  --json number,title,body,labels
```

## Step 3: 作業内容の入力

ユーザーに以下を順に聞く（テキスト入力）:

1. `このサブタスクで何を実装しますか？（タイトル兼作業内容、例: AddToCartButton コンポーネントを追加）`
2. `参照させたい既存コードのパスがあれば教えてください（複数可、なければ「なし」）`

→ 回答を組み合わせて、タイトルを以下の形式で組み立てる:

```
[Sub-task] <作業内容>
```

→ 参照コードが指定された場合は Read する。

## Step 4: 中間確認【1 回目の確認ポイント】

ここまでの入力内容（タイトル / 親 PBI 概要 / 参照コード）をまとめて提示し、`AskUserQuestion` で以下を聞く:

- 質問: `この内容で完了条件の草案作成に進みます。よろしいですか？`
- 選択肢:
  1. `OK で進める`
  2. `修正したい箇所がある`

`修正したい箇所がある` が選ばれた場合は、何をどう変えるかをテキストで聞き、該当部分のみ反映してこの Step を再実行する（**OK が出るまでループ**）。

## Step 5: AI による草案生成

親 PBI の内容と参照コードを踏まえて、`sub-task.yml` のフィールド構造に沿って以下を生成する:

- **作業内容（整文版）**: ユーザー入力を踏まえ、対象ファイル・モジュール・実装方針を補足
- **完了条件**: 文体ガイドに従い、「対象 + 作業 + している」形式で記述
  - `sub-task.yml` の `value` に含まれるデフォルト行（`単体テストを追加し通過している` / `PR レビューを通過している`）は末尾に保持する
- **補足**: 親 PBI から関係しそうな設計メモ・参考リンクがあれば抽出（該当なしなら空欄）

Sub-task の本文は plan モードでさらに詳細化される前提なので、深追いはしない。

## Step 6: 最終プレビュー【2 回目の確認ポイント】

`sub-task.yml` のフィールド構造（label）に沿って Markdown 本文を組み立て、タイトル含めて表示する:

```markdown
タイトル: [Sub-task] <作業内容>

## 作業内容
<整文版>

## 完了条件
- [ ] ...
- [ ] 単体テストを追加し通過している
- [ ] PR レビューを通過している

## 補足
<該当なしなら空欄>
```

`AskUserQuestion` で以下を聞く:

- 質問: `この内容で Issue を作成します。よろしいですか？`
- 選択肢:
  1. `OK で作成`
  2. `修正したい箇所がある`

`修正したい箇所がある` が選ばれた場合は、何をどう変えるかをテキストで聞き、該当フィールドのみ反映してこの Step を再実行する（**OK が出るまでループ**）。

## Step 7: Issue 作成 + 親 PBI へのリンク

### 7-1. Sub-task issue を作成

`gh repo view --json nameWithOwner -q .nameWithOwner` で現在のリポジトリ名を取得し、`AskUserQuestion` で「`<owner>/<repo>` に Issue を作成します。よろしいですか？」と確認する。

OK が出たら作成する:

```bash
gh issue create \
  --title "<組み立てたタイトル>" \
  --body "<組み立てた本文>"
```

返却された URL から子 Issue の番号を抽出する。

### 7-2. 親と子の GraphQL node ID を取得

現在のリポジトリの owner / name を取得してから node ID を引く:

```bash
owner=$(gh repo view --json owner -q .owner.login)
repo=$(gh repo view --json name -q .name)

parent_id=$(gh api graphql \
  -f query='query($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){issue(number:$number){id}}}' \
  -F owner="$owner" -F repo="$repo" -F number=<親番号> \
  -q .data.repository.issue.id)

child_id=$(gh api graphql \
  -f query='query($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){issue(number:$number){id}}}' \
  -F owner="$owner" -F repo="$repo" -F number=<子番号> \
  -q .data.repository.issue.id)
```

### 7-3. 親 PBI に Sub-task として紐付け

`addSubIssue` mutation を呼ぶ:

```bash
gh api graphql \
  -f query='mutation($parent:ID!,$child:ID!){addSubIssue(input:{issueId:$parent,subIssueId:$child}){subIssue{number}}}' \
  -F parent="$parent_id" \
  -F child="$child_id"
```

### 7-4. 完了報告

子 Issue の URL と「親 PBI #<番号> にリンクしました」をユーザーに表示して終了する。
