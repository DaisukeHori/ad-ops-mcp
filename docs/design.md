# ad-ops-mcp 基本設計・詳細設計書

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  Claude.ai / Claude Code                                    │
│  ┌───────────────┐   ┌──────────────────────────────────┐  │
│  │  SKILL.md     │──▶│  MCP Client (Claude内蔵)          │  │
│  │  (広告運用     │   │  Streamable HTTP Transport        │  │
│  │   操作ガイド)  │   └──────────┬───────────────────────┘  │
│  └───────────────┘              │                           │
└──────────────────────────────────┼───────────────────────────┘
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Vercel (Fluid Compute)                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App Router                               │  │
│  │                                                      │  │
│  │  /api/[transport]  (mcp-handler)                    │  │
│  │  ├── POST  → Streamable HTTP リクエスト処理         │  │
│  │  ├── GET   → SSE (後方互換)                         │  │
│  │  └── DELETE → セッション終了                         │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  MCP Server (62 tools)                       │  │  │
│  │  │                                              │  │  │
│  │  │  ┌─────────────┐  ┌─────────────────────┐  │  │  │
│  │  │  │ Google Ads   │  │ Meta Ads            │  │  │  │
│  │  │  │ (20 tools)   │  │ (20 tools)          │  │  │  │
│  │  │  └──────┬──────┘  └──────┬──────────────┘  │  │  │
│  │  │         │                 │                  │  │  │
│  │  │  ┌──────┴──────┐  ┌──────┴──────────────┐  │  │  │
│  │  │  │ GBP/Maps    │  │ X Ads               │  │  │  │
│  │  │  │ (10 tools)  │  │ (12 tools)          │  │  │  │
│  │  │  └─────────────┘  └─────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬──────────┬──────────┬──────────┬───────────┘
                │          │          │          │
         HTTPS/REST   Graph API   REST API   REST API
                │          │          │          │
                ▼          ▼          ▼          ▼
         ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
         │Google Ads│ │Meta    │ │GBP     │ │X Ads   │
         │API (REST)│ │Mktg API│ │API     │ │API     │
         └──────────┘ └────────┘ └────────┘ └────────┘
```

---

## 2. API バージョン（2026年3月時点）

### 2.1 各プラットフォームの API バージョン

| プラットフォーム | 使用バージョン | ベースURL | 備考 |
|---|---|---|---|
| Google Ads API | **v23** | `https://googleads.googleapis.com/v23/` | v18は2025年8月サンセット済み。v23は2026年1月リリース |
| Meta Marketing API | **v25.0** | `https://graph.facebook.com/v25.0/` | v21.0は非推奨。v25.0は2026年2月リリース |
| GBP API (Business Info) | **v1** | `https://mybusinessbusinessinformation.googleapis.com/v1/` | 現行 |
| GBP API (Reviews/Posts) | **v4** | `https://mybusiness.googleapis.com/v4/` | レガシーだが引き続き利用可能 |
| GBP API (Performance) | **v1** | `https://businessprofileperformance.googleapis.com/v1/` | 現行 |
| X Ads API | **v12** | `https://ads-api.x.com/12/` | 2022年10月リリース。最新版 |

### 2.2 Google Ads API v23 の主な変更点（v18 からの差分）

- **Performance Max チャネル別レポート**: Search, YouTube, Display, Gmail, Discover, Maps ごとのパフォーマンスデータ取得可能
- **Performance Max キャンペーンレベルのネガティブキーワード**: campaign_criterion で除外キーワード設定可能
- **テキストガイドライン**: Performance Max / Search キャンペーンで AI 生成テキストの制御（用語除外、メッセージ制限）
- **広告スケジュール改善**: start_date / end_date フィールドが日時（DateTime）に拡張
- **細分化請求書**: InvoiceService でキャンペーンレベルのコスト取得
- **CallAd / CallAdInfo サポート削除**: 電話広告は別の方法で実装が必要
- **広告グループ間の広告共有不可**: 各広告は単一の広告グループに紐付く
- **VideoEnhancement リソース追加**: 動画広告の強化設定

### 2.3 Meta Marketing API v25.0 の主な変更点（v21 からの差分）

