# ad-ops-mcp 企画要件定義書

## 1. プロジェクト概要

### 1.1 プロジェクト名

**ad-ops-mcp** — 広告運用オートメーション MCP サーバー

### 1.2 目的

広告運用代理店が行っている業務（キャンペーン作成・入稿・予算管理・パフォーマンス分析・審査対応・最適化）を、Claude から MCP 経由で直接操作できるようにする。

**代理店に支払う広告費の20%手数料をゼロにする。**

### 1.3 コンセプト

`hubspot-ma-mcp` と同じ思想・同じアーキテクチャで、以下の4プラットフォームの広告運用APIを統合する:

1. **Google Ads** — 検索広告・ディスプレイ広告・YouTube広告
2. **Meta Ads** — Facebook広告・Instagram広告
3. **Google Business Profile** — Googleマップ上の店舗情報・口コミ管理
4. **X (Twitter) Ads** — X上のプロモーション広告

### 1.4 ターゲットユーザー

- Revol Corporation の広告運用担当者（＝堀大輔CEO本人）
- Claude.ai Web / Claude Code から操作

### 1.5 類似プロジェクトとの差異

| 項目 | hubspot-ma-mcp | ad-ops-mcp |
|---|---|---|
| 対象API | HubSpot 1社 | Google Ads + Meta + GBP + X の4社 |
| 認証 | HubSpot PAT 1つ | プラットフォームごとに異なる認証方式 |
| ツール数 | 128ツール | 約70ツール（Phase 1） |
| Knowledge Store | あり（HubSpot固有） | 将来Phase 2で追加検討 |

---

## 2. 機能要件

### 2.1 プラットフォーム別機能一覧

#### 2.1.1 Google Ads（20ツール）

| カテゴリ | ツール名 | 操作 | Google Ads API エンドポイント |
|---|---|---|---|
| キャンペーン | `google_ads_campaign_list` | 一覧取得 | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_campaign_get` | 詳細取得 | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_campaign_create` | 作成 | CampaignService.MutateCampaigns |
| | `google_ads_campaign_update` | 更新（予算・入札・ステータス変更含む） | CampaignService.MutateCampaigns |
| 広告グループ | `google_ads_adgroup_list` | 一覧取得 | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_adgroup_create` | 作成 | AdGroupService.MutateAdGroups |
| | `google_ads_adgroup_update` | 更新 | AdGroupService.MutateAdGroups |
| 広告 | `google_ads_ad_list` | 一覧取得 | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_ad_create` | 作成 | AdGroupAdService.MutateAdGroupAds |
| | `google_ads_ad_update` | 更新（ステータス変更含む） | AdGroupAdService.MutateAdGroupAds |
| | `google_ads_ad_policy_status` | 審査ステータス確認 | GoogleAdsService.SearchStream (policy_summary) |
| キーワード | `google_ads_keyword_list` | 一覧取得 | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_keyword_add` | 追加 | AdGroupCriterionService.MutateAdGroupCriteria |
| | `google_ads_keyword_remove` | 除外 | AdGroupCriterionService.MutateAdGroupCriteria |
| 予算 | `google_ads_budget_list` | 一覧取得 | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_budget_create` | 作成 | CampaignBudgetService.MutateCampaignBudgets |
| | `google_ads_budget_update` | 更新 | CampaignBudgetService.MutateCampaignBudgets |
| レポート | `google_ads_report_campaign` | キャンペーンレポート | GoogleAdsService.SearchStream (GAQL) |
| | `google_ads_report_keyword` | キーワードレポート | GoogleAdsService.SearchStream (GAQL) |
| アカウント | `google_ads_account_list` | アクセス可能なアカウント一覧 | CustomerService.ListAccessibleCustomers |

#### 2.1.2 Meta Ads — Facebook + Instagram（20ツール）

