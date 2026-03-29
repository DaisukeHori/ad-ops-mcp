/**
 * IT3 Google Ads キャンペーンビルドテスト
 * IT3-GA-001 〜 IT3-GA-040（40件）
 *
 * 3ツール以上の連鎖実行による Google Ads キャンペーン構築フローのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  callTool,
  chainTools,
  extractText,
  extractJson,
  extractResourceId,
} from "@/tests/helpers/mcp-client";
import { clearTokenCache } from "@/lib/platforms/google-ads/auth";

const ENV_DEFAULTS: Record<string, string> = {
  GOOGLE_ADS_CLIENT_ID: "test-client-id",
  GOOGLE_ADS_CLIENT_SECRET: "test-client-secret",
  GOOGLE_ADS_REFRESH_TOKEN: "test-refresh-token",
  GOOGLE_ADS_DEVELOPER_TOKEN: "test-dev-token",
  GOOGLE_ADS_CUSTOMER_ID: "1234567890",
};

describe("IT3 Google Ads キャンペーンビルド", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...ENV_DEFAULTS };
    clearTokenCache();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ===========================================================================
  // IT3-GA-001: budget_create → campaign_create → adgroup_create (基本ファネル)
  // ===========================================================================
  it("IT3-GA-001: 予算作成 → キャンペーン作成 → 広告グループ作成（基本ファネル）", async () => {
    const r1 = await callTool("google_ads_budget_create", {
      name: "テスト予算",
      amountMicros: 1000000000,
    });
    expect(r1.isError).toBeUndefined();
    const t1 = extractText(r1);
    expect(t1).toBeTruthy();

    const r2 = await callTool("google_ads_campaign_create", {
      name: "テストキャンペーン",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r2.isError).toBeUndefined();
    const t2 = extractText(r2);
    expect(t2).toBeTruthy();

    const r3 = await callTool("google_ads_adgroup_create", {
      campaignResourceName: "customers/1234567890/campaigns/123456",
      name: "テスト広告グループ",
      cpcBidMicros: 100000000,
    });
    expect(r3.isError).toBeUndefined();
    const t3 = extractText(r3);
    expect(t3).toBeTruthy();
  });

  // ===========================================================================
  // IT3-GA-002: budget_create → campaign_create → campaign_update (作成して変更)
  // ===========================================================================
  it("IT3-GA-002: 予算作成 → キャンペーン作成 → キャンペーン更新", async () => {
    const r1 = await callTool("google_ads_budget_create", {
      name: "更新テスト予算",
      amountMicros: 2000000000,
    });
    expect(r1.isError).toBeUndefined();

    const r2 = await callTool("google_ads_campaign_create", {
      name: "更新テストキャンペーン",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r2.isError).toBeUndefined();

    const r3 = await callTool("google_ads_campaign_update", {
      campaignId: "123456",
      name: "更新後キャンペーン名",
      status: "PAUSED",
    });
    expect(r3.isError).toBeUndefined();
    const t3 = extractText(r3);
    expect(t3).toBeTruthy();
  });

  // ===========================================================================
  // IT3-GA-003: campaign_create → adgroup_create → ad_create (広告作成フロー)
  // ===========================================================================
  it("IT3-GA-003: キャンペーン作成 → 広告グループ作成 → 広告作成", async () => {
    const r1 = await callTool("google_ads_campaign_create", {
      name: "広告作成フローキャンペーン",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r1.isError).toBeUndefined();

    const r2 = await callTool("google_ads_adgroup_create", {
      campaignResourceName: "customers/1234567890/campaigns/123456",
      name: "広告作成フロー広告グループ",
      cpcBidMicros: 50000000,
    });
    expect(r2.isError).toBeUndefined();

    const r3 = await callTool("google_ads_ad_create", {
      adGroupResourceName: "customers/1234567890/adGroups/123456",
      headlines: [
        { text: "テスト見出し1" },
        { text: "テスト見出し2" },
        { text: "テスト見出し3" },
      ],
      descriptions: [
        { text: "テスト説明文1" },
        { text: "テスト説明文2" },
      ],
      finalUrls: ["https://example.com"],
    });
    expect(r3.isError).toBeUndefined();
    const t3 = extractText(r3);
    expect(t3).toBeTruthy();
  });

  // ===========================================================================
  // IT3-GA-004: campaign_create → adgroup_create → keyword_add (キーワード設定)
  // ===========================================================================
  it("IT3-GA-004: キャンペーン作成 → 広告グループ作成 → キーワード追加", async () => {
    const r1 = await callTool("google_ads_campaign_create", {
      name: "KWフローキャンペーン",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r1.isError).toBeUndefined();

    const r2 = await callTool("google_ads_adgroup_create", {
      campaignResourceName: "customers/1234567890/campaigns/123456",
      name: "KWフロー広告グループ",
      cpcBidMicros: 80000000,
    });
    expect(r2.isError).toBeUndefined();

    const r3 = await callTool("google_ads_keyword_add", {
      adGroupResourceName: "customers/1234567890/adGroups/123456",
      keywords: [
        { text: "テストキーワード", matchType: "EXACT", cpcBidMicros: 50000000 },
        { text: "広告テスト", matchType: "PHRASE", cpcBidMicros: 40000000 },
      ],
    });
    expect(r3.isError).toBeUndefined();
    const t3 = extractText(r3);
    expect(t3).toBeTruthy();
  });

  // ===========================================================================
  // IT3-GA-005: budget → campaign → adgroup → ad (4ステップ完全構築)
  // ===========================================================================
  it("IT3-GA-005: 予算 → キャンペーン → 広告グループ → 広告（4ステップ完全構築）", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_budget_create",
        args: { name: "4ステップ予算", amountMicros: 5000000000 },
      },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "4ステップキャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "4ステップ広告グループ",
          cpcBidMicros: 100000000,
        },
      },
      {
        tool: "google_ads_ad_create",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          headlines: [
            { text: "見出しA" },
            { text: "見出しB" },
            { text: "見出しC" },
          ],
          descriptions: [{ text: "説明文A" }, { text: "説明文B" }],
          finalUrls: ["https://example.com/lp"],
        },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-006: account_list → campaign_list → campaign_get (ナビゲーション)
  // ===========================================================================
  it("IT3-GA-006: アカウント一覧 → キャンペーン一覧 → キャンペーン詳細", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "google_ads_campaign_get", args: { campaignId: "123456" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-007: campaign_list → adgroup_list → ad_list (ドリルダウン)
  // ===========================================================================
  it("IT3-GA-007: キャンペーン一覧 → 広告グループ一覧 → 広告一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
      { tool: "google_ads_ad_list", args: { adGroupId: "123456" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-008: campaign_list → adgroup_list → keyword_list (KWドリルダウン)
  // ===========================================================================
  it("IT3-GA-008: キャンペーン一覧 → 広告グループ一覧 → キーワード一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
      { tool: "google_ads_keyword_list", args: { adGroupId: "123456" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-009: budget_create → budget_update → campaign_create (予算ライフサイクル)
  // ===========================================================================
  it("IT3-GA-009: 予算作成 → 予算更新 → キャンペーン作成", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_budget_create",
        args: { name: "ライフサイクル予算", amountMicros: 3000000000 },
      },
      {
        tool: "google_ads_budget_update",
        args: { budgetId: "123456", amountMicros: 5000000000 },
      },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "ライフサイクルキャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-010: campaign_create → report_campaign → campaign_update (レポート最適化)
  // ===========================================================================
  it("IT3-GA-010: キャンペーン作成 → レポート取得 → キャンペーン更新", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "レポート最適化キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_report_campaign",
        args: { startDate: "2026-03-01", endDate: "2026-03-28" },
      },
      {
        tool: "google_ads_campaign_update",
        args: { campaignId: "123456", status: "PAUSED" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-011: budget → campaign → adgroup → keyword_add (KW付き構築)
  // ===========================================================================
  it("IT3-GA-011: 予算 → キャンペーン → 広告グループ → キーワード追加", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_budget_create",
        args: { name: "KW構築予算", amountMicros: 2000000000 },
      },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "KW構築キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "KW構築広告グループ",
          cpcBidMicros: 70000000,
        },
      },
      {
        tool: "google_ads_keyword_add",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          keywords: [{ text: "構築テスト", matchType: "BROAD", cpcBidMicros: 30000000 }],
        },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-012: campaign_list → campaign_get → report_campaign (分析フロー)
  // ===========================================================================
  it("IT3-GA-012: キャンペーン一覧 → キャンペーン詳細 → レポート取得", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "google_ads_campaign_get", args: { campaignId: "123456" } },
      {
        tool: "google_ads_report_campaign",
        args: { startDate: "2026-03-01", endDate: "2026-03-28", campaignId: "123456" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-013: adgroup_create → ad_create → ad_update (広告ライフサイクル)
  // ===========================================================================
  it("IT3-GA-013: 広告グループ作成 → 広告作成 → 広告更新", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "広告LCグループ",
          cpcBidMicros: 60000000,
        },
      },
      {
        tool: "google_ads_ad_create",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          headlines: [{ text: "LC見出し1" }, { text: "LC見出し2" }, { text: "LC見出し3" }],
          descriptions: [{ text: "LC説明文1" }, { text: "LC説明文2" }],
          finalUrls: ["https://example.com/lc"],
        },
      },
      {
        tool: "google_ads_ad_update",
        args: { adGroupId: "123456", adId: "789", status: "PAUSED" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-014: campaign_create → adgroup_create → adgroup_update (広告グループ更新)
  // ===========================================================================
  it("IT3-GA-014: キャンペーン作成 → 広告グループ作成 → 広告グループ更新", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "AGU用キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "AGU用広告グループ",
          cpcBidMicros: 50000000,
        },
      },
      {
        tool: "google_ads_adgroup_update",
        args: { adGroupId: "123456", name: "更新後広告グループ", cpcBidMicros: 80000000 },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-015: account_list → budget_list → campaign_list (概要確認)
  // ===========================================================================
  it("IT3-GA-015: アカウント一覧 → 予算一覧 → キャンペーン一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "google_ads_budget_list", args: {} },
      { tool: "google_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-016: campaign_list → adgroup_list → adgroup_update (一括管理)
  // ===========================================================================
  it("IT3-GA-016: キャンペーン一覧 → 広告グループ一覧 → 広告グループ更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: { status: "ENABLED" } },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
      { tool: "google_ads_adgroup_update", args: { adGroupId: "123456", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-017: keyword_list → keyword_remove → keyword_add (KW入れ替え)
  // ===========================================================================
  it("IT3-GA-017: キーワード一覧 → キーワード削除 → キーワード追加", async () => {
    const results = await chainTools([
      { tool: "google_ads_keyword_list", args: { adGroupId: "123456" } },
      {
        tool: "google_ads_keyword_remove",
        args: { adGroupId: "123456", criterionIds: ["111", "222"] },
      },
      {
        tool: "google_ads_keyword_add",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          keywords: [{ text: "新KW1", matchType: "EXACT", cpcBidMicros: 50000000 }],
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-018: report_campaign → report_keyword → campaign_update (分析→最適化)
  // ===========================================================================
  it("IT3-GA-018: キャンペーンレポート → KWレポート → キャンペーン更新", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_report_campaign",
        args: { startDate: "2026-03-01", endDate: "2026-03-28" },
      },
      {
        tool: "google_ads_report_keyword",
        args: { startDate: "2026-03-01", endDate: "2026-03-28", campaignId: "123456" },
      },
      {
        tool: "google_ads_campaign_update",
        args: { campaignId: "123456", targetCpaMicros: 500000000 },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-019: budget_create → campaign_create → campaign_list (作成後確認)
  // ===========================================================================
  it("IT3-GA-019: 予算作成 → キャンペーン作成 → キャンペーン一覧確認", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "確認用予算", amountMicros: 1000000000 } },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "確認用キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "DISPLAY",
        },
      },
      { tool: "google_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-020: ad_list → ad_policy_status → ad_update (ポリシー確認→修正)
  // ===========================================================================
  it("IT3-GA-020: 広告一覧 → ポリシーステータス確認 → 広告更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_list", args: { adGroupId: "123456" } },
      { tool: "google_ads_ad_policy_status", args: { adGroupId: "123456" } },
      { tool: "google_ads_ad_update", args: { adGroupId: "123456", adId: "789", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-021: budget → campaign → adgroup → ad → keyword (5ステップ完全構築)
  // ===========================================================================
  it("IT3-GA-021: 予算 → キャンペーン → 広告グループ → 広告 → キーワード（5ステップ）", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "5ステップ予算", amountMicros: 10000000000 } },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "5ステップキャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "5ステップ広告グループ",
          cpcBidMicros: 100000000,
        },
      },
      {
        tool: "google_ads_ad_create",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          headlines: [{ text: "5S見出し1" }, { text: "5S見出し2" }, { text: "5S見出し3" }],
          descriptions: [{ text: "5S説明文1" }, { text: "5S説明文2" }],
          finalUrls: ["https://example.com/5step"],
        },
      },
      {
        tool: "google_ads_keyword_add",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          keywords: [
            { text: "5ステップKW", matchType: "EXACT", cpcBidMicros: 60000000 },
          ],
        },
      },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-022: campaign_create → campaign_update → campaign_get (作成→更新→確認)
  // ===========================================================================
  it("IT3-GA-022: キャンペーン作成 → 更新 → 詳細取得", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "CUG用キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      { tool: "google_ads_campaign_update", args: { campaignId: "123456", name: "CUG更新後" } },
      { tool: "google_ads_campaign_get", args: { campaignId: "123456" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-023: adgroup_list → ad_list → ad_policy_status (広告審査確認フロー)
  // ===========================================================================
  it("IT3-GA-023: 広告グループ一覧 → 広告一覧 → ポリシーステータス", async () => {
    const results = await chainTools([
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
      { tool: "google_ads_ad_list", args: { adGroupId: "123456" } },
      { tool: "google_ads_ad_policy_status", args: { campaignId: "123456" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-024: budget_list → budget_update → campaign_create (予算調整→キャンペーン)
  // ===========================================================================
  it("IT3-GA-024: 予算一覧 → 予算更新 → キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_list", args: {} },
      { tool: "google_ads_budget_update", args: { budgetId: "123456", amountMicros: 8000000000 } },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "調整後キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-025: campaign_create → adgroup_create → keyword_add → keyword_list
  // ===========================================================================
  it("IT3-GA-025: キャンペーン → 広告グループ → KW追加 → KW一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "KW確認用キャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "KW確認用広告グループ",
          cpcBidMicros: 50000000,
        },
      },
      {
        tool: "google_ads_keyword_add",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          keywords: [{ text: "確認KW", matchType: "PHRASE", cpcBidMicros: 40000000 }],
        },
      },
      { tool: "google_ads_keyword_list", args: { adGroupId: "123456" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-026: account_list → campaign_list → adgroup_list (全体→詳細)
  // ===========================================================================
  it("IT3-GA-026: アカウント一覧 → キャンペーン一覧 → 広告グループ一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "google_ads_campaign_list", args: { limit: 10 } },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456", limit: 10 } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-027: campaign_create → adgroup_create → ad_create → ad_list
  // ===========================================================================
  it("IT3-GA-027: キャンペーン → 広告グループ → 広告作成 → 広告一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "広告確認用",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "広告確認用AG",
          cpcBidMicros: 90000000,
        },
      },
      {
        tool: "google_ads_ad_create",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          headlines: [{ text: "確認見出し1" }, { text: "確認見出し2" }, { text: "確認見出し3" }],
          descriptions: [{ text: "確認説明文1" }, { text: "確認説明文2" }],
          finalUrls: ["https://example.com/check"],
        },
      },
      { tool: "google_ads_ad_list", args: { adGroupId: "123456" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-028: report_campaign → adgroup_list → adgroup_update (パフォーマンス最適化)
  // ===========================================================================
  it("IT3-GA-028: レポート取得 → 広告グループ一覧 → 広告グループ入札調整", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_report_campaign",
        args: { startDate: "2026-03-01", endDate: "2026-03-28" },
      },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
      { tool: "google_ads_adgroup_update", args: { adGroupId: "123456", cpcBidMicros: 120000000 } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-029: budget_create → budget_list → budget_update (予算管理フロー)
  // ===========================================================================
  it("IT3-GA-029: 予算作成 → 予算一覧 → 予算更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "管理用予算", amountMicros: 3000000000 } },
      { tool: "google_ads_budget_list", args: {} },
      { tool: "google_ads_budget_update", args: { budgetId: "123456", name: "管理用予算v2" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-030: campaign_list → report_keyword → keyword_remove (低パフォーマンスKW削除)
  // ===========================================================================
  it("IT3-GA-030: キャンペーン一覧 → KWレポート → KW削除", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      {
        tool: "google_ads_report_keyword",
        args: { startDate: "2026-03-01", endDate: "2026-03-28", campaignId: "123456" },
      },
      {
        tool: "google_ads_keyword_remove",
        args: { adGroupId: "123456", criterionIds: ["999"] },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-031: campaign_create → adgroup_create → adgroup_list (作成確認フロー)
  // ===========================================================================
  it("IT3-GA-031: キャンペーン作成 → 広告グループ作成 → 広告グループ一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "一覧確認用",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "一覧確認用AG",
          cpcBidMicros: 50000000,
        },
      },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-032: campaign_update → adgroup_update → ad_update (一括ステータス変更)
  // ===========================================================================
  it("IT3-GA-032: キャンペーン更新 → 広告グループ更新 → 広告更新（一括ステータス変更）", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_update", args: { campaignId: "123456", status: "PAUSED" } },
      { tool: "google_ads_adgroup_update", args: { adGroupId: "123456", status: "PAUSED" } },
      { tool: "google_ads_ad_update", args: { adGroupId: "123456", adId: "789", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-033: account_list → campaign_list → report_campaign (全体分析)
  // ===========================================================================
  it("IT3-GA-033: アカウント一覧 → キャンペーン一覧 → キャンペーンレポート", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "google_ads_campaign_list", args: {} },
      {
        tool: "google_ads_report_campaign",
        args: { startDate: "2026-03-01", endDate: "2026-03-28" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-034: campaign_create (DISPLAY) → adgroup_create → ad_create
  // ===========================================================================
  it("IT3-GA-034: ディスプレイキャンペーン → 広告グループ → 広告作成", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "ディスプレイキャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "DISPLAY",
        },
      },
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "ディスプレイAG",
          type: "DISPLAY_STANDARD",
          cpcBidMicros: 30000000,
        },
      },
      {
        tool: "google_ads_ad_create",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          headlines: [{ text: "D見出し1" }, { text: "D見出し2" }, { text: "D見出し3" }],
          descriptions: [{ text: "D説明文1" }, { text: "D説明文2" }],
          finalUrls: ["https://example.com/display"],
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-035: budget_create → campaign_create → report_campaign (作成→即レポート)
  // ===========================================================================
  it("IT3-GA-035: 予算作成 → キャンペーン作成 → 即レポート取得", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "即レポ予算", amountMicros: 1500000000 } },
      {
        tool: "google_ads_campaign_create",
        args: {
          name: "即レポキャンペーン",
          budgetResourceName: "customers/1234567890/campaignBudgets/123456",
          advertisingChannelType: "SEARCH",
        },
      },
      {
        tool: "google_ads_report_campaign",
        args: { startDate: "2026-03-28", endDate: "2026-03-28" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-036: keyword_list → report_keyword → keyword_add (KW分析→追加)
  // ===========================================================================
  it("IT3-GA-036: KW一覧 → KWレポート → KW追加", async () => {
    const results = await chainTools([
      { tool: "google_ads_keyword_list", args: { campaignId: "123456" } },
      {
        tool: "google_ads_report_keyword",
        args: { startDate: "2026-03-01", endDate: "2026-03-28" },
      },
      {
        tool: "google_ads_keyword_add",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          keywords: [{ text: "分析追加KW", matchType: "BROAD", cpcBidMicros: 45000000 }],
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-037: campaign_list → campaign_update → budget_update (同時最適化)
  // ===========================================================================
  it("IT3-GA-037: キャンペーン一覧 → キャンペーン更新 → 予算更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "google_ads_campaign_update", args: { campaignId: "123456", status: "ENABLED" } },
      { tool: "google_ads_budget_update", args: { budgetId: "123456", amountMicros: 6000000000 } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-038: adgroup_create → keyword_add → ad_create (広告グループ内完成)
  // ===========================================================================
  it("IT3-GA-038: 広告グループ作成 → KW追加 → 広告作成", async () => {
    const results = await chainTools([
      {
        tool: "google_ads_adgroup_create",
        args: {
          campaignResourceName: "customers/1234567890/campaigns/123456",
          name: "完成AG",
          cpcBidMicros: 75000000,
        },
      },
      {
        tool: "google_ads_keyword_add",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          keywords: [{ text: "完成KW", matchType: "EXACT", cpcBidMicros: 50000000 }],
        },
      },
      {
        tool: "google_ads_ad_create",
        args: {
          adGroupResourceName: "customers/1234567890/adGroups/123456",
          headlines: [{ text: "完成見出し1" }, { text: "完成見出し2" }, { text: "完成見出し3" }],
          descriptions: [{ text: "完成説明文1" }, { text: "完成説明文2" }],
          finalUrls: ["https://example.com/complete"],
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-039: account_list → budget_create → budget_update (アカウント確認→予算管理)
  // ===========================================================================
  it("IT3-GA-039: アカウント一覧 → 予算作成 → 予算更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "google_ads_budget_create", args: { name: "管理予算", amountMicros: 2000000000 } },
      { tool: "google_ads_budget_update", args: { budgetId: "123456", amountMicros: 4000000000 } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GA-040: campaign_get → adgroup_list → keyword_list → report_keyword (詳細分析)
  // ===========================================================================
  it("IT3-GA-040: キャンペーン詳細 → 広告グループ一覧 → KW一覧 → KWレポート", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_get", args: { campaignId: "123456" } },
      { tool: "google_ads_adgroup_list", args: { campaignId: "123456" } },
      { tool: "google_ads_keyword_list", args: { campaignId: "123456" } },
      {
        tool: "google_ads_report_keyword",
        args: { startDate: "2026-03-01", endDate: "2026-03-28", campaignId: "123456" },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });
});
