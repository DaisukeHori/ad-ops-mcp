# ad-ops-mcp テスト計画書

## 1. テスト方針

### 1.1 基本方針

- **全ツール・全モジュールに対して単体テストを実施する**（省略なし）
- **実際のAPIは叩かない** — 全テストで外部API呼び出しをモック化する
- **MCP JSON-RPC プロトコル** を通してツールを呼び出す結合テストを重視する
- テストフレームワーク: **Vitest**（Next.js 15 との相性が良い）
- モック: **msw (Mock Service Worker)** で HTTP レベルのモックを構築

### 1.2 テストレベル定義

| レベル | 定義 | モック範囲 | 件数目標 |
|---|---|---|---|
| UT (単体テスト) | 1つのモジュール/関数/ツールを単独でテスト | 外部API全モック | **321件** |
| IT2 (2ツール結合) | 2つのツールを順序実行し、出力→入力の連携を検証 | 外部API全モック | **200件** |
| IT3 (3ツール以上結合) | 3つ以上のツールを連鎖実行し、実運用フローを再現 | 外部API全モック | **400件** |

**合計: 921件**

### 1.3 テスト実行環境

```
tests/
├── setup.ts                          # Vitest グローバルセットアップ (msw サーバー起動)
├── mocks/
│   ├── handlers/
│   │   ├── google-ads.ts             # Google Ads API モックハンドラー群
│   │   ├── meta-ads.ts              # Meta Marketing API モックハンドラー群
│   │   ├── gbp.ts                   # GBP API モックハンドラー群
│   │   ├── x-ads.ts                 # X Ads API モックハンドラー群
│   │   └── oauth.ts                 # OAuth2 / OAuth1.0a トークンエンドポイントモック
│   └── fixtures/
│       ├── google-ads/              # Google Ads API レスポンスフィクスチャ
│       ├── meta-ads/                # Meta API レスポンスフィクスチャ
│       ├── gbp/                     # GBP API レスポンスフィクスチャ
│       └── x-ads/                   # X Ads API レスポンスフィクスチャ
├── unit/
│   ├── platforms/                   # プラットフォームクライアント単体テスト
│   └── tools/                       # 各ツール単体テスト
├── integration/
│   ├── it2/                         # 2ツール結合テスト
│   └── it3/                         # 3ツール以上結合テスト
└── helpers/
    └── mcp-client.ts                # テスト用MCPクライアントヘルパー
```

---

## 2. 単体テスト (UT) — 321件

### 2.1 インフラストラクチャ単体テスト（49件）

#### 2.1.1 認証モジュール（23件）

| # | テストID | テスト対象 | テスト内容 | 期待結果 |
|---|---|---|---|---|
| 1 | UT-AUTH-001 | google-ads/auth | 正常なRefreshTokenでAccessTokenを取得 | 有効なAccessTokenが返る |
| 2 | UT-AUTH-002 | google-ads/auth | AccessTokenがキャッシュされ再利用される | 2回目の呼び出しでfetchが発生しない |
| 3 | UT-AUTH-003 | google-ads/auth | キャッシュ期限切れ後に自動リフレッシュ | 新しいAccessTokenが返る |
| 4 | UT-AUTH-004 | google-ads/auth | 無効なRefreshTokenでエラー | PlatformError(401) |
| 5 | UT-AUTH-005 | google-ads/auth | OAuth2エンドポイントが500を返す場合 | PlatformError(500) |
| 6 | UT-AUTH-006 | meta-ads/auth | 環境変数からAccessTokenを正常取得 | トークン文字列が返る |
| 7 | UT-AUTH-007 | meta-ads/auth | 環境変数未設定でエラー | Error("META_ADS_ACCESS_TOKEN...") |
| 8 | UT-AUTH-008 | meta-ads/auth | AccountID取得（act_プレフィックス付き） | 正しいAccountIDが返る |
| 9 | UT-AUTH-009 | gbp/auth | 正常なRefreshTokenでAccessTokenを取得 | 有効なAccessTokenが返る |
| 10 | UT-AUTH-010 | gbp/auth | AccessTokenキャッシュ | 2回目の呼び出しでfetchが発生しない |
| 11 | UT-AUTH-011 | gbp/auth | キャッシュ期限切れ後リフレッシュ | 新しいAccessTokenが返る |
| 12 | UT-AUTH-012 | gbp/auth | 無効なRefreshTokenでエラー | PlatformError(401) |
| 13 | UT-AUTH-013 | gbp/auth | 環境変数未設定でエラー | Error("GBP_REFRESH_TOKEN...") |
| 14 | UT-AUTH-014 | x-ads/auth | OAuth 1.0a 署名を正常生成 | 有効なAuthorizationヘッダー |
| 15 | UT-AUTH-015 | x-ads/auth | nonceが毎回異なる | 2回の呼び出しで異なるnonce |
| 16 | UT-AUTH-016 | x-ads/auth | timestampが現在時刻 | 誤差1秒以内 |
| 17 | UT-AUTH-017 | x-ads/auth | 署名ベース文字列の正規化 | RFC 5849準拠の文字列 |
| 18 | UT-AUTH-018 | x-ads/auth | 予約文字のパーセントエンコード | ":"と","が正しくエンコード |
| 19 | UT-AUTH-019 | auth-context | env_tokensモードで環境変数から取得 | 各プラットフォームのトークン取得成功 |
| 20 | UT-AUTH-020 | auth-context | api_keyモードでMCP_API_KEY検証成功 | mcpHandler実行 |
| 21 | UT-AUTH-021 | auth-context | api_keyモードでMCP_API_KEY不一致 | 401レスポンス |
| 22 | UT-AUTH-022 | auth-context | MCP_API_KEY未設定でapi_keyモード | 500レスポンス |
| 23 | UT-AUTH-023 | auth-context | getAuthMode()のデフォルト値 | "env_tokens" |

#### 2.1.2 APIクライアントモジュール（16件）