| カテゴリ | ツール名 | 操作 | Meta Marketing API エンドポイント |
|---|---|---|---|
| キャンペーン | `meta_ads_campaign_list` | 一覧取得 | GET /{ad_account_id}/campaigns |
| | `meta_ads_campaign_get` | 詳細取得 | GET /{campaign_id} |
| | `meta_ads_campaign_create` | 作成 | POST /{ad_account_id}/campaigns |
| | `meta_ads_campaign_update` | 更新 | POST /{campaign_id} |
| 広告セット | `meta_ads_adset_list` | 一覧取得 | GET /{ad_account_id}/adsets |
| | `meta_ads_adset_get` | 詳細取得 | GET /{adset_id} |
| | `meta_ads_adset_create` | 作成 | POST /{ad_account_id}/adsets |
| | `meta_ads_adset_update` | 更新 | POST /{adset_id} |
| 広告 | `meta_ads_ad_list` | 一覧取得 | GET /{ad_account_id}/ads |
| | `meta_ads_ad_get` | 詳細取得 | GET /{ad_id} |
| | `meta_ads_ad_create` | 作成 | POST /{ad_account_id}/ads |
| | `meta_ads_ad_update` | 更新 | POST /{ad_id} |
| | `meta_ads_ad_review_status` | 審査ステータス一括確認 | GET /{ad_account_id}/ads?fields=review_feedback |
| クリエイティブ | `meta_ads_creative_create` | 作成 | POST /{ad_account_id}/adcreatives |
| | `meta_ads_creative_list` | 一覧取得 | GET /{ad_account_id}/adcreatives |
| 画像 | `meta_ads_image_upload` | 画像アップロード | POST /{ad_account_id}/adimages |
| インサイト | `meta_ads_insight_campaign` | キャンペーンインサイト | GET /{campaign_id}/insights |
| | `meta_ads_insight_adset` | 広告セットインサイト | GET /{adset_id}/insights |
| | `meta_ads_insight_ad` | 広告インサイト | GET /{ad_id}/insights |
| オーディエンス | `meta_ads_audience_list` | カスタムオーディエンス一覧 | GET /{ad_account_id}/customaudiences |

#### 2.1.3 Google Business Profile — Googleマップ（10ツール）

| カテゴリ | ツール名 | 操作 | GBP API エンドポイント |
|---|---|---|---|
| ロケーション | `gbp_location_list` | 店舗一覧取得 | accounts/{account}/locations |
| | `gbp_location_get` | 店舗詳細取得 | locations/{location} |
| | `gbp_location_update` | 店舗情報更新 | locations/{location} PATCH |
| 口コミ | `gbp_review_list` | 口コミ一覧取得 | locations/{location}/reviews |
| | `gbp_review_reply` | 口コミ返信 | locations/{location}/reviews/{review}/reply |
| 投稿 | `gbp_post_list` | 投稿一覧取得 | locations/{location}/localPosts |
| | `gbp_post_create` | 投稿作成 | locations/{location}/localPosts POST |
| | `gbp_post_delete` | 投稿削除 | localPosts/{post} DELETE |
| インサイト | `gbp_insight_get` | パフォーマンスデータ取得 | locations/{location}:fetchMultiDailyMetricsTimeSeries |
| メディア | `gbp_media_upload` | 写真アップロード | locations/{location}/media POST |

#### 2.1.4 X (Twitter) Ads（12ツール）

| カテゴリ | ツール名 | 操作 | X Ads API エンドポイント |
|---|---|---|---|
| アカウント | `x_ads_account_list` | 広告アカウント一覧 | GET /accounts |
| キャンペーン | `x_ads_campaign_list` | キャンペーン一覧 | GET /accounts/{id}/campaigns |
| | `x_ads_campaign_create` | キャンペーン作成 | POST /accounts/{id}/campaigns |
| | `x_ads_campaign_update` | キャンペーン更新 | PUT /accounts/{id}/campaigns/{id} |
| ラインアイテム | `x_ads_lineitem_list` | ラインアイテム一覧 | GET /accounts/{id}/line_items |
| | `x_ads_lineitem_create` | ラインアイテム作成 | POST /accounts/{id}/line_items |
| | `x_ads_lineitem_update` | ラインアイテム更新 | PUT /accounts/{id}/line_items/{id} |
| クリエイティブ | `x_ads_creative_list` | プロモツイート一覧 | GET /accounts/{id}/promoted_tweets |
| | `x_ads_creative_create` | プロモツイート作成 | POST /accounts/{id}/promoted_tweets |
| ターゲティング | `x_ads_targeting_list` | ターゲティング条件一覧 | GET /accounts/{id}/targeting_criteria |
| | `x_ads_targeting_create` | ターゲティング条件追加 | POST /accounts/{id}/targeting_criteria |
| アナリティクス | `x_ads_analytics` | パフォーマンスデータ取得 | GET /stats/accounts/{id} |

### 2.2 横断機能

| 機能 | 説明 |
|---|---|
| 統合レポート | 全プラットフォームの広告パフォーマンスを横断的に取得し比較 |
| 審査ステータス監視 | Google Ads policy_summary + Meta review_feedback を一括チェック |

---

## 3. 非機能要件

### 3.1 認証方式

