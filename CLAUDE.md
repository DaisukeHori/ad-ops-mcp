# CLAUDE.md — ad-ops-mcp 開発ガイド

## プロジェクト概要

Google Ads / Meta Ads (Facebook+Instagram) / Google Business Profile / X (Twitter) Ads の4プラットフォームを統合した広告運用 MCP サーバー。`hubspot-ma-mcp` と同じアーキテクチャ・パターンで構築する。

## 絶対ルール

### 1. hubspot-ma-mcp のパターンに完全準拠

このプロジェクトは `DaisukeHori/hubspot-ma-mcp` のコードスタイル・アーキテクチャ・設計思想を踏襲する。迷ったら hubspot-ma-mcp のコードを参照し、同じやり方で実装すること。

具体的に守るべきパターン:
- **各ツールは1ファイル** (`lib/mcp/tools/{platform}/xxx.ts`)
- **`registerXxx(server: McpServer)` 関数をエクスポート** する
- **ツール説明は日本語** で書く（Claude.ai で日本語ユーザーが使うため）
- **zod** でパラメータスキーマを定義
- **エラーハンドリング**: try-catch で `PlatformError` を捕捉し、`isError: true` で返す
- **fetchJson パターン**: 各ツールファイルの冒頭に `fetchJson` と `getHeaders` を定義
- **server.ts**: 全ツールの import と登録を一括管理
- **route.ts**: `mcp-handler` の `createMcpHandler` を使用

### 2. コードは省略しない

- 関数の実装を `// ...` で省略してはいけない
- 型定義を `any` で逃げてはいけない
- テストコードも含めて完全に書く

### 3. 日本語でコメント・説明を書く

- ツールの `description` は日本語
- ファイル冒頭のドキュメントコメントは日本語
- エラーメッセージは日本語

### 4. 各プラットフォームの認証パターン

| プラットフォーム | 認証方式 | 実装パターン |
|---|---|---|
| Google Ads | OAuth2 + Developer Token | Refresh Token → Access Token 自動リフレッシュ。リクエストヘッダーに `Authorization: Bearer` + `developer-token` + `login-customer-id` |
| Meta Ads | Long-lived Access Token | `access_token` パラメータ or ヘッダー。環境変数 `META_ADS_ACCESS_TOKEN` |
| GBP | OAuth2 | Google Ads と同様のリフレッシュパターン。`GBP_REFRESH_TOKEN` 使用 |
| X Ads | OAuth 1.0a | 自前で HMAC-SHA1 署名を生成。`Authorization: OAuth ...` ヘッダー |

### 5. Google Ads は REST API を使う

Google Ads API は gRPC と REST の両方をサポートしているが、Vercel Function (Node.js) 環境では **REST API** を使う。エンドポイントは `https://googleads.googleapis.com/v23/` 。データ取得は GAQL (Google Ads Query Language) を `searchStream` に POST する。（※ v18 は 2025年8月にサンセット済み。v23 が 2026年1月リリースの最新安定版）

### 6. 金額はマイクロ単位

Google Ads API の金額は全て **マイクロ単位** (1円 = 1,000,000 micros)。ツール説明にその旨を明記し、入力パラメータの `describe()` にも書くこと。

## ディレクトリ構造

```
ad-ops-mcp/
├── app/api/[transport]/route.ts   ← MCP エンドポイント
├── lib/
│   ├── config.ts                  ← 環境変数管理
│   ├── platforms/
│   │   ├── errors.ts              ← 共通エラークラス PlatformError
│   │   ├── google-ads/
│   │   │   ├── auth.ts            ← OAuth2 トークンリフレッシュ
│   │   │   ├── client.ts          ← REST API クライアント (searchStream, mutate)
│   │   │   ├── gaql.ts            ← GAQL クエリビルダー
│   │   │   └── types.ts
│   │   ├── meta-ads/
│   │   │   ├── auth.ts
│   │   │   ├── client.ts          ← Graph API クライアント (GET/POST)
│   │   │   └── types.ts
│   │   ├── gbp/
│   │   │   ├── auth.ts
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   └── x-ads/
│   │       ├── auth.ts            ← OAuth 1.0a 署名生成
│   │       ├── client.ts
│   │       └── types.ts
│   └── mcp/
│       ├── server.ts              ← registerAllTools()
│       └── tools/
│           ├── google-ads/        ← 20ツール
│           ├── meta-ads/          ← 20ツール
│           ├── gbp/               ← 10ツール
│           └── x-ads/             ← 12ツール
├── skill/SKILL.md                 ← Claude用スキル定義
├── docs/                          ← 設計書
├── tests/e2e-test.sh
├── package.json
├── tsconfig.json
├── vercel.json
└── .env.example
```

