# ad-ops-mcp

Claude.ai / Claude Code から Google Ads・Meta Ads (Facebook/Instagram)・Google Business Profile・X (Twitter) Ads を直接操作するための MCP (Model Context Protocol) サーバー。

**広告運用代理店に支払う手数料（広告費の20%）をゼロにする。**

## コンセプト

[hubspot-ma-mcp](https://github.com/DaisukeHori/hubspot-ma-mcp) と同じアーキテクチャで、4つの広告プラットフォームのAPIを統合。Claude が広告運用担当者として、キャンペーン作成・予算管理・パフォーマンス分析・審査対応・最適化を全自動で行う。

## 対応プラットフォーム

| プラットフォーム | ツール数 | 主要機能 |
|---|---|---|
| Google Ads | 20 | 検索広告・ディスプレイ・YouTube・キーワード・予算・レポート |
| Meta Ads | 20 | Facebook/Instagram広告・クリエイティブ・インサイト・審査ステータス |
| Google Business Profile | 10 | 店舗情報・口コミ管理・投稿・インサイト |
| X (Twitter) Ads | 12 | プロモ広告・ターゲティング・アナリティクス |
| **合計** | **62** | |

## アーキテクチャ

```
Claude.ai ──(MCP/HTTPS)──▶ Vercel (Next.js 15)
                              ├── Google Ads REST API
                              ├── Meta Marketing API
                              ├── Google Business Profile API
                              └── X Ads API
```

## セットアップ

### 1. クローン & インストール

```bash
git clone https://github.com/DaisukeHori/ad-ops-mcp.git
cd ad-ops-mcp
npm install
```

### 2. 環境変数設定

```bash
cp .env.example .env
# 各プラットフォームのAPIキー・トークンを設定
```

### 3. ローカル起動

```bash
npm run dev
# http://localhost:3000/api/mcp でMCPサーバーが起動
```

### 4. Vercel デプロイ

```bash
vercel --prod
# または GitHub push で自動デプロイ
```

### 5. Claude.ai に接続

MCP サーバー URL を Claude.ai の設定に追加:
```
https://ad-ops-mcp.vercel.app/api/mcp?key={MCP_API_KEY}
```

## 必要なAPIキー取得手順

| プラットフォーム | 取得場所 | 所要時間 |
|---|---|---|
| Google Ads | [API Center](https://ads.google.com/aw/apicenter) + [Google Cloud Console](https://console.cloud.google.com) | 1〜2日 |
| Meta Ads | [Meta for Developers](https://developers.facebook.com) | 30分 |
| Google Business Profile | [Google Cloud Console](https://console.cloud.google.com) | 15分 |
| X Ads | [X Developer Portal](https://developer.x.com) + [ads.x.com/help](https://ads.x.com/help) | 数日〜数週間 |

詳細は [docs/requirements.md](docs/requirements.md) のセクション4を参照。

## テスト

921件の自動テスト（Vitest + msw）で品質を担保。外部APIは一切叩かない。

```bash
npm test                    # 全921件実行
npm test -- --coverage      # カバレッジ付き
```

| レベル | 件数 |
|---|---|
| 単体テスト | 321件 |
| 2ツール結合テスト | 200件 |
| 3ツール以上結合テスト | 400件 |

詳細は [テスト計画書](docs/test-plan.md) 参照。

## ドキュメント

- [企画要件定義書](docs/requirements.md)
- [基本設計・詳細設計書](docs/design.md)
- [テスト計画書](docs/test-plan.md)
- [Claude Code 開発ガイド](CLAUDE.md)

## ライセンス

MIT

---

## 関連 MCP サーバー

堀が公開している MCP サーバー群。すべて Claude.ai / Cursor / ChatGPT 等の MCP クライアントから利用可能。

| サーバー | ツール数 | 説明 |
|:--|:--:|:--|
| **[b2cloud-api](https://github.com/DaisukeHori/b2cloud-api)** | 14 | ヤマト B2クラウド送り状発行 API/MCP |
| **[cloudflare-mcp](https://github.com/DaisukeHori/cloudflare-mcp)** | 69 | Cloudflare 統合（Tunnel/DNS/Workers/Pages/R2/KV/SSL/Access） |
| **[hubspot-ma-mcp](https://github.com/DaisukeHori/hubspot-ma-mcp)** | 128 | HubSpot MA（CRM/Marketing/Knowledge Store） |
| **[msgraph-mcp-server](https://github.com/DaisukeHori/msgraph-mcp-server)** | 48 | Microsoft Graph API（Exchange/Teams/OneDrive/SharePoint） |
| **[playwright-devtools-mcp](https://github.com/DaisukeHori/playwright-devtools-mcp)** | 57 | Playwright + Chrome DevTools（ブラウザ自動化） |
| **[proxmox-mcp-server](https://github.com/DaisukeHori/proxmox-mcp-server)** | 35 | Proxmox VE 仮想化基盤操作 |
| **[printer-mcp-server](https://github.com/DaisukeHori/printer-mcp-server)** | — | CUPS ネットワークプリンタ制御（Kyocera TASKalfa） |
| **[yamato-printer-mcp-server](https://github.com/DaisukeHori/yamato-printer-mcp-server)** | — | ヤマト送り状サーマルプリンタ（ラズパイ + WS-420B） |
| **[ssh-mcp-server](https://github.com/DaisukeHori/ssh-mcp-server)** | 10 | SSH クライアント（セッション管理/非同期コマンド） |
| **[mac-remote-mcp](https://github.com/DaisukeHori/mac-remote-mcp)** | 34 | macOS リモート制御（Shell/GUI/ファイル/アプリ） |
| **[gemini-image-mcp](https://github.com/DaisukeHori/gemini-image-mcp)** | 4 | Gemini/Imagen 画像生成 |
| **[runpod-mcp](https://github.com/DaisukeHori/runpod-mcp)** | 36 | RunPod GPU FaaS（Pods/Endpoints/Jobs） |
| **[firecrawl-mcp](https://github.com/DaisukeHori/firecrawl-mcp)** | — | Firecrawl セルフホスト Web スクレイピング |
| **ad-ops-mcp** ← 今ここ | 62 | 広告運用自動化（Google Ads/Meta/GBP/X） |