| プラットフォーム | 認証方式 | 必要なクレデンシャル |
|---|---|---|
| Google Ads | OAuth 2.0 + Developer Token | `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID` |
| Meta Ads | Long-lived Access Token | `META_ADS_ACCESS_TOKEN`, `META_ADS_ACCOUNT_ID` |
| Google Business Profile | OAuth 2.0 | `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`, `GBP_REFRESH_TOKEN`, `GBP_ACCOUNT_ID` |
| X Ads | OAuth 1.0a | `X_ADS_API_KEY`, `X_ADS_API_SECRET`, `X_ADS_ACCESS_TOKEN`, `X_ADS_ACCESS_SECRET`, `X_ADS_ACCOUNT_ID` |

※ `AUTH_MODE=api_key` の場合は `MCP_API_KEY` で MCPサーバー自体の認証を行い、各プラットフォームのトークンは全て環境変数から取得する（hubspot-ma-mcp と同じ方式）。

### 3.2 パフォーマンス

- Vercel Function のタイムアウト: 60秒
- Google Ads API (REST) のレスポンスタイム: 通常1〜5秒
- Meta API のレスポンスタイム: 通常1〜3秒

### 3.3 セキュリティ

- 全通信は HTTPS/TLS
- APIトークンは Vercel Environment Variables で管理（Git にコミットしない）
- `AUTH_MODE=api_key` モードで MCP サーバーへのアクセスを制限

### 3.4 デプロイ

- Vercel にデプロイ（GitHub → CI/CD → Vercel）
- `hubspot-ma-mcp` と同じ Vercel Fluid Compute 構成

---

## 4. 人間が行う初期セットアップ手順

### 4.1 Google Ads

1. Google Ads マネージャーアカウントを作成（https://ads.google.com）
2. API Center で Developer Token を申請
3. Google Cloud Console で OAuth 2.0 クライアントを作成
4. Refresh Token を取得（google-ads-python の `authenticate_in_web_application` サンプル等）
5. 環境変数に設定

### 4.2 Meta Ads

1. Meta Business Manager でアプリを作成（https://developers.facebook.com）
2. Marketing API プロダクトを追加
3. Graph API Explorer で Long-lived Access Token を生成
4. 広告アカウントID（`act_XXXXXXXXX`）を確認
5. 環境変数に設定

### 4.3 Google Business Profile

1. Google Cloud Console で Business Profile API を有効化
2. OAuth 2.0 クライアントを作成（Google Ads と共有可能）
3. Refresh Token を取得
4. GBP Account ID を確認
5. 環境変数に設定

### 4.4 X (Twitter) Ads

1. X Developer Portal でアカウント作成（https://developer.x.com）
2. Project & App を作成
3. ads.x.com/help から Ads API アクセスを申請
4. Standard Access の承認を待つ
5. API Key, API Secret, Access Token, Access Secret を取得
6. 広告アカウントID を確認
7. 環境変数に設定

---

## 5. フェーズ計画

### Phase 1（MVP）

- Google Ads: 20ツール
- Meta Ads: 20ツール
- Google Business Profile: 10ツール
- X Ads: 12ツール
- 合計: **62ツール**
- SKILL.md 作成

### Phase 2（拡張）

- Knowledge Store（hubspot-ma-mcp の knowledge 系ツール相当）
- 自動最適化ルール（入札自動調整、予算再配分）
- Supabase 連携（パフォーマンスデータ蓄積・ダッシュボード）
- revol-bugyo-replacement への ROAS データ連携

### Phase 3（高度化）

- Claude による広告文自動生成・A/Bテスト管理
- リジェクト自動修正フロー
- 横断レポート生成（全プラットフォーム統合）
- 予算最適配分AI（どのプラットフォームにいくら配分すべきか）

---

## 6. 前提条件・制約

1. Google Ads API は REST API を使用する（gRPC ではなく HTTP/JSON）
   - REST は v14 以降で正式サポート。Vercel Function 環境で gRPC は困難なため
2. Meta Marketing API のバージョンは最新安定版（v21.0 等）を使用
3. X Ads API の Ads API アクセスが承認されていること
4. Google Ads の Developer Token が Basic Access 以上であること
5. 全プラットフォームのAPIキー・トークンが環境変数で提供されていること

---

## 7. 成功基準

1. Claude.ai から「Google Adsでリスティング広告キャンペーンを作って」と指示して、実際にキャンペーンが作成される
2. 「Instagramの広告パフォーマンスを教えて」で、直近のインサイトデータが返る
3. 「Googleマップの口コミに返信して」で、実際に返信が投稿される
4. 「全プラットフォームの今月の広告費と成果を比較して」で、横断レポートが生成される
5. 広告審査がリジェクトされた際に、理由の取得と修正案の提示ができる