| # | テストID | テスト対象 | テスト内容 | 期待結果 |
|---|---|---|---|---|
| 24 | UT-CLI-001 | google-ads/client | searchStreamで正常GAQL実行 | レスポンス配列 |
| 25 | UT-CLI-002 | google-ads/client | mutateで正常操作実行 | mutate結果 |
| 26 | UT-CLI-003 | google-ads/client | developer-tokenヘッダーが付与される | ヘッダー検証 |
| 27 | UT-CLI-004 | google-ads/client | login-customer-idヘッダーが付与される | ヘッダー検証 |
| 28 | UT-CLI-005 | meta-ads/client | metaGetで正常GET実行 | レスポンスオブジェクト |
| 29 | UT-CLI-006 | meta-ads/client | metaPostで正常POST実行 | レスポンスオブジェクト |
| 30 | UT-CLI-007 | meta-ads/client | access_tokenがクエリパラメータに付与される | URL検証 |
| 31 | UT-CLI-008 | meta-ads/client | APIエラー時にPlatformError送出 | PlatformError("meta") |
| 32 | UT-CLI-009 | gbp/client | gbpGetで正常GET実行 | レスポンスオブジェクト |
| 33 | UT-CLI-010 | gbp/client | gbpPatchで正常PATCH実行 | レスポンスオブジェクト |
| 34 | UT-CLI-011 | gbp/client | Authorizationヘッダーが付与される | ヘッダー検証 |
| 35 | UT-CLI-012 | gbp/client | APIエラー時にPlatformError送出 | PlatformError("gbp") |
| 36 | UT-CLI-013 | x-ads/client | xAdsGetで正常GET実行 | レスポンスオブジェクト |
| 37 | UT-CLI-014 | x-ads/client | xAdsPostで正常POST実行 | レスポンスオブジェクト |
| 38 | UT-CLI-015 | x-ads/client | OAuth 1.0a Authorizationヘッダーが付与される | ヘッダー検証 |
| 39 | UT-CLI-016 | x-ads/client | APIエラー時にPlatformError送出 | PlatformError("x") |

#### 2.1.3 共通モジュール（10件）

| # | テストID | テスト対象 | テスト内容 | 期待結果 |
|---|---|---|---|---|
| 40 | UT-COM-001 | errors | PlatformError(401).toUserMessage() | "トークンが無効" |
| 41 | UT-COM-002 | errors | PlatformError(403).toUserMessage() | "権限が不足" |
| 42 | UT-COM-003 | errors | PlatformError(429).toUserMessage() | "レート制限" |
| 43 | UT-COM-004 | errors | PlatformError(500).toUserMessage() | "側でエラー" |
| 44 | UT-COM-005 | errors | PlatformError(400).toUserMessage() | APIメッセージそのまま |
| 45 | UT-COM-006 | errors | 各プラットフォーム名が正しく表示される | "Google Ads" / "Meta" / "GBP" / "X" |
| 46 | UT-COM-007 | config | getConfig()で全環境変数取得 | 設定オブジェクト |
| 47 | UT-COM-008 | config | 環境変数未設定時にundefined | undefined |
| 48 | UT-COM-009 | gaql | buildCampaignListQuery() | 有効なGAQL |
| 49 | UT-COM-010 | gaql | buildCampaignListQuery({ status: "ENABLED", limit: 10 }) | WHERE句とLIMIT句付きGAQL |

### 2.2 ツール単体テスト（272件）

各ツールに対して以下4パターンのテストを実施する:

| パターン | テスト内容 |
|---|---|
| A. 正常系 | 正常なパラメータでAPIが成功レスポンスを返す場合 |
| B. API認証エラー | APIが401を返す場合のエラーハンドリング |
| C. レート制限 | APIが429を返す場合のエラーハンドリング |
| D. パラメータ不正 | zodバリデーションで弾かれるケース |

ただし、パラメータなしのツール（list系で引数がオプションのみ）はパターンDをスキップ → 一部ツールは3テスト。

#### 2.2.1 Google Ads ツール（80件）

| # | テストID | ツール | パターン |
|---|---|---|---|
| 50 | UT-GA-001 | google_ads_campaign_list | A: 正常取得 |
| 51 | UT-GA-002 | google_ads_campaign_list | B: 401エラー |
| 52 | UT-GA-003 | google_ads_campaign_list | C: 429エラー |
| 53 | UT-GA-004 | google_ads_campaign_list | A: statusフィルタ付き |
| 54 | UT-GA-005 | google_ads_campaign_get | A: 正常取得 |
| 55 | UT-GA-006 | google_ads_campaign_get | B: 401エラー |
| 56 | UT-GA-007 | google_ads_campaign_get | C: 429エラー |
| 57 | UT-GA-008 | google_ads_campaign_get | D: campaignId未指定 |
| 58 | UT-GA-009 | google_ads_campaign_create | A: 正常作成 |
| 59 | UT-GA-010 | google_ads_campaign_create | B: 401エラー |
| 60 | UT-GA-011 | google_ads_campaign_create | C: 429エラー |
| 61 | UT-GA-012 | google_ads_campaign_create | D: name未指定 |
| 62 | UT-GA-013 | google_ads_campaign_update | A: 正常更新（ステータス変更） |
| 63 | UT-GA-014 | google_ads_campaign_update | A: 正常更新（入札戦略変更） |
| 64 | UT-GA-015 | google_ads_campaign_update | B: 401エラー |
| 65 | UT-GA-016 | google_ads_campaign_update | D: campaignId未指定 |
| 66 | UT-GA-017 | google_ads_adgroup_list | A: 正常取得 |
| 67 | UT-GA-018 | google_ads_adgroup_list | B: 401エラー |
| 68 | UT-GA-019 | google_ads_adgroup_list | C: 429エラー |
| 69 | UT-GA-020 | google_ads_adgroup_list | A: campaignIdフィルタ付き |
| 70 | UT-GA-021 | google_ads_adgroup_create | A: 正常作成 |
| 71 | UT-GA-022 | google_ads_adgroup_create | B: 401エラー |
| 72 | UT-GA-023 | google_ads_adgroup_create | D: campaignId未指定 |
| 73 | UT-GA-024 | google_ads_adgroup_create | D: name未指定 |
| 74 | UT-GA-025 | google_ads_adgroup_update | A: 正常更新 |
| 75 | UT-GA-026 | google_ads_adgroup_update | B: 401エラー |
| 76 | UT-GA-027 | google_ads_adgroup_update | D: adGroupId未指定 |
| 77 | UT-GA-028 | google_ads_ad_list | A: 正常取得 |
| 78 | UT-GA-029 | google_ads_ad_list | B: 401エラー |
| 79 | UT-GA-030 | google_ads_ad_list | C: 429エラー |
| 80 | UT-GA-031 | google_ads_ad_list | A: adGroupIdフィルタ付き |
| 81 | UT-GA-032 | google_ads_ad_create | A: レスポンシブ検索広告の正常作成 |
| 82 | UT-GA-033 | google_ads_ad_create | B: 401エラー |
| 83 | UT-GA-034 | google_ads_ad_create | D: headlines未指定 |
| 84 | UT-GA-035 | google_ads_ad_create | D: adGroupId未指定 |
| 85 | UT-GA-036 | google_ads_ad_update | A: 正常更新（PAUSED） |
| 86 | UT-GA-037 | google_ads_ad_update | B: 401エラー |
| 87 | UT-GA-038 | google_ads_ad_policy_status | A: 全広告APPROVED |
| 88 | UT-GA-039 | google_ads_ad_policy_status | A: 一部DISAPPROVED（理由付き） |
| 89 | UT-GA-040 | google_ads_ad_policy_status | B: 401エラー |
| 90 | UT-GA-041 | google_ads_ad_policy_status | A: REVIEW_IN_PROGRESS含む |
| 91 | UT-GA-042 | google_ads_keyword_list | A: 正常取得 |
| 92 | UT-GA-043 | google_ads_keyword_list | B: 401エラー |
| 93 | UT-GA-044 | google_ads_keyword_list | A: adGroupIdフィルタ付き |
| 94 | UT-GA-045 | google_ads_keyword_add | A: 正常追加 |
| 95 | UT-GA-046 | google_ads_keyword_add | B: 401エラー |
| 96 | UT-GA-047 | google_ads_keyword_add | D: keyword未指定 |
| 97 | UT-GA-048 | google_ads_keyword_add | A: matchType指定(PHRASE) |
| 98 | UT-GA-049 | google_ads_keyword_remove | A: 正常削除 |
| 99 | UT-GA-050 | google_ads_keyword_remove | B: 401エラー |
| 100 | UT-GA-051 | google_ads_keyword_remove | D: criterionId未指定 |
| 101 | UT-GA-052 | google_ads_budget_list | A: 正常取得 |
| 102 | UT-GA-053 | google_ads_budget_list | B: 401エラー |
| 103 | UT-GA-054 | google_ads_budget_create | A: 正常作成（日予算1000円） |
| 104 | UT-GA-055 | google_ads_budget_create | B: 401エラー |
| 105 | UT-GA-056 | google_ads_budget_create | D: amountMicros未指定 |
| 106 | UT-GA-057 | google_ads_budget_create | A: マイクロ単位の金額が正しく送信される |
| 107 | UT-GA-058 | google_ads_budget_update | A: 正常更新 |
| 108 | UT-GA-059 | google_ads_budget_update | B: 401エラー |
| 109 | UT-GA-060 | google_ads_budget_update | D: budgetId未指定 |
| 110 | UT-GA-061 | google_ads_report_campaign | A: 7日間レポート取得 |
| 111 | UT-GA-062 | google_ads_report_campaign | A: 30日間レポート取得 |
| 112 | UT-GA-063 | google_ads_report_campaign | B: 401エラー |
| 113 | UT-GA-064 | google_ads_report_campaign | A: 日別ブレークダウン |
| 114 | UT-GA-065 | google_ads_report_keyword | A: 正常取得 |
| 115 | UT-GA-066 | google_ads_report_keyword | B: 401エラー |
| 116 | UT-GA-067 | google_ads_report_keyword | A: campaignIdフィルタ付き |
| 117 | UT-GA-068 | google_ads_report_keyword | A: 品質スコア含むレポート |
| 118 | UT-GA-069 | google_ads_account_list | A: 正常取得（複数アカウント） |
| 119 | UT-GA-070 | google_ads_account_list | B: 401エラー |
| 120 | UT-GA-071 | google_ads_account_list | A: 単一アカウント |
| 121-129 | UT-GA-072〜080 | 各ツール | C: 429エラー（未テスト分の補完） |