- **Page Viewer Metric**: レガシーの reach 指標に代わる統合メトリクス（Facebook + Instagram 横断）
- **Reach/Impressions メトリクス非推奨**: 2026年6月に非推奨予定。新しいメトリクスへの移行が必要
- **Advantage+ キャンペーン変更**: ASC (Advantage+ Shopping Campaigns) と AAC の作成/更新が Marketing API から無効化。統合キャンペーン作成フローに移行
- **Ads Insights Async API エラー強化**: 詳細なエラーフィールド追加
- **Customer File Custom Audience 強制変更**: カスタムオーディエンスの利用条件変更
- **metadata=1 クエリパラメータ非推奨**: 別の方法でメタデータ取得が必要

### 2.4 GBP API の注意点

- Business Calls API、InsuranceNetworks、HealthProviderAttributes は非推奨
- `locations.fetchMultiDailyMetricsTimeSeries` への移行が推奨（旧パフォーマンス API メソッドから）
- GBP API へのアクセスには明示的な承認と有効なビジネス理由が必要

---

## 3. 技術スタック

> ※ セクション番号は旧版からずれています。以降の参照時はセクション名で参照してください。

| レイヤー | 技術 | 理由 |
|---|---|---|
| フレームワーク | Next.js 15 (App Router) | hubspot-ma-mcp と同一。mcp-handler 公式サポート |
| MCP ハンドラー | `mcp-handler` ^1.0.7 | Next.js 公式対応。Streamable HTTP + SSE 両対応 |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.25.2 | 公式 TypeScript SDK |
| バリデーション | `zod` ^3 | ツール入力スキーマ定義 |
| HTTP クライアント | 組み込み `fetch` | 全プラットフォーム API への通信 |
| OAuth 署名 | 自前実装 (X Ads OAuth 1.0a 用) | X Ads API のみ OAuth 1.0a が必要 |
| トランスポート | Streamable HTTP (ステートレス) | MCP 仕様準拠。Redis 不要 |
| デプロイ | Vercel (Fluid Compute) | GitHub → CI/CD → Vercel |
| 認証情報管理 | Vercel Environment Variables | APIキー・トークンの安全な管理 |

---

## 3. ディレクトリ構造