## 実装順序

### Step 1: プロジェクト基盤
1. `package.json`, `tsconfig.json`, `next.config.ts`, `vercel.json` 作成
2. `app/api/[transport]/route.ts` — MCP エンドポイント (hubspot-ma-mcp からコピー＋改変)
3. `app/layout.tsx`, `app/page.tsx`
4. `lib/config.ts` — 環境変数管理
5. `lib/platforms/errors.ts` — 共通エラークラス

### Step 2: Google Ads
1. `lib/platforms/google-ads/auth.ts` — OAuth2 トークンリフレッシュ
2. `lib/platforms/google-ads/client.ts` — REST API クライアント
3. `lib/platforms/google-ads/gaql.ts` — GAQL ビルダー
4. `lib/mcp/tools/google-ads/` — 全20ツール
5. `lib/mcp/server.ts` に登録

### Step 3: Meta Ads
1. `lib/platforms/meta-ads/auth.ts`
2. `lib/platforms/meta-ads/client.ts`
3. `lib/mcp/tools/meta-ads/` — 全20ツール
4. `lib/mcp/server.ts` に追加登録

### Step 4: GBP
1. `lib/platforms/gbp/auth.ts`
2. `lib/platforms/gbp/client.ts`
3. `lib/mcp/tools/gbp/` — 全10ツール
4. `lib/mcp/server.ts` に追加登録

### Step 5: X Ads
1. `lib/platforms/x-ads/auth.ts` — OAuth 1.0a 署名
2. `lib/platforms/x-ads/client.ts`
3. `lib/mcp/tools/x-ads/` — 全12ツール
4. `lib/mcp/server.ts` に追加登録

### Step 6: テスト実装
1. `vitest` + `msw` のセットアップ (`vitest.config.ts`, `tests/setup.ts`)
2. `tests/mocks/handlers/` — 全プラットフォームのモックハンドラー作成
3. `tests/mocks/fixtures/` — APIレスポンスフィクスチャ作成
4. `tests/helpers/mcp-client.ts` — `callTool()`, `chainTools()` ヘルパー
5. `tests/unit/platforms/` — 認証・クライアント・GAQLの単体テスト（49件）
6. `tests/unit/tools/google-ads/` — Google Ads ツール単体テスト（80件）
7. `tests/unit/tools/meta-ads/` — Meta Ads ツール単体テスト（80件）
8. `tests/unit/tools/gbp/` — GBP ツール単体テスト（40件）
9. `tests/unit/tools/x-ads/` — X Ads ツール単体テスト（48件）+ 予備24件
10. `tests/integration/it2/` — 2ツール結合テスト（200件）
11. `tests/integration/it3/` — 3ツール以上結合テスト（400件）

### Step 7: 仕上げ
1. `skill/SKILL.md` — 広告運用スキル定義
2. `.github/workflows/test.yml` — CI/CD パイプライン
3. `.env.example`
4. `README.md` 更新

## 参照すべきリポジトリ

- **hubspot-ma-mcp**: `https://github.com/DaisukeHori/hubspot-ma-mcp` — アーキテクチャの手本
- **Google Ads MCP (公式)**: `https://github.com/googleads/google-ads-mcp` — GAQL クエリの参考
- **Google Ads MCP (promobase)**: `https://github.com/promobase/google-ads-mcp` — 89サービスカバー、実装の参考
- **Google Ads REST API Docs**: `https://developers.google.com/google-ads/api/docs/get-started/make-first-call`
- **Meta Marketing API Docs**: `https://developers.facebook.com/docs/marketing-api`
- **GBP API Docs**: `https://developers.google.com/my-business/reference/rest`
- **X Ads API Docs**: `https://developer.x.com/en/docs/x-ads-api`

## 環境変数

`.env.example` に全変数を記載すること。Vercel にデプロイ時は Vercel Environment Variables に設定する。