#### 2.2.2 Meta Ads ツール（80件）

| # | テストID | ツール | パターン |
|---|---|---|---|
| 130 | UT-MA-001 | meta_ads_campaign_list | A: 正常取得 |
| 131 | UT-MA-002 | meta_ads_campaign_list | B: 401エラー |
| 132 | UT-MA-003 | meta_ads_campaign_list | C: 429エラー |
| 133 | UT-MA-004 | meta_ads_campaign_list | A: effective_statusフィルタ付き |
| 134 | UT-MA-005 | meta_ads_campaign_get | A: 正常取得 |
| 135 | UT-MA-006 | meta_ads_campaign_get | B: 401エラー |
| 136 | UT-MA-007 | meta_ads_campaign_get | D: campaignId未指定 |
| 137 | UT-MA-008 | meta_ads_campaign_get | A: fields指定（objective, status） |
| 138 | UT-MA-009 | meta_ads_campaign_create | A: REACH目的の正常作成 |
| 139 | UT-MA-010 | meta_ads_campaign_create | A: CONVERSIONS目的の正常作成 |
| 140 | UT-MA-011 | meta_ads_campaign_create | B: 401エラー |
| 141 | UT-MA-012 | meta_ads_campaign_create | D: name未指定 |
| 142 | UT-MA-013 | meta_ads_campaign_update | A: ステータスPAUSED |
| 143 | UT-MA-014 | meta_ads_campaign_update | B: 401エラー |
| 144 | UT-MA-015 | meta_ads_campaign_update | D: campaignId未指定 |
| 145 | UT-MA-016 | meta_ads_campaign_update | A: daily_budget変更 |
| 146 | UT-MA-017 | meta_ads_adset_list | A: 正常取得 |
| 147 | UT-MA-018 | meta_ads_adset_list | B: 401エラー |
| 148 | UT-MA-019 | meta_ads_adset_list | C: 429エラー |
| 149 | UT-MA-020 | meta_ads_adset_list | A: campaignIdフィルタ付き |
| 150 | UT-MA-021 | meta_ads_adset_get | A: 正常取得 |
| 151 | UT-MA-022 | meta_ads_adset_get | B: 401エラー |
| 152 | UT-MA-023 | meta_ads_adset_get | D: adsetId未指定 |
| 153 | UT-MA-024 | meta_ads_adset_create | A: 年齢・地域ターゲティング付き正常作成 |
| 154 | UT-MA-025 | meta_ads_adset_create | B: 401エラー |
| 155 | UT-MA-026 | meta_ads_adset_create | D: campaignId未指定 |
| 156 | UT-MA-027 | meta_ads_adset_create | D: targeting未指定 |
| 157 | UT-MA-028 | meta_ads_adset_update | A: 正常更新（予算変更） |
| 158 | UT-MA-029 | meta_ads_adset_update | B: 401エラー |
| 159 | UT-MA-030 | meta_ads_ad_list | A: 正常取得 |
| 160 | UT-MA-031 | meta_ads_ad_list | B: 401エラー |
| 161 | UT-MA-032 | meta_ads_ad_list | C: 429エラー |
| 162 | UT-MA-033 | meta_ads_ad_get | A: 正常取得 |
| 163 | UT-MA-034 | meta_ads_ad_get | B: 401エラー |
| 164 | UT-MA-035 | meta_ads_ad_get | D: adId未指定 |
| 165 | UT-MA-036 | meta_ads_ad_create | A: 正常作成（creativeId指定） |
| 166 | UT-MA-037 | meta_ads_ad_create | B: 401エラー |
| 167 | UT-MA-038 | meta_ads_ad_create | D: adsetId未指定 |
| 168 | UT-MA-039 | meta_ads_ad_create | A: status=PAUSED指定 |
| 169 | UT-MA-040 | meta_ads_ad_update | A: 正常更新 |
| 170 | UT-MA-041 | meta_ads_ad_update | B: 401エラー |
| 171 | UT-MA-042 | meta_ads_ad_review_status | A: 全広告APPROVED |
| 172 | UT-MA-043 | meta_ads_ad_review_status | A: 一部REJECTED（理由付き） |
| 173 | UT-MA-044 | meta_ads_ad_review_status | A: PENDING含む |
| 174 | UT-MA-045 | meta_ads_ad_review_status | B: 401エラー |
| 175 | UT-MA-046 | meta_ads_creative_create | A: 画像クリエイティブの正常作成 |
| 176 | UT-MA-047 | meta_ads_creative_create | B: 401エラー |
| 177 | UT-MA-048 | meta_ads_creative_create | D: object_story_spec未指定 |
| 178 | UT-MA-049 | meta_ads_creative_list | A: 正常取得 |
| 179 | UT-MA-050 | meta_ads_creative_list | B: 401エラー |
| 180 | UT-MA-051 | meta_ads_image_upload | A: 正常アップロード |
| 181 | UT-MA-052 | meta_ads_image_upload | B: 401エラー |
| 182 | UT-MA-053 | meta_ads_image_upload | D: imageUrl未指定 |
| 183 | UT-MA-054 | meta_ads_image_upload | A: アップロード後のimage_hashが返る |
| 184 | UT-MA-055 | meta_ads_insight_campaign | A: 7日間インサイト取得 |
| 185 | UT-MA-056 | meta_ads_insight_campaign | A: 30日間インサイト取得 |
| 186 | UT-MA-057 | meta_ads_insight_campaign | B: 401エラー |
| 187 | UT-MA-058 | meta_ads_insight_campaign | A: breakdowns=age指定 |
| 188 | UT-MA-059 | meta_ads_insight_adset | A: 正常取得 |
| 189 | UT-MA-060 | meta_ads_insight_adset | B: 401エラー |
| 190 | UT-MA-061 | meta_ads_insight_adset | D: adsetId未指定 |
| 191 | UT-MA-062 | meta_ads_insight_ad | A: 正常取得 |
| 192 | UT-MA-063 | meta_ads_insight_ad | B: 401エラー |
| 193 | UT-MA-064 | meta_ads_insight_ad | D: adId未指定 |
| 194 | UT-MA-065 | meta_ads_audience_list | A: 正常取得 |
| 195 | UT-MA-066 | meta_ads_audience_list | B: 401エラー |
| 196 | UT-MA-067 | meta_ads_audience_list | C: 429エラー |
| 197-209 | UT-MA-068〜080 | 各ツール | C: 429エラー（未テスト分の補完） |