```
ad-ops-mcp/
├── app/
│   ├── api/
│   │   └── [transport]/
│   │       └── route.ts            # MCP エンドポイント (mcp-handler)
│   ├── layout.tsx
│   └── page.tsx                    # ヘルスチェック / ステータス表示
├── lib/
│   ├── config.ts                   # 環境変数管理
│   ├── platforms/
│   │   ├── google-ads/
│   │   │   ├── auth.ts             # OAuth2 + Developer Token 認証
│   │   │   ├── client.ts           # Google Ads REST API クライアント
│   │   │   ├── gaql.ts             # GAQL クエリビルダー
│   │   │   └── types.ts            # 型定義
│   │   ├── meta-ads/
│   │   │   ├── auth.ts             # Meta Access Token 管理
│   │   │   ├── client.ts           # Meta Marketing API クライアント
│   │   │   └── types.ts            # 型定義
│   │   ├── gbp/
│   │   │   ├── auth.ts             # OAuth2 認証
│   │   │   ├── client.ts           # GBP API クライアント
│   │   │   └── types.ts            # 型定義
│   │   ├── x-ads/
│   │   │   ├── auth.ts             # OAuth 1.0a 署名生成
│   │   │   ├── client.ts           # X Ads API クライアント
│   │   │   └── types.ts            # 型定義
│   │   └── errors.ts               # 共通エラーハンドリング
│   └── mcp/
│       ├── server.ts               # MCP サーバー初期化・全ツール登録
│       └── tools/
│           ├── google-ads/
│           │   ├── campaign-list.ts
│           │   ├── campaign-get.ts
│           │   ├── campaign-create.ts
│           │   ├── campaign-update.ts
│           │   ├── adgroup-list.ts
│           │   ├── adgroup-create.ts
│           │   ├── adgroup-update.ts
│           │   ├── ad-list.ts
│           │   ├── ad-create.ts
│           │   ├── ad-update.ts
│           │   ├── ad-policy-status.ts
│           │   ├── keyword-list.ts
│           │   ├── keyword-add.ts
│           │   ├── keyword-remove.ts
│           │   ├── budget-list.ts
│           │   ├── budget-create.ts
│           │   ├── budget-update.ts
│           │   ├── report-campaign.ts
│           │   ├── report-keyword.ts
│           │   └── account-list.ts
│           ├── meta-ads/
│           │   ├── campaign-list.ts
│           │   ├── campaign-get.ts
│           │   ├── campaign-create.ts
│           │   ├── campaign-update.ts
│           │   ├── adset-list.ts
│           │   ├── adset-get.ts
│           │   ├── adset-create.ts
│           │   ├── adset-update.ts
│           │   ├── ad-list.ts
│           │   ├── ad-get.ts
│           │   ├── ad-create.ts
│           │   ├── ad-update.ts
│           │   ├── ad-review-status.ts
│           │   ├── creative-create.ts
│           │   ├── creative-list.ts
│           │   ├── image-upload.ts
│           │   ├── insight-campaign.ts
│           │   ├── insight-adset.ts
│           │   ├── insight-ad.ts
│           │   └── audience-list.ts
│           ├── gbp/
│           │   ├── location-list.ts
│           │   ├── location-get.ts
│           │   ├── location-update.ts
│           │   ├── review-list.ts
│           │   ├── review-reply.ts
│           │   ├── post-list.ts
│           │   ├── post-create.ts
│           │   ├── post-delete.ts
│           │   ├── insight-get.ts
│           │   └── media-upload.ts
│           └── x-ads/
│               ├── account-list.ts
│               ├── campaign-list.ts
│               ├── campaign-create.ts
│               ├── campaign-update.ts
│               ├── lineitem-list.ts
│               ├── lineitem-create.ts
│               ├── lineitem-update.ts
│               ├── creative-list.ts
│               ├── creative-create.ts
│               ├── targeting-list.ts
│               ├── targeting-create.ts
│               └── analytics.ts
├── skill/
│   ├── SKILL.md                    # Claude 用操作スキル定義
│   └── references/
│       └── tools.md                # 全ツール一覧リファレンス
├── docs/
│   ├── requirements.md             # 企画要件定義書
│   └── design.md                   # 本書
├── CLAUDE.md                       # Claude Code 用指示書
├── README.md
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json
└── .env.example
```

---

## 4. 認証設計

### 4.1 認証コンテキスト（auth-context パターン）

hubspot-ma-mcp の `AsyncLocalStorage` パターンを拡張し、複数プラットフォーム対応にする。

```typescript
// lib/platforms/auth-context.ts

import { AsyncLocalStorage } from "node:async_hooks";

export type AuthMode = "env_tokens" | "api_key";

export interface PlatformTokens {
  // Google Ads
  googleAdsDeveloperToken?: string;
  googleAdsClientId?: string;
  googleAdsClientSecret?: string;
  googleAdsRefreshToken?: string;
  googleAdsCustomerId?: string;
  googleAdsLoginCustomerId?: string;

  // Meta Ads
  metaAdsAccessToken?: string;
  metaAdsAccountId?: string;

  // Google Business Profile
  gbpClientId?: string;
  gbpClientSecret?: string;
  gbpRefreshToken?: string;
  gbpAccountId?: string;

  // X Ads
  xAdsApiKey?: string;
  xAdsApiSecret?: string;
  xAdsAccessToken?: string;
  xAdsAccessSecret?: string;
  xAdsAccountId?: string;
}

export const authStorage = new AsyncLocalStorage<PlatformTokens>();
```

### 4.2 AUTH_MODE

| モード | 説明 | 用途 |
|---|---|---|
| `env_tokens`（デフォルト） | 全トークンを環境変数から取得 | 自社運用（Revol固定） |
| `api_key` | MCP_API_KEY でサーバー認証 + 環境変数トークン | 外部公開時 |

### 4.3 Google Ads OAuth2 トークンリフレッシュ

Google Ads と GBP は OAuth2 の Refresh Token を使用する。Access Token の有効期限は1時間なので、リクエスト時に自動リフレッシュする。

