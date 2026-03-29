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

## ドキュメント

- [企画要件定義書](docs/requirements.md)
- [基本設計・詳細設計書](docs/design.md)
- [Claude Code 開発ガイド](CLAUDE.md)

## ライセンス

MIT