#### 2.2.3 GBP ツール（40件）

| # | テストID | ツール | パターン |
|---|---|---|---|
| 210 | UT-GB-001 | gbp_location_list | A: 正常取得（複数店舗） |
| 211 | UT-GB-002 | gbp_location_list | B: 401エラー |
| 212 | UT-GB-003 | gbp_location_list | C: 429エラー |
| 213 | UT-GB-004 | gbp_location_list | A: ページネーション（nextPageToken） |
| 214 | UT-GB-005 | gbp_location_get | A: 正常取得 |
| 215 | UT-GB-006 | gbp_location_get | B: 401エラー |
| 216 | UT-GB-007 | gbp_location_get | D: locationId未指定 |
| 217 | UT-GB-008 | gbp_location_get | A: 営業時間・住所含むフル情報 |
| 218 | UT-GB-009 | gbp_location_update | A: 営業時間の正常更新 |
| 219 | UT-GB-010 | gbp_location_update | B: 401エラー |
| 220 | UT-GB-011 | gbp_location_update | D: locationId未指定 |
| 221 | UT-GB-012 | gbp_location_update | A: 電話番号の更新 |
| 222 | UT-GB-013 | gbp_review_list | A: 正常取得（複数口コミ） |
| 223 | UT-GB-014 | gbp_review_list | B: 401エラー |
| 224 | UT-GB-015 | gbp_review_list | A: 星評価付き口コミ |
| 225 | UT-GB-016 | gbp_review_list | D: locationId未指定 |
| 226 | UT-GB-017 | gbp_review_reply | A: 正常返信 |
| 227 | UT-GB-018 | gbp_review_reply | B: 401エラー |
| 228 | UT-GB-019 | gbp_review_reply | D: reviewId未指定 |
| 229 | UT-GB-020 | gbp_review_reply | D: comment未指定 |
| 230 | UT-GB-021 | gbp_post_list | A: 正常取得 |
| 231 | UT-GB-022 | gbp_post_list | B: 401エラー |
| 232 | UT-GB-023 | gbp_post_list | C: 429エラー |
| 233 | UT-GB-024 | gbp_post_create | A: テキスト投稿の正常作成 |
| 234 | UT-GB-025 | gbp_post_create | A: イベント投稿の正常作成 |
| 235 | UT-GB-026 | gbp_post_create | B: 401エラー |
| 236 | UT-GB-027 | gbp_post_create | D: summary未指定 |
| 237 | UT-GB-028 | gbp_post_delete | A: 正常削除 |
| 238 | UT-GB-029 | gbp_post_delete | B: 401エラー |
| 239 | UT-GB-030 | gbp_post_delete | D: postId未指定 |
| 240 | UT-GB-031 | gbp_insight_get | A: 7日間インサイト取得 |
| 241 | UT-GB-032 | gbp_insight_get | A: 30日間インサイト取得 |
| 242 | UT-GB-033 | gbp_insight_get | B: 401エラー |
| 243 | UT-GB-034 | gbp_insight_get | D: locationId未指定 |
| 244 | UT-GB-035 | gbp_media_upload | A: 正常アップロード |
| 245 | UT-GB-036 | gbp_media_upload | B: 401エラー |
| 246 | UT-GB-037 | gbp_media_upload | D: mediaUrl未指定 |
| 247 | UT-GB-038 | gbp_media_upload | A: カテゴリ指定（INTERIOR, EXTERIOR） |
| 248-249 | UT-GB-039〜040 | 各ツール | C: 429補完 |

#### 2.2.4 X Ads ツール（48件）