```typescript
// lib/platforms/google-ads/auth.ts

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

export async function getGoogleAdsAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry - 60000) {
    return cachedAccessToken;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: getEnv("GOOGLE_ADS_CLIENT_ID"),
      client_secret: getEnv("GOOGLE_ADS_CLIENT_SECRET"),
      refresh_token: getEnv("GOOGLE_ADS_REFRESH_TOKEN"),
    }),
  });

  const data = await response.json();
  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedAccessToken!;
}
```

### 4.4 X Ads OAuth 1.0a 署名

X Ads API は OAuth 1.0a を使用する。署名は自前で実装する。

```typescript
// lib/platforms/x-ads/auth.ts

import crypto from "node:crypto";

export function generateOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string> = {}
): string {
  const oauthParams = {
    oauth_consumer_key: getEnv("X_ADS_API_KEY"),
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: getEnv("X_ADS_ACCESS_TOKEN"),
    oauth_version: "1.0",
  };

  // 署名ベース文字列生成 → HMAC-SHA1 署名 → Authorization ヘッダー構築
  // ...（完全実装は実装フェーズで）
}
```

---

## 5. プラットフォーム別 API クライアント設計

### 5.1 Google Ads REST API クライアント

```typescript
// lib/platforms/google-ads/client.ts

const GOOGLE_ADS_API_VERSION = "v23";
const BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export async function searchGoogleAds(
  customerId: string,
  query: string
): Promise<unknown[]> {
  const accessToken = await getGoogleAdsAccessToken();
  const response = await fetch(
    `${BASE_URL}/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": getEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "login-customer-id": getEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  // レスポンスパース...
}

export async function mutateGoogleAds(
  customerId: string,
  service: string,
  operations: unknown[]
): Promise<unknown> {
  const accessToken = await getGoogleAdsAccessToken();
  const response = await fetch(
    `${BASE_URL}/customers/${customerId}/${service}:mutate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": getEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "login-customer-id": getEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ operations }),
    }
  );
  // レスポンスパース...
}
```

### 5.2 GAQL クエリビルダー

Google Ads のデータ取得は GAQL（Google Ads Query Language）で行う。

```typescript
// lib/platforms/google-ads/gaql.ts

export function buildCampaignListQuery(options?: {
  status?: string;
  limit?: number;
}): string {
  let query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
  `;
  const conditions: string[] = [];
  if (options?.status) {
    conditions.push(`campaign.status = '${options.status}'`);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  query += ` ORDER BY campaign.id`;
  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }
  return query;
}
```

### 5.3 Meta Marketing API クライアント

```typescript
// lib/platforms/meta-ads/client.ts

const META_API_VERSION = "v25.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export async function metaGet<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const accessToken = getEnv("META_ADS_ACCESS_TOKEN");
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", accessToken);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new PlatformError("meta", response.status, error.error?.message || JSON.stringify(error));
  }
  return response.json() as Promise<T>;
}

export async function metaPost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const accessToken = getEnv("META_ADS_ACCESS_TOKEN");
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: accessToken }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new PlatformError("meta", response.status, error.error?.message || JSON.stringify(error));
  }
  return response.json() as Promise<T>;
}
```

### 5.4 GBP API クライアント

```typescript
// lib/platforms/gbp/client.ts

const GBP_BASE_URL = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GBP_REVIEWS_URL = "https://mybusiness.googleapis.com/v4";

// OAuth2 トークンリフレッシュは google-ads/auth.ts と同様のパターン
// GBP 用に別の refresh token を使用
```

### 5.5 X Ads API クライアント

```typescript
// lib/platforms/x-ads/client.ts

const X_ADS_API_VERSION = "12";
const BASE_URL = `https://ads-api.x.com/${X_ADS_API_VERSION}`;

export async function xAdsGet<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}/${endpoint}`;
  const authHeader = generateOAuthHeader("GET", url);
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: authHeader },
  });
  // レスポンスパース...
}
```

---

## 6. エラーハンドリング設計

### 6.1 共通エラークラス