```
AUTH_MODE=env_tokens
MCP_API_KEY=

GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=

META_ADS_ACCESS_TOKEN=
META_ADS_ACCOUNT_ID=

GBP_CLIENT_ID=
GBP_CLIENT_SECRET=
GBP_REFRESH_TOKEN=
GBP_ACCOUNT_ID=

X_ADS_API_KEY=
X_ADS_API_SECRET=
X_ADS_ACCESS_TOKEN=
X_ADS_ACCESS_SECRET=
X_ADS_ACCOUNT_ID=
```

## テスト

### テスト方針（必読）

**テスト計画書 `docs/test-plan.md` を必ず読んでから実装すること。**

テストは **Vitest + msw (Mock Service Worker)** で実装する。実際の外部APIは一切叩かない。

| レベル | 件数 | 内容 |
|---|---|---|
| UT（単体テスト） | 321件 | 全62ツール × 4パターン + インフラ49件 |
| IT2（2ツール結合） | 200件 | 1つ目の出力を2つ目の入力に渡す連携テスト |
| IT3（3ツール以上結合） | 400件 | 実運用フローの再現テスト |
| **合計** | **921件** | |

### テストディレクトリ構造

```
tests/
├── setup.ts                    # Vitest グローバルセットアップ
├── mocks/
│   ├── handlers/               # msw ハンドラー（プラットフォーム別）
│   └── fixtures/               # APIレスポンスフィクスチャ
├── unit/
│   ├── platforms/              # auth, client, gaql の単体テスト
│   └── tools/                  # 各ツールの単体テスト（4パターン/ツール）
├── integration/
│   ├── it2/                    # 2ツール結合テスト（200件）
│   └── it3/                    # 3ツール以上結合テスト（400件）
└── helpers/
    └── mcp-client.ts           # callTool(), chainTools() ヘルパー
```

### 単体テストの4パターン（全ツール共通）

各ツールは以下4パターンをテストすること:
- **A. 正常系**: 正常パラメータ → 成功レスポンス
- **B. 認証エラー**: API 401 → PlatformError + isError: true
- **C. レート制限**: API 429 → PlatformError + isError: true
- **D. パラメータ不正**: zod バリデーションエラー（必須パラメータ未指定）

### 結合テストのヘルパー

`chainTools()` を使って複数ツールを連鎖実行する:

```typescript
const results = await chainTools([
  { tool: "google_ads_budget_create", args: { name: "テスト予算", amountMicros: 1000000000 } },
  { tool: "google_ads_campaign_create", args: (prev) => ({
    name: "テストキャンペーン",
    budgetResourceName: extractResourceName(prev),
    advertisingChannelType: "SEARCH",
  })},
  { tool: "google_ads_adgroup_create", args: (prev) => ({
    campaignId: extractId(prev),
    name: "テスト広告グループ",
  })},
]);
```

### テスト実行

```bash
npm test                              # 全921件
npm test -- --dir tests/unit          # 単体のみ
npm test -- --dir tests/integration   # 結合のみ
npm test -- --coverage                # カバレッジ付き
```

### 合格基準

- 全921テスト合格率: **100%**
- コードカバレッジ (Line): **90%以上**
- コードカバレッジ (Branch): **85%以上**
- 全テスト実行時間: **120秒以内**

## デプロイ

```bash
git push origin main  # Vercel が自動デプロイ
```

Vercel の Function timeout は 60秒に設定（`vercel.json`）。

## 設計書の同期ルール

**CLAUDE.md に仕様変更があった場合、必ず以下の設計書・定義書にも同じ変更を反映すること。**

| ファイル | 内容 |
|---|---|
| `docs/requirements.md` | 企画要件定義書 |
| `docs/design.md` | 基本設計・詳細設計書 |
| `docs/test-plan.md` | テスト計画書 |
| `README.md` | プロジェクト概要 |

APIバージョン・エンドポイントURL・パラメータ仕様・ツール名などの変更は、全ドキュメントを横断的に更新すること。1箇所だけ変更して他を放置しないこと。

## 注意事項

- Google Ads API の金額は全てマイクロ単位。1円 = 1,000,000 micros
- Meta API のバージョンは `v25.0` を使用（2026年2月リリースの最新安定版。v21.0 は非推奨）
- X Ads API のバージョンは `12` を使用
- GBP API は Business Profile API v1 と My Business API v4 が混在する。エンドポイントに注意
- OAuth2 の Access Token キャッシュは module-level 変数で行う（Vercel Function は cold start があるため、永続キャッシュは不要）