| # | テストID | ツール | パターン |
|---|---|---|---|
| 250 | UT-XA-001 | x_ads_account_list | A: 正常取得 |
| 251 | UT-XA-002 | x_ads_account_list | B: 401エラー |
| 252 | UT-XA-003 | x_ads_account_list | C: 429エラー |
| 253 | UT-XA-004 | x_ads_campaign_list | A: 正常取得 |
| 254 | UT-XA-005 | x_ads_campaign_list | B: 401エラー |
| 255 | UT-XA-006 | x_ads_campaign_list | C: 429エラー |
| 256 | UT-XA-007 | x_ads_campaign_list | A: funding_instrument_idフィルタ |
| 257 | UT-XA-008 | x_ads_campaign_create | A: 正常作成 |
| 258 | UT-XA-009 | x_ads_campaign_create | B: 401エラー |
| 259 | UT-XA-010 | x_ads_campaign_create | D: name未指定 |
| 260 | UT-XA-011 | x_ads_campaign_create | D: funding_instrument_id未指定 |
| 261 | UT-XA-012 | x_ads_campaign_update | A: 正常更新 |
| 262 | UT-XA-013 | x_ads_campaign_update | B: 401エラー |
| 263 | UT-XA-014 | x_ads_campaign_update | A: entity_status変更 |
| 264 | UT-XA-015 | x_ads_lineitem_list | A: 正常取得 |
| 265 | UT-XA-016 | x_ads_lineitem_list | B: 401エラー |
| 266 | UT-XA-017 | x_ads_lineitem_list | C: 429エラー |
| 267 | UT-XA-018 | x_ads_lineitem_list | A: campaign_idsフィルタ |
| 268 | UT-XA-019 | x_ads_lineitem_create | A: 正常作成 |
| 269 | UT-XA-020 | x_ads_lineitem_create | B: 401エラー |
| 270 | UT-XA-021 | x_ads_lineitem_create | D: campaign_id未指定 |
| 271 | UT-XA-022 | x_ads_lineitem_create | A: 自動入札指定 |
| 272 | UT-XA-023 | x_ads_lineitem_update | A: 正常更新 |
| 273 | UT-XA-024 | x_ads_lineitem_update | B: 401エラー |
| 274 | UT-XA-025 | x_ads_creative_list | A: 正常取得 |
| 275 | UT-XA-026 | x_ads_creative_list | B: 401エラー |
| 276 | UT-XA-027 | x_ads_creative_list | C: 429エラー |
| 277 | UT-XA-028 | x_ads_creative_create | A: 正常作成 |
| 278 | UT-XA-029 | x_ads_creative_create | B: 401エラー |
| 279 | UT-XA-030 | x_ads_creative_create | D: tweet_id未指定 |
| 280 | UT-XA-031 | x_ads_targeting_list | A: 正常取得 |
| 281 | UT-XA-032 | x_ads_targeting_list | B: 401エラー |
| 282 | UT-XA-033 | x_ads_targeting_list | A: line_item_idsフィルタ |
| 283 | UT-XA-034 | x_ads_targeting_create | A: 地域ターゲティング追加 |
| 284 | UT-XA-035 | x_ads_targeting_create | A: 年齢ターゲティング追加 |
| 285 | UT-XA-036 | x_ads_targeting_create | B: 401エラー |
| 286 | UT-XA-037 | x_ads_targeting_create | D: line_item_id未指定 |
| 287 | UT-XA-038 | x_ads_analytics | A: キャンペーンレベル分析取得 |
| 288 | UT-XA-039 | x_ads_analytics | A: ラインアイテムレベル分析取得 |
| 289 | UT-XA-040 | x_ads_analytics | B: 401エラー |
| 290 | UT-XA-041 | x_ads_analytics | C: 429エラー |
| 291 | UT-XA-042 | x_ads_analytics | A: 日別ブレークダウン |
| 292-321 | UT-XA-043〜048 + 予備 | 各ツール | 残り補完（パターンCの網羅・境界値） |

---

## 3. 2ツール結合テスト (IT2) — 200件

### 3.1 テスト方針

2つのツールを順序実行し、**1つ目の出力を2つ目の入力に使う**連携を検証する。全テストは MCP JSON-RPC プロトコルで `tools/call` を2回連続実行する。

### 3.2 パターン分類

| パターン | 説明 | 件数 |
|---|---|---|
| List→Get | 一覧取得 → IDで詳細取得 | 30 |
| Create→List | 作成 → 一覧で存在確認 | 30 |
| Create→Get | 作成 → IDで詳細取得 | 25 |
| Create→Update | 作成 → 更新 | 25 |
| Create→Delete | 作成 → 削除 | 10 |
| Report→Report | 同プラットフォーム内の別レポート比較 | 15 |
| 横断Read | 異なるプラットフォームの同種データ取得・比較 | 30 |
| 依存Create | 前提リソース作成 → 子リソース作成 | 20 |
| Status→Action | ステータス確認 → 対応アクション | 15 |

### 3.3 テストケース一覧

#### 3.3.1 Google Ads 同一プラットフォーム（50件）

| # | テストID | ツール1 → ツール2 | シナリオ |
|---|---|---|---|
| 1 | IT2-GA-001 | campaign_list → campaign_get | 一覧から最初のキャンペーンIDを取得し詳細取得 |
| 2 | IT2-GA-002 | adgroup_list → adgroup_update | 一覧から広告グループ取得し名前変更 |
| 3 | IT2-GA-003 | budget_create → campaign_create | 予算作成 → そのリソース名でキャンペーン作成 |
| 4 | IT2-GA-004 | campaign_create → campaign_list | キャンペーン作成 → 一覧に含まれるか確認 |
| 5 | IT2-GA-005 | campaign_create → campaign_update | キャンペーン作成(PAUSED) → ENABLED に変更 |
| 6 | IT2-GA-006 | campaign_create → adgroup_create | キャンペーン作成 → そのIDで広告グループ作成 |
| 7 | IT2-GA-007 | adgroup_create → ad_create | 広告グループ作成 → そのIDで広告作成 |
| 8 | IT2-GA-008 | adgroup_create → keyword_add | 広告グループ作成 → そのIDでキーワード追加 |
| 9 | IT2-GA-009 | keyword_add → keyword_list | キーワード追加 → 一覧に含まれるか確認 |
| 10 | IT2-GA-010 | keyword_add → keyword_remove | キーワード追加 → 削除 |
| 11 | IT2-GA-011 | ad_create → ad_policy_status | 広告作成 → 審査ステータス確認 |
| 12 | IT2-GA-012 | ad_policy_status → ad_update | 審査DISAPPROVED確認 → 広告修正（PAUSED） |
| 13 | IT2-GA-013 | campaign_list → report_campaign | キャンペーン一覧 → そのIDでレポート取得 |
| 14 | IT2-GA-014 | report_campaign → report_keyword | キャンペーンレポート → 同キャンペーンのキーワードレポート |
| 15 | IT2-GA-015 | budget_create → budget_update | 予算作成(1000円) → 2000円に変更 |
| 16 | IT2-GA-016 | budget_list → budget_update | 予算一覧 → 最初の予算を更新 |
| 17 | IT2-GA-017 | account_list → campaign_list | アカウント一覧 → 最初のアカウントのキャンペーン一覧 |
| 18 | IT2-GA-018 | campaign_get → campaign_update | キャンペーン詳細取得 → 入札戦略変更 |
| 19 | IT2-GA-019 | ad_list → ad_update | 広告一覧 → 最初の広告をPAUSED |
| 20 | IT2-GA-020 | ad_list → ad_policy_status | 広告一覧 → 全広告の審査ステータス確認 |
| 21-50 | IT2-GA-021〜050 | 上記パターンの変形 | パラメータ変更・エラー混在・空結果ケース |

#### 3.3.2 Meta Ads 同一プラットフォーム（50件）