```typescript
// lib/platforms/errors.ts

export type Platform = "google_ads" | "meta" | "gbp" | "x";

export class PlatformError extends Error {
  public readonly platform: Platform;
  public readonly status: number;
  public readonly platformMessage: string;

  constructor(platform: Platform, status: number, message: string) {
    super(`${platform} API Error (${status}): ${message}`);
    this.name = "PlatformError";
    this.platform = platform;
    this.status = status;
    this.platformMessage = message;
  }

  toUserMessage(): string {
    const platformNames: Record<Platform, string> = {
      google_ads: "Google Ads",
      meta: "Meta (Facebook/Instagram)",
      gbp: "Google Business Profile",
      x: "X (Twitter)",
    };
    const name = platformNames[this.platform];

    switch (this.status) {
      case 401:
        return `${name} の API トークンが無効です。環境変数を再確認してください。`;
      case 403:
        return `${name} の API 権限が不足しています。必要なスコープが付与されているか確認してください。`;
      case 429:
        return `${name} の API レート制限に達しました。しばらく待ってから再試行してください。`;
      default:
        if (this.status >= 500) {
          return `${name} 側でエラーが発生しました。しばらく待ってから再試行してください。`;
        }
        return `${name} API エラー: ${this.platformMessage}`;
    }
  }
}
```

### 6.2 ツールハンドラーでのエラー処理パターン

hubspot-ma-mcp と同じパターンを全ツールで統一:

```typescript
async (params) => {
  try {
    const result = await apiCall(params);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof PlatformError
      ? error.toUserMessage()
      : String(error);
    return { content: [{ type: "text" as const, text: message }], isError: true };
  }
}
```

---

## 7. ツール詳細設計（代表例）

### 7.1 `google_ads_campaign_create`

```
ツール名: google_ads_campaign_create
説明: Google Ads に新しいキャンペーンを作成する。予算は別途 google_ads_budget_create で作成し、そのリソース名を指定する。

入力パラメータ:
  - name: string (必須) — キャンペーン名
  - advertisingChannelType: enum (必須) — "SEARCH" | "DISPLAY" | "VIDEO" | "SHOPPING" | "PERFORMANCE_MAX"
  - status: enum (オプション, デフォルト: "PAUSED") — "ENABLED" | "PAUSED"
  - budgetResourceName: string (必須) — 予算リソース名 (customers/{id}/campaignBudgets/{id})
  - biddingStrategy: object (必須) — 入札戦略
    - type: "MAXIMIZE_CLICKS" | "MAXIMIZE_CONVERSIONS" | "TARGET_CPA" | "TARGET_ROAS" | "MANUAL_CPC"
    - targetCpaMicros?: number — TARGET_CPA の場合の目標CPA（マイクロ単位）
    - targetRoas?: number — TARGET_ROAS の場合の目標ROAS
  - networkSettings: object (オプション) — ネットワーク設定
    - targetSearchNetwork: boolean
    - targetContentNetwork: boolean
  - startDate: string (オプション) — 開始日 (YYYY-MM-DD)
  - endDate: string (オプション) — 終了日 (YYYY-MM-DD)

Google Ads API: POST /customers/{customerId}/campaigns:mutate
出力: 作成されたキャンペーンのリソース名
```

### 7.2 `meta_ads_ad_review_status`

```
ツール名: meta_ads_ad_review_status
説明: Meta 広告の審査ステータスを一括確認する。リジェクトされた広告がある場合は理由も返す。

入力パラメータ:
  - campaignId: string (オプション) — 特定キャンペーンの広告のみ
  - status: enum (オプション) — "PENDING" | "APPROVED" | "REJECTED" でフィルタ

Meta API: GET /act_{account_id}/ads?fields=name,status,review_feedback,ad_review_feedback

出力: 各広告の審査ステータスとフィードバック
  - ad_id, name, effective_status
  - review_feedback: { global: { status, reasons[] } }
  - リジェクト理由がある場合は日本語で解説を付与
```

### 7.3 `gbp_review_reply`

```
ツール名: gbp_review_reply
説明: Google マップ上の口コミに返信する。

入力パラメータ:
  - locationId: string (必須) — ロケーションID
  - reviewId: string (必須) — 口コミID
  - comment: string (必須) — 返信テキスト

GBP API: PUT /accounts/{account}/locations/{location}/reviews/{review}/reply
  Body: { "comment": "返信テキスト" }

出力: 返信成功メッセージ
```

