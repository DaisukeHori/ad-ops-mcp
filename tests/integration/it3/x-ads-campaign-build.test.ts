/**
 * IT3 X (Twitter) Ads キャンペーンビルドテスト
 * IT3-XA-001 〜 IT3-XA-040（40件）
 *
 * 3ツール以上の連鎖実行による X Ads キャンペーン構築・分析フローのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  callTool,
  chainTools,
  extractText,
  extractJson,
} from "@/tests/helpers/mcp-client";

const ENV_DEFAULTS: Record<string, string> = {
  X_ADS_API_KEY: "test-api-key",
  X_ADS_API_SECRET: "test-api-secret",
  X_ADS_ACCESS_TOKEN: "test-access-token",
  X_ADS_ACCESS_SECRET: "test-access-secret",
  X_ADS_ACCOUNT_ID: "test-account-id",
};

describe("IT3 X Ads キャンペーンビルド", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...ENV_DEFAULTS };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ===========================================================================
  // IT3-XA-001: account_list → campaign_create → lineitem_create
  // ===========================================================================
  it("IT3-XA-001: アカウント一覧 → キャンペーン作成 → ラインアイテム作成", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "テストキャンペーン",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 10000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "テストラインアイテム",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 500000000,
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-002: campaign_create → lineitem_create → creative_create
  // ===========================================================================
  it("IT3-XA-002: キャンペーン作成 → ラインアイテム作成 → クリエイティブ作成", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "クリエイティブ用キャンペーン",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 5000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "クリエイティブ用LI",
          objective: "ENGAGEMENTS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 300000000,
        },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "1234567890" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-003: campaign_create → lineitem_create → targeting_create
  // ===========================================================================
  it("IT3-XA-003: キャンペーン作成 → ラインアイテム作成 → ターゲティング作成", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "ターゲティング用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 8000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "ターゲティング用LI",
          objective: "AWARENESS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 200000000,
        },
      },
      {
        tool: "x_ads_targeting_create",
        args: {
          lineItemId: "mock-id-123",
          targetingType: "LOCATION",
          targetingValue: "00a2a611297e5270",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-004: campaign_list → campaign_update → lineitem_list
  // ===========================================================================
  it("IT3-XA-004: キャンペーン一覧 → 更新 → ラインアイテム一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", name: "更新後キャンペーン" } },
      { tool: "x_ads_lineitem_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-005: account_list → campaign_list → analytics
  // ===========================================================================
  it("IT3-XA-005: アカウント一覧 → キャンペーン一覧 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      { tool: "x_ads_campaign_list", args: {} },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-006: campaign_create → lineitem_create → lineitem_update
  // ===========================================================================
  it("IT3-XA-006: キャンペーン作成 → LI作成 → LI更新", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "LI更新用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 6000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "更新前LI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 400000000,
        },
      },
      {
        tool: "x_ads_lineitem_update",
        args: { lineItemId: "mock-id-123", name: "更新後LI", bidAmountLocalMicro: 600000000 },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-007: campaign_create → campaign_update → campaign_list (作成→更新→確認)
  // ===========================================================================
  it("IT3-XA-007: キャンペーン作成 → 更新 → 一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "確認用キャンペーン",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 3000000000,
        },
      },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", name: "確認後キャンペーン" } },
      { tool: "x_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-008: lineitem_list → lineitem_update → creative_list (LI管理)
  // ===========================================================================
  it("IT3-XA-008: LI一覧 → LI更新 → クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_list", args: {} },
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", bidStrategy: "AUTO" } },
      { tool: "x_ads_creative_list", args: { lineItemIds: "mock-id-123" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-009: campaign_create → lineitem_create → creative_create → targeting_create (4ステップ)
  // ===========================================================================
  it("IT3-XA-009: キャンペーン → LI → クリエイティブ → ターゲティング", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "4ステップ",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 15000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "4ステップLI",
          objective: "ENGAGEMENTS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 500000000,
        },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "9876543210" },
      },
      {
        tool: "x_ads_targeting_create",
        args: {
          lineItemId: "mock-id-123",
          targetingType: "AGE",
          targetingValue: "AGE_25_TO_49",
        },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-010: campaign_list → lineitem_list → analytics (分析フロー)
  // ===========================================================================
  it("IT3-XA-010: キャンペーン一覧 → LI一覧 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_lineitem_list", args: { campaignIds: "mock-id-123" } },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "LINE_ITEM",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-011: campaign_create → lineitem_create → targeting_create → targeting_list
  // ===========================================================================
  it("IT3-XA-011: キャンペーン → LI → ターゲティング作成 → 一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "ターゲ確認用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 7000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "ターゲ確認LI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 350000000,
        },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "GENDER", targetingValue: "MALE" },
      },
      { tool: "x_ads_targeting_list", args: { lineItemIds: "mock-id-123" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-012: account_list → campaign_create → campaign_list (アカウント確認→作成)
  // ===========================================================================
  it("IT3-XA-012: アカウント一覧 → キャンペーン作成 → 一覧確認", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "アカウント確認後",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 5000000000,
        },
      },
      { tool: "x_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-013: lineitem_create → creative_create → creative_list (クリエイティブ管理)
  // ===========================================================================
  it("IT3-XA-013: LI作成 → クリエイティブ作成 → クリエイティブ一覧", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "クリエイティブ管理LI",
          objective: "ENGAGEMENTS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 250000000,
        },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "111222333" },
      },
      { tool: "x_ads_creative_list", args: { lineItemIds: "mock-id-123" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-014: campaign_list → analytics → campaign_update (分析→最適化)
  // ===========================================================================
  it("IT3-XA-014: キャンペーン一覧 → アナリティクス → キャンペーン更新", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "TOTAL",
        },
      },
      {
        tool: "x_ads_campaign_update",
        args: { campaignId: "mock-id-123", dailyBudgetAmountLocalMicro: 12000000000 },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-015: lineitem_list → targeting_list → lineitem_update (ターゲ確認→LI調整)
  // ===========================================================================
  it("IT3-XA-015: LI一覧 → ターゲティング一覧 → LI更新", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_list", args: {} },
      { tool: "x_ads_targeting_list", args: { lineItemIds: "mock-id-123" } },
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", bidAmountLocalMicro: 700000000 } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-016: campaign_update → lineitem_update → analytics (更新後分析)
  // ===========================================================================
  it("IT3-XA-016: キャンペーン更新 → LI更新 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", status: "PAUSED" } },
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", status: "PAUSED" } },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "TOTAL",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-017: campaign_create → lineitem_create → analytics (作成→即分析)
  // ===========================================================================
  it("IT3-XA-017: キャンペーン作成 → LI作成 → 即アナリティクス", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "即分析キャンペーン",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 4000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "即分析LI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 300000000,
        },
      },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "LINE_ITEM",
          entityIds: "mock-id-123",
          startTime: "2026-03-28",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-018: lineitem_create → targeting_create → targeting_create (複数ターゲティング)
  // ===========================================================================
  it("IT3-XA-018: LI作成 → ターゲティング1 → ターゲティング2", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "複数ターゲLI",
          objective: "AWARENESS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 200000000,
        },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "LOCATION", targetingValue: "jp" },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "AGE", targetingValue: "AGE_18_TO_34" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-019: account_list → campaign_list → lineitem_list (全体確認)
  // ===========================================================================
  it("IT3-XA-019: アカウント一覧 → キャンペーン一覧 → LI一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_lineitem_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-020: campaign_create → lineitem_create → creative_create → analytics (4ステップ)
  // ===========================================================================
  it("IT3-XA-020: キャンペーン → LI → クリエイティブ → アナリティクス", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "フル分析用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 10000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "フル分析LI",
          objective: "ENGAGEMENTS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 400000000,
        },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "444555666" },
      },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "PROMOTED_TWEET",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-021: campaign_list → campaign_update → analytics (最適化サイクル)
  // ===========================================================================
  it("IT3-XA-021: キャンペーン一覧 → 更新 → アナリティクス確認", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", dailyBudgetAmountLocalMicro: 8000000000 } },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "TOTAL",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-022: lineitem_list → creative_list → analytics (LI分析)
  // ===========================================================================
  it("IT3-XA-022: LI一覧 → クリエイティブ一覧 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_list", args: {} },
      { tool: "x_ads_creative_list", args: {} },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "LINE_ITEM",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-023: lineitem_create → targeting_create → creative_create (LI完成)
  // ===========================================================================
  it("IT3-XA-023: LI作成 → ターゲティング → クリエイティブ", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "完成LI",
          objective: "FOLLOWERS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 350000000,
        },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "BROAD_KEYWORD", targetingValue: "テスト" },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "777888999" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-024: campaign_create → campaign_list → campaign_update (作成→確認→更新)
  // ===========================================================================
  it("IT3-XA-024: キャンペーン作成 → 一覧確認 → 更新", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "確認更新用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 3000000000,
        },
      },
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", status: "ACTIVE" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-025: lineitem_create → lineitem_update → lineitem_list (LIライフサイクル)
  // ===========================================================================
  it("IT3-XA-025: LI作成 → 更新 → 一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "LC用LI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 300000000,
        },
      },
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", name: "LC更新後LI" } },
      { tool: "x_ads_lineitem_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-026: targeting_list → targeting_create → targeting_list (ターゲティング管理)
  // ===========================================================================
  it("IT3-XA-026: ターゲティング一覧 → 追加 → 再確認", async () => {
    const results = await chainTools([
      { tool: "x_ads_targeting_list", args: { lineItemIds: "mock-id-123" } },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "DEVICE", targetingValue: "MOBILE" },
      },
      { tool: "x_ads_targeting_list", args: { lineItemIds: "mock-id-123" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-027: creative_list → creative_create → analytics (クリエイティブ効果)
  // ===========================================================================
  it("IT3-XA-027: クリエイティブ一覧 → 作成 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_creative_list", args: {} },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "555666777" },
      },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "PROMOTED_TWEET",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "TOTAL",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-028: account_list → campaign_create → lineitem_create → creative_create (フル構築)
  // ===========================================================================
  it("IT3-XA-028: アカウント → キャンペーン → LI → クリエイティブ（フル構築）", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "フル構築用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 20000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "フル構築LI",
          objective: "ENGAGEMENTS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 500000000,
        },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "888999000" },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-029: campaign_list → lineitem_list → creative_list (全体確認フロー)
  // ===========================================================================
  it("IT3-XA-029: キャンペーン一覧 → LI一覧 → クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_lineitem_list", args: {} },
      { tool: "x_ads_creative_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-030: campaign_update → lineitem_list → lineitem_update (一括管理)
  // ===========================================================================
  it("IT3-XA-030: キャンペーン更新 → LI一覧 → LI更新", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", name: "一括管理用" } },
      { tool: "x_ads_lineitem_list", args: { campaignIds: "mock-id-123" } },
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-031: campaign_create → lineitem_create → targeting_create → targeting_create → creative_create (5ステップ)
  // ===========================================================================
  it("IT3-XA-031: キャンペーン → LI → ターゲ1 → ターゲ2 → クリエイティブ（5ステップ）", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "5ステップ",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 25000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "5ステップLI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 600000000,
        },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "LOCATION", targetingValue: "jp" },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "GENDER", targetingValue: "FEMALE" },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "000111222" },
      },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-032: analytics → campaign_update → analytics (分析→改善→再分析)
  // ===========================================================================
  it("IT3-XA-032: アナリティクス → キャンペーン更新 → 再アナリティクス", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-02-01",
          endTime: "2026-02-28",
          granularity: "TOTAL",
        },
      },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", dailyBudgetAmountLocalMicro: 15000000000 } },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "TOTAL",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-033: account_list → campaign_list → lineitem_list → targeting_list (全階層確認)
  // ===========================================================================
  it("IT3-XA-033: アカウント → キャンペーン → LI → ターゲティング一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_lineitem_list", args: {} },
      { tool: "x_ads_targeting_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-034: lineitem_create → creative_create → creative_create (複数クリエイティブ)
  // ===========================================================================
  it("IT3-XA-034: LI作成 → クリエイティブ1 → クリエイティブ2", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "複数クリエイティブLI",
          objective: "ENGAGEMENTS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 400000000,
        },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "aaa111" },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "bbb222" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-035: campaign_create → campaign_update → lineitem_create (更新後LI作成)
  // ===========================================================================
  it("IT3-XA-035: キャンペーン作成 → 更新 → LI作成", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "更新後LI用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 6000000000,
        },
      },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", name: "更新後キャンペーン" } },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "更新後LI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 450000000,
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-036: lineitem_update → targeting_list → analytics (LI調整分析)
  // ===========================================================================
  it("IT3-XA-036: LI更新 → ターゲティング一覧 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", bidAmountLocalMicro: 800000000 } },
      { tool: "x_ads_targeting_list", args: { lineItemIds: "mock-id-123" } },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "LINE_ITEM",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-037: account_list → campaign_create → campaign_update (アカウント→キャンペーン管理)
  // ===========================================================================
  it("IT3-XA-037: アカウント一覧 → キャンペーン作成 → 更新", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "管理用",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 4000000000,
        },
      },
      { tool: "x_ads_campaign_update", args: { campaignId: "mock-id-123", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-038: campaign_list → lineitem_list → lineitem_update → analytics (更新→分析)
  // ===========================================================================
  it("IT3-XA-038: キャンペーン一覧 → LI一覧 → LI更新 → アナリティクス", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_lineitem_list", args: {} },
      { tool: "x_ads_lineitem_update", args: { lineItemId: "mock-id-123", name: "調整後LI" } },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "LINE_ITEM",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "TOTAL",
        },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-039: targeting_create → targeting_create → targeting_list (複数ターゲ→確認)
  // ===========================================================================
  it("IT3-XA-039: ターゲティング1 → ターゲティング2 → 一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "KEYWORD", targetingValue: "広告" },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "KEYWORD", targetingValue: "マーケティング" },
      },
      { tool: "x_ads_targeting_list", args: { lineItemIds: "mock-id-123" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-XA-040: account_list → campaign_create → lineitem_create → targeting_create → creative_create → analytics (6ステップフル)
  // ===========================================================================
  it("IT3-XA-040: アカウント → キャンペーン → LI → ターゲ → クリエイティブ → アナリティクス（6ステップ）", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      {
        tool: "x_ads_campaign_create",
        args: {
          name: "6ステップ",
          fundingInstrumentId: "fi-001",
          dailyBudgetAmountLocalMicro: 30000000000,
        },
      },
      {
        tool: "x_ads_lineitem_create",
        args: {
          campaignId: "mock-id-123",
          name: "6ステップLI",
          objective: "WEBSITE_CLICKS",
          placements: ["ALL_ON_TWITTER"],
          bidAmountLocalMicro: 700000000,
        },
      },
      {
        tool: "x_ads_targeting_create",
        args: { lineItemId: "mock-id-123", targetingType: "LOCATION", targetingValue: "jp" },
      },
      {
        tool: "x_ads_creative_create",
        args: { lineItemId: "mock-id-123", tweetId: "final123" },
      },
      {
        tool: "x_ads_analytics",
        args: {
          entityType: "CAMPAIGN",
          entityIds: "mock-id-123",
          startTime: "2026-03-01",
          endTime: "2026-03-28",
          granularity: "DAY",
        },
      },
    ]);
    expect(results).toHaveLength(6);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });
});