| # | テストID | ツール1 → ツール2 | シナリオ |
|---|---|---|---|
| 51 | IT2-MA-001 | campaign_list → campaign_get | 一覧 → 詳細取得 |
| 52 | IT2-MA-002 | campaign_create → adset_create | キャンペーン作成 → そのIDで広告セット作成 |
| 53 | IT2-MA-003 | adset_create → ad_create | 広告セット作成 → そのIDで広告作成 |
| 54 | IT2-MA-004 | image_upload → creative_create | 画像アップロード → image_hashでクリエイティブ作成 |
| 55 | IT2-MA-005 | creative_create → ad_create | クリエイティブ作成 → そのIDで広告作成 |
| 56 | IT2-MA-006 | ad_create → ad_review_status | 広告作成 → 審査ステータス確認 |
| 57 | IT2-MA-007 | ad_review_status → ad_update | REJECTED確認 → 広告修正 |
| 58 | IT2-MA-008 | campaign_list → insight_campaign | キャンペーン一覧 → インサイト取得 |
| 59 | IT2-MA-009 | adset_list → insight_adset | 広告セット一覧 → インサイト取得 |
| 60 | IT2-MA-010 | ad_list → insight_ad | 広告一覧 → インサイト取得 |
| 61 | IT2-MA-011 | campaign_create → campaign_update | 作成 → PAUSED に変更 |
| 62 | IT2-MA-012 | adset_get → adset_update | 詳細取得 → 予算変更 |
| 63 | IT2-MA-013 | audience_list → adset_create | オーディエンス取得 → ターゲティングに指定 |
| 64 | IT2-MA-014 | creative_list → ad_create | クリエイティブ一覧 → 既存クリエイティブで広告作成 |
| 65 | IT2-MA-015 | insight_campaign → campaign_update | インサイト確認 → 予算調整 |
| 66-100 | IT2-MA-016〜050 | 上記パターンの変形 | パラメータ変更・ページネーション・fields指定変更 |

#### 3.3.3 GBP 同一プラットフォーム（30件）

| # | テストID | ツール1 → ツール2 | シナリオ |
|---|---|---|---|
| 101 | IT2-GB-001 | location_list → location_get | 店舗一覧 → 詳細取得 |
| 102 | IT2-GB-002 | location_list → review_list | 店舗一覧 → 口コミ一覧取得 |
| 103 | IT2-GB-003 | review_list → review_reply | 口コミ一覧 → 最初の口コミに返信 |
| 104 | IT2-GB-004 | location_list → post_create | 店舗一覧 → 最初の店舗に投稿作成 |
| 105 | IT2-GB-005 | post_create → post_delete | 投稿作成 → 削除 |
| 106 | IT2-GB-006 | post_create → post_list | 投稿作成 → 一覧で確認 |
| 107 | IT2-GB-007 | location_get → location_update | 店舗詳細 → 営業時間更新 |
| 108 | IT2-GB-008 | location_list → insight_get | 店舗一覧 → インサイト取得 |
| 109 | IT2-GB-009 | location_list → media_upload | 店舗一覧 → 写真アップロード |
| 110 | IT2-GB-010 | location_get → post_create | 店舗詳細(住所確認) → 住所入り投稿作成 |
| 111-130 | IT2-GB-011〜030 | 上記パターンの変形 | 複数店舗・ページネーション・エラー混在 |

#### 3.3.4 X Ads 同一プラットフォーム（30件）

| # | テストID | ツール1 → ツール2 | シナリオ |
|---|---|---|---|
| 131 | IT2-XA-001 | account_list → campaign_list | アカウント一覧 → キャンペーン一覧 |
| 132 | IT2-XA-002 | campaign_create → lineitem_create | キャンペーン作成 → ラインアイテム作成 |
| 133 | IT2-XA-003 | lineitem_create → targeting_create | ラインアイテム作成 → ターゲティング追加 |
| 134 | IT2-XA-004 | lineitem_create → creative_create | ラインアイテム作成 → クリエイティブ紐付け |
| 135 | IT2-XA-005 | campaign_list → analytics | キャンペーン一覧 → アナリティクス取得 |
| 136 | IT2-XA-006 | campaign_create → campaign_update | 作成 → PAUSED に変更 |
| 137 | IT2-XA-007 | lineitem_list → lineitem_update | 一覧 → 入札金額変更 |
| 138 | IT2-XA-008 | targeting_list → targeting_create | 既存ターゲティング確認 → 追加 |
| 139 | IT2-XA-009 | creative_list → analytics | クリエイティブ一覧 → クリエイティブ別分析 |
| 140 | IT2-XA-010 | campaign_update → analytics | ステータス変更 → 変更後の効果確認 |
| 141-160 | IT2-XA-011〜030 | 上記パターンの変形 | パラメータ変更・エラー混在 |

#### 3.3.5 横断プラットフォーム（40件）

| # | テストID | ツール1 → ツール2 | シナリオ |
|---|---|---|---|
| 161 | IT2-CR-001 | google_ads_report_campaign → meta_ads_insight_campaign | Google Ads vs Meta Ads パフォーマンス比較 |
| 162 | IT2-CR-002 | google_ads_campaign_list → meta_ads_campaign_list | 両プラットフォームのキャンペーン一覧比較 |
| 163 | IT2-CR-003 | google_ads_ad_policy_status → meta_ads_ad_review_status | 審査ステータス横断確認 |
| 164 | IT2-CR-004 | google_ads_campaign_list → x_ads_campaign_list | Google vs X キャンペーン比較 |
| 165 | IT2-CR-005 | meta_ads_campaign_list → x_ads_campaign_list | Meta vs X キャンペーン比較 |
| 166 | IT2-CR-006 | google_ads_report_campaign → x_ads_analytics | Google vs X アナリティクス比較 |
| 167 | IT2-CR-007 | gbp_location_list → google_ads_campaign_list | 店舗一覧 → その地域のGoogle Ads確認 |
| 168 | IT2-CR-008 | gbp_review_list → meta_ads_campaign_list | 口コミ確認 → Meta広告との相関 |
| 169 | IT2-CR-009 | gbp_insight_get → google_ads_report_campaign | GBPインサイト → Google Adsレポート相関 |
| 170 | IT2-CR-010 | meta_ads_insight_campaign → x_ads_analytics | Meta vs X インサイト比較 |
| 171-200 | IT2-CR-011〜040 | 上記パターンの変形 | 異なる期間・フィルタ条件・エラー片方のみ |

---

## 4. 3ツール以上結合テスト (IT3) — 400件

### 4.1 テスト方針

**実際の広告運用フロー**を再現する。3つ以上のツールを連鎖実行し、出力→入力の受け渡しと最終的なデータ整合性を検証する。

### 4.2 パターン分類