---

## 8. MCP サーバー登録パターン

### 8.1 server.ts の構造

```typescript
// lib/mcp/server.ts

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ── Google Ads ──
import { registerGoogleAdsCampaignList } from "./tools/google-ads/campaign-list";
import { registerGoogleAdsCampaignGet } from "./tools/google-ads/campaign-get";
// ... 全20ツール

// ── Meta Ads ──
import { registerMetaAdsCampaignList } from "./tools/meta-ads/campaign-list";
// ... 全20ツール

// ── GBP ──
import { registerGbpLocationList } from "./tools/gbp/location-list";
// ... 全10ツール

// ── X Ads ──
import { registerXAdsCampaignList } from "./tools/x-ads/campaign-list";
// ... 全12ツール

export function registerAllTools(server: McpServer): void {
  // Google Ads（20 tools）
  registerGoogleAdsCampaignList(server);
  // ...

  // Meta Ads（20 tools）
  registerMetaAdsCampaignList(server);
  // ...

  // GBP（10 tools）
  registerGbpLocationList(server);
  // ...

  // X Ads（12 tools）
  registerXAdsCampaignList(server);
  // ...
}
```

### 8.2 route.ts のパターン

hubspot-ma-mcp と同一。`AUTH_MODE` による認証分岐、`MCP_API_KEY` によるアクセス制御。

---

## 9. 環境変数一覧

```env
# ── MCPサーバー認証 ──
AUTH_MODE=env_tokens          # "env_tokens" | "api_key"
MCP_API_KEY=                  # api_key モード時のアクセスキー

# ── Google Ads ──
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=       # 10桁のクライアントカスタマーID
GOOGLE_ADS_LOGIN_CUSTOMER_ID= # MCCアカウントID（オプション）

# ── Meta Ads (Facebook / Instagram) ──
META_ADS_ACCESS_TOKEN=        # Long-lived Access Token
META_ADS_ACCOUNT_ID=          # act_XXXXXXXXX 形式

# ── Google Business Profile ──
GBP_CLIENT_ID=                # Google Ads と共有可能
GBP_CLIENT_SECRET=
GBP_REFRESH_TOKEN=
GBP_ACCOUNT_ID=

# ── X (Twitter) Ads ──
X_ADS_API_KEY=                # Consumer Key
X_ADS_API_SECRET=             # Consumer Secret
X_ADS_ACCESS_TOKEN=           # User Access Token
X_ADS_ACCESS_SECRET=          # User Access Secret
X_ADS_ACCOUNT_ID=             # 広告アカウントID
```

---

## 10. テスト設計

テスト計画の全体像は `docs/test-plan.md` を参照。ここではアーキテクチャに関連するテスト設計のみ記載する。

### 10.1 テストフレームワーク

| ライブラリ | 用途 |
|---|---|
| Vitest | テストランナー・アサーション |
| msw (Mock Service Worker) | HTTP レベルのAPIモック |

### 10.2 テスト規模

- 単体テスト (UT): **321件** — 全ツール4パターン + インフラ49件
- 2ツール結合 (IT2): **200件** — ツール間データ連携
- 3ツール以上結合 (IT3): **400件** — 実運用フロー再現
- **合計: 921件**

### 10.3 モック設計

msw を使い、各プラットフォームの REST API エンドポイントをインターセプトする。OAuth2 トークンエンドポイント（`https://oauth2.googleapis.com/token`）もモック対象。

### 10.4 結合テスト用ヘルパー

`chainTools()` 関数で複数ツールを順序実行し、前のツールの出力から ID やリソース名を抽出して次のツールの入力に渡す。これにより実運用と同じデータフローをテストする。

---

## 11. Vercel デプロイ設定

### 11.1 vercel.json

```json
{
  "functions": {
    "app/api/[transport]/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### 11.2 デプロイ手順

1. GitHub リポジトリと Vercel を連携
2. Environment Variables に全トークンを設定
3. `main` ブランチへの push で自動デプロイ
4. MCP エンドポイント URL: `https://ad-ops-mcp.vercel.app/api/mcp?key={MCP_API_KEY}`