| パターン | ツール数 | 説明 | 件数 |
|---|---|---|---|
| フルキャンペーン構築 | 3〜5 | 予算→キャンペーン→広告グループ→広告の一連作成 | 80 |
| フル広告作成フロー | 3〜4 | 画像アップロード→クリエイティブ→広告作成→審査確認 | 60 |
| 分析→最適化フロー | 3〜4 | レポート取得→分析→パラメータ調整→再確認 | 60 |
| 横断運用フロー | 3〜5 | 複数プラットフォームにまたがる運用シナリオ | 80 |
| GBP+広告連携 | 3〜4 | 店舗情報→口コミ対応→広告調整 | 40 |
| 審査対応フロー | 3〜4 | 広告作成→審査確認→修正→再確認 | 40 |
| エラーリカバリ | 3〜4 | 途中エラー発生時の後続処理 | 40 |

### 4.3 テストケース一覧

#### 4.3.1 Google Ads フルキャンペーン構築（40件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 1 | IT3-GA-001 | budget_create → campaign_create → adgroup_create | 予算→キャンペーン→広告グループの3段階作成 |
| 2 | IT3-GA-002 | budget_create → campaign_create → adgroup_create → ad_create | 4段階フル作成 |
| 3 | IT3-GA-003 | budget_create → campaign_create → adgroup_create → keyword_add | キーワード付き広告グループ作成 |
| 4 | IT3-GA-004 | budget_create → campaign_create → adgroup_create → ad_create → ad_policy_status | 5段階: 作成→審査確認 |
| 5 | IT3-GA-005 | campaign_list → campaign_get → campaign_update | 一覧→詳細→更新の読み取り→書き込みフロー |
| 6 | IT3-GA-006 | campaign_list → report_campaign → campaign_update | レポート→パフォーマンスに基づく予算調整 |
| 7 | IT3-GA-007 | adgroup_list → keyword_list → keyword_add | 既存キーワード確認→追加 |
| 8 | IT3-GA-008 | adgroup_list → keyword_list → keyword_remove | 既存キーワード確認→低パフォーマンスキーワード削除 |
| 9 | IT3-GA-009 | budget_create → campaign_create → report_campaign | 作成→即座にレポート取得（データなし確認） |
| 10 | IT3-GA-010 | account_list → campaign_list → report_campaign | アカウント選択→キャンペーン選択→レポート |
| 11-40 | IT3-GA-011〜040 | 上記パターンの変形 | SEARCH/DISPLAY/VIDEO切替、入札戦略変更、日付範囲変更、PAUSED↔ENABLED切替、エラー混在 |

#### 4.3.2 Meta Ads フル広告作成フロー（40件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 41 | IT3-MA-001 | campaign_create → adset_create → ad_create | 3段階フル作成 |
| 42 | IT3-MA-002 | image_upload → creative_create → ad_create | 画像→クリエイティブ→広告 |
| 43 | IT3-MA-003 | campaign_create → adset_create → ad_create → ad_review_status | 4段階: 作成→審査確認 |
| 44 | IT3-MA-004 | image_upload → creative_create → ad_create → ad_review_status | 画像から審査確認まで |
| 45 | IT3-MA-005 | audience_list → adset_create → ad_create | オーディエンス活用の広告作成 |
| 46 | IT3-MA-006 | campaign_create → adset_create → insight_adset | 作成→インサイト取得 |
| 47 | IT3-MA-007 | campaign_list → insight_campaign → campaign_update | レポート→予算調整 |
| 48 | IT3-MA-008 | ad_list → ad_review_status → ad_update | 広告一覧→審査確認→修正 |
| 49 | IT3-MA-009 | ad_review_status → ad_update → ad_review_status | 審査→修正→再審査確認 |
| 50 | IT3-MA-010 | creative_list → ad_create → insight_ad | 既存クリエイティブ→広告作成→インサイト |
| 51-80 | IT3-MA-011〜040 | 上記パターンの変形 | REACH/CONVERSIONS/TRAFFIC目的切替、ターゲティング変更、breakdowns変更 |

#### 4.3.3 GBP + 広告連携フロー（40件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 81 | IT3-GB-001 | location_list → review_list → review_reply | 店舗選択→口コミ確認→返信 |
| 82 | IT3-GB-002 | location_list → location_get → location_update | 店舗選択→詳細確認→営業時間更新 |
| 83 | IT3-GB-003 | location_list → post_create → post_list | 店舗→投稿作成→一覧確認 |
| 84 | IT3-GB-004 | location_list → media_upload → post_create | 店舗→写真アップ→写真付き投稿 |
| 85 | IT3-GB-005 | location_list → insight_get → google_ads_report_campaign | GBPインサイト→Google Adsレポート相関分析 |
| 86 | IT3-GB-006 | location_list → review_list → meta_ads_campaign_list | 口コミ評価→それに合わせたMeta広告確認 |
| 87 | IT3-GB-007 | gbp_insight_get → google_ads_campaign_list → google_ads_campaign_update | GBP来店数→Google Ads予算調整 |
| 88 | IT3-GB-008 | location_list → location_get → post_create → post_list | 店舗確認→投稿→確認の4段階 |
| 89-120 | IT3-GB-009〜040 | 上記パターンの変形 | 複数店舗ループ、星評価フィルタ、投稿タイプ変更 |

#### 4.3.4 X Ads フルキャンペーン構築（40件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 121 | IT3-XA-001 | campaign_create → lineitem_create → targeting_create | キャンペーン→ラインアイテム→ターゲティング |
| 122 | IT3-XA-002 | campaign_create → lineitem_create → creative_create | キャンペーン→ラインアイテム→クリエイティブ |
| 123 | IT3-XA-003 | campaign_create → lineitem_create → targeting_create → creative_create | 4段階フル作成 |
| 124 | IT3-XA-004 | campaign_list → analytics → campaign_update | レポート→最適化 |
| 125 | IT3-XA-005 | account_list → campaign_create → lineitem_create | アカウント選択→フル作成 |
| 126-160 | IT3-XA-006〜040 | 上記パターンの変形 | objective変更、入札戦略変更、ターゲティング組合せ |

#### 4.3.5 横断プラットフォーム運用フロー（80件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 161 | IT3-CR-001 | google_ads_campaign_create → meta_ads_campaign_create → x_ads_campaign_create | 3プラットフォーム同時キャンペーン作成 |
| 162 | IT3-CR-002 | google_ads_report → meta_ads_insight → x_ads_analytics | 3プラットフォーム横断レポート |
| 163 | IT3-CR-003 | google_ads_report → meta_ads_insight → campaign_update(最高ROASのみ予算増) | レポート→最適配分 |
| 164 | IT3-CR-004 | google_ads_policy_status → meta_ads_review_status → 修正対象特定 | 横断審査チェック |
| 165 | IT3-CR-005 | gbp_location_list → google_ads_campaign_create → meta_ads_campaign_create | 店舗情報ベースの広告作成 |
| 166 | IT3-CR-006 | gbp_review_list → google_ads_keyword_add → meta_ads_adset_create | 口コミ分析→キーワード追加→Meta広告ターゲティング |
| 167 | IT3-CR-007 | google_ads_report → google_ads_campaign_update → meta_ads_campaign_update | 横断予算再配分 |
| 168 | IT3-CR-008 | gbp_insight → google_ads_report → meta_ads_insight → x_ads_analytics | 4プラットフォーム統合レポート |
| 169 | IT3-CR-009 | google_ads_budget_create → google_ads_campaign_create → google_ads_adgroup_create → google_ads_ad_create → google_ads_ad_policy_status | 5段階Google Adsフル構築 |
| 170 | IT3-CR-010 | meta_ads_image_upload → meta_ads_creative_create → meta_ads_campaign_create → meta_ads_adset_create → meta_ads_ad_create | 5段階Metaフル構築 |
| 171-240 | IT3-CR-011〜080 | 上記パターンの大量変形 | 地域・業種・予算規模・目的・期間の組合せ |

#### 4.3.6 審査対応・エラーリカバリフロー（80件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 241 | IT3-ER-001 | ad_create → policy_status(DISAPPROVED) → ad_update → policy_status | 審査→リジェクト→修正→再審査 |
| 242 | IT3-ER-002 | meta_ad_create → review_status(REJECTED) → ad_update → review_status | Meta版の審査対応フロー |
| 243 | IT3-ER-003 | budget_create(失敗) → エラー確認 → budget_create(成功) → campaign_create | エラーリカバリ後の継続 |
| 244 | IT3-ER-004 | campaign_create → adgroup_create(429エラー) → リトライ → ad_create | レート制限からのリカバリ |
| 245 | IT3-ER-005 | google_ads_campaign_create → meta_ads_campaign_create(失敗) → meta_ads_campaign_create(成功) | 横断作成でMeta側だけ失敗→リカバリ |
| 246-320 | IT3-ER-006〜080 | 上記パターンの変形 | 各プラットフォーム×各エラーコード×リカバリパターン |

#### 4.3.7 実運用シナリオ再現（80件）

| # | テストID | フロー | シナリオ |
|---|---|---|---|
| 321 | IT3-SC-001 | 「浦和店の新メニューをInstagramで宣伝」 | gbp_location_get(浦和) → meta_image_upload → meta_creative_create → meta_campaign_create → meta_adset_create(浦和周辺ターゲット) → meta_ad_create |
| 322 | IT3-SC-002 | 「全店舗の口コミに返信」 | gbp_location_list → (各店舗) gbp_review_list → gbp_review_reply のループ |
| 323 | IT3-SC-003 | 「今月の広告費を全プラットフォームで確認」 | google_ads_report → meta_ads_insight → x_ads_analytics の3つ取得 |
| 324 | IT3-SC-004 | 「Google Adsのリスティング広告を新規作成して出稿」 | budget_create → campaign_create(SEARCH) → adgroup_create → keyword_add × 5 → ad_create → ad_policy_status |
| 325 | IT3-SC-005 | 「パフォーマンス悪いキャンペーンを停止」 | report_campaign → 低ROAS特定 → campaign_update(PAUSED) |
| 326 | IT3-SC-006 | 「Xで期間限定キャンペーンを作成」 | x_campaign_create → x_lineitem_create → x_targeting_create(地域) → x_creative_create |
| 327 | IT3-SC-007 | 「Googleマップの写真を更新して投稿も出す」 | gbp_location_list → gbp_media_upload → gbp_post_create |
| 328 | IT3-SC-008 | 「審査落ちした広告を全部確認して修正」 | google_ads_policy_status → meta_review_status → 各リジェクト広告をupdate |
| 329-400 | IT3-SC-009〜080 | Revol実運用想定シナリオ | 季節キャンペーン、新店オープン、スタッフ募集、セミナー告知等 |

---

## 5. テスト実装設計

### 5.1 テストヘルパー

```typescript
// tests/helpers/mcp-client.ts

import { registerAllTools } from "@/lib/mcp/server";

/**
 * テスト用MCPツール呼び出しヘルパー
 * 実際のMCP JSON-RPCプロトコルを模倣して、ツールを直接呼び出す
 */
export async function callTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  // McpServerインスタンスを作成しツール登録
  // ツールハンドラーを直接呼び出し
}

/**
 * 2ツール結合テスト用: 1つ目の出力からIDを抽出して2つ目に渡す
 */
export async function chainTools(
  steps: Array<{
    tool: string;
    args: Record<string, unknown> | ((prevResult: unknown) => Record<string, unknown>);
  }>
): Promise<unknown[]> {
  const results: unknown[] = [];
  for (const step of steps) {
    const args = typeof step.args === "function"
      ? step.args(results[results.length - 1])
      : step.args;
    const result = await callTool(step.tool, args);
    results.push(result);
  }
  return results;
}
```

### 5.2 モック設計

```typescript
// tests/mocks/handlers/google-ads.ts
import { http, HttpResponse } from "msw";

export const googleAdsHandlers = [
  // OAuth2 トークンリフレッシュ
  http.post("https://oauth2.googleapis.com/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      expires_in: 3600,
      token_type: "Bearer",
    });
  }),

  // searchStream
  http.post(
    "https://googleads.googleapis.com/v23/customers/:customerId/googleAds:searchStream",
    async ({ request }) => {
      const body = await request.json();
      // GAQLクエリに応じてフィクスチャを返す
      return HttpResponse.json([{ results: [...mockData] }]);
    }
  ),

  // mutate
  http.post(
    "https://googleads.googleapis.com/v23/customers/:customerId/:service",
    () => {
      return HttpResponse.json({ results: [{ resourceName: "customers/123/campaigns/456" }] });
    }
  ),
];
```

### 5.3 テスト実行コマンド

```bash
# 全テスト実行
npm test

# 単体テストのみ
npm test -- --dir tests/unit

# 結合テスト (IT2)
npm test -- --dir tests/integration/it2

# 結合テスト (IT3)
npm test -- --dir tests/integration/it3

# 特定プラットフォームのみ
npm test -- --dir tests/unit/tools/google-ads
npm test -- --dir tests/integration/it2/meta-ads

# カバレッジレポート
npm test -- --coverage
```

### 5.4 CI/CD パイプライン

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test -- --coverage
      - name: Coverage threshold check
        run: |
          # 全体カバレッジ 90% 以上を要求
          npx vitest run --coverage --coverage.thresholds.lines=90
```

---

## 6. 合格基準

| 指標 | 基準 |
|---|---|
| 単体テスト合格率 | 100% (321/321) |
| IT2 結合テスト合格率 | 100% (200/200) |
| IT3 結合テスト合格率 | 100% (400/400) |
| コードカバレッジ (Line) | 90% 以上 |
| コードカバレッジ (Branch) | 85% 以上 |
| 全テスト実行時間 | 120秒以内 |
