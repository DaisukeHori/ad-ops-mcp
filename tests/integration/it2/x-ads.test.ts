/**
 * IT2: X Ads 2ツール結合テスト（30件）
 * 2つのツールを連鎖実行し、両方がエラーなく動作することを検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import { callTool, chainTools } from "@/tests/helpers/mcp-client";

beforeEach(() => {
  process.env.X_ADS_API_KEY = "test-api-key";
  process.env.X_ADS_API_SECRET = "test-api-secret";
  process.env.X_ADS_ACCESS_TOKEN = "test-access-token";
  process.env.X_ADS_ACCESS_SECRET = "test-access-secret";
  process.env.X_ADS_ACCOUNT_ID = "test-account-id";
});

describe("IT2-XA: アカウント -> キャンペーン 連携", () => {
  it("IT2-XA-001: account_list -> campaign_list", async () => {
    const r1 = await callTool("x_ads_account_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-002: account_list -> campaign_create", async () => {
    const r1 = await callTool("x_ads_account_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_create", {
      name: "テストキャンペーン",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 10000000000,
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: キャンペーン CRUD 連携", () => {
  it("IT2-XA-003: campaign_create -> campaign_list", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "リスト確認CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 5000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-004: campaign_create -> campaign_update", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "更新テストCP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 5000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_update", {
      campaignId: "mock-id-123",
      name: "更新後CP名",
      entityStatus: "ACTIVE",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-005: campaign_list -> campaign_update", async () => {
    const r1 = await callTool("x_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_update", {
      campaignId: "mock-id-123",
      dailyBudgetAmountLocalMicro: 20000000000,
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-006: campaign_create -> campaign_update (ステータス変更)", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "ステータス変更CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 3000000000,
      entityStatus: "DRAFT",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_update", {
      campaignId: "mock-id-123",
      entityStatus: "PAUSED",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: キャンペーン -> ラインアイテム 連携", () => {
  it("IT2-XA-007: campaign_create -> lineitem_create", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "LI用CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 10000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_create", {
      campaignId: "mock-id-123",
      name: "テストラインアイテム",
      objective: "WEBSITE_CLICKS",
      placements: ["ALL_ON_TWITTER"],
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-008: campaign_list -> lineitem_list", async () => {
    const r1 = await callTool("x_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_list", {
      campaignIds: "mock-id-123",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-009: campaign_create -> lineitem_list", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "LIリスト確認CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 5000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_list", {});
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: ラインアイテム CRUD 連携", () => {
  it("IT2-XA-010: lineitem_create -> lineitem_list", async () => {
    const r1 = await callTool("x_ads_lineitem_create", {
      campaignId: "mock-id-123",
      name: "リスト確認LI",
      objective: "ENGAGEMENTS",
      placements: ["TWITTER_TIMELINE"],
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-011: lineitem_create -> lineitem_update", async () => {
    const r1 = await callTool("x_ads_lineitem_create", {
      campaignId: "mock-id-123",
      name: "更新テストLI",
      objective: "AWARENESS",
      placements: ["ALL_ON_TWITTER"],
      bidStrategy: "AUTO",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_update", {
      lineItemId: "mock-id-123",
      name: "更新後LI名",
      entityStatus: "ACTIVE",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-012: lineitem_list -> lineitem_update", async () => {
    const r1 = await callTool("x_ads_lineitem_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_update", {
      lineItemId: "mock-id-123",
      bidAmountLocalMicro: 500000000,
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-013: lineitem_create -> lineitem_update (入札変更)", async () => {
    const r1 = await callTool("x_ads_lineitem_create", {
      campaignId: "mock-id-123",
      name: "入札変更LI",
      objective: "WEBSITE_CLICKS",
      placements: ["TWITTER_SEARCH", "TWITTER_TIMELINE"],
      bidAmountLocalMicro: 200000000,
      bidStrategy: "MAX",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_update", {
      lineItemId: "mock-id-123",
      bidAmountLocalMicro: 300000000,
      bidStrategy: "TARGET",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: クリエイティブ連携", () => {
  it("IT2-XA-014: lineitem_create -> creative_create", async () => {
    const r1 = await callTool("x_ads_lineitem_create", {
      campaignId: "mock-id-123",
      name: "クリエイティブ用LI",
      objective: "ENGAGEMENTS",
      placements: ["ALL_ON_TWITTER"],
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_creative_create", {
      lineItemId: "mock-id-123",
      tweetId: "tweet-001",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-015: creative_create -> creative_list", async () => {
    const r1 = await callTool("x_ads_creative_create", {
      lineItemId: "mock-id-123",
      tweetId: "tweet-002",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_creative_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-016: lineitem_list -> creative_list", async () => {
    const r1 = await callTool("x_ads_lineitem_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_creative_list", {
      lineItemIds: "mock-id-123",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-017: creative_create -> creative_create (複数プロモツイート)", async () => {
    const r1 = await callTool("x_ads_creative_create", {
      lineItemId: "mock-id-123",
      tweetId: "tweet-003",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_creative_create", {
      lineItemId: "mock-id-123",
      tweetId: "tweet-004",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: ターゲティング連携", () => {
  it("IT2-XA-018: lineitem_create -> targeting_create", async () => {
    const r1 = await callTool("x_ads_lineitem_create", {
      campaignId: "mock-id-123",
      name: "ターゲティング用LI",
      objective: "WEBSITE_CLICKS",
      placements: ["ALL_ON_TWITTER"],
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_targeting_create", {
      lineItemId: "mock-id-123",
      targetingType: "LOCATION",
      targetingValue: "00a2a611420b2601",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-019: targeting_create -> targeting_list", async () => {
    const r1 = await callTool("x_ads_targeting_create", {
      lineItemId: "mock-id-123",
      targetingType: "AGE",
      targetingValue: "AGE_25_TO_34",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_targeting_list", {
      lineItemIds: "mock-id-123",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-020: targeting_create -> targeting_create (複数条件)", async () => {
    const r1 = await callTool("x_ads_targeting_create", {
      lineItemId: "mock-id-123",
      targetingType: "GENDER",
      targetingValue: "1",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_targeting_create", {
      lineItemId: "mock-id-123",
      targetingType: "LANGUAGE",
      targetingValue: "ja",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-021: lineitem_list -> targeting_list", async () => {
    const r1 = await callTool("x_ads_lineitem_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_targeting_list", {});
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: アナリティクス連携", () => {
  it("IT2-XA-022: campaign_list -> analytics", async () => {
    const r1 = await callTool("x_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_analytics", {
      entityType: "CAMPAIGN",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-023: campaign_create -> analytics", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "アナリティクスCP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 5000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_analytics", {
      entityType: "CAMPAIGN",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
      granularity: "TOTAL",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-024: lineitem_list -> analytics", async () => {
    const r1 = await callTool("x_ads_lineitem_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_analytics", {
      entityType: "LINE_ITEM",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
      metricGroups: ["ENGAGEMENT", "BILLING"],
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-025: analytics -> campaign_update", async () => {
    const r1 = await callTool("x_ads_analytics", {
      entityType: "CAMPAIGN",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_update", {
      campaignId: "mock-id-123",
      dailyBudgetAmountLocalMicro: 15000000000,
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-XA-026: analytics -> lineitem_update", async () => {
    const r1 = await callTool("x_ads_analytics", {
      entityType: "LINE_ITEM",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_update", {
      lineItemId: "mock-id-123",
      bidAmountLocalMicro: 400000000,
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-XA: chainTools による連鎖実行", () => {
  it("IT2-XA-027: chainTools で campaign_create -> lineitem_create", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_create", args: { name: "チェーンCP", fundingInstrumentId: "fi-001", dailyBudgetAmountLocalMicro: 5000000000 } },
      { tool: "x_ads_lineitem_create", args: { campaignId: "mock-id-123", name: "チェーンLI", objective: "WEBSITE_CLICKS", placements: ["ALL_ON_TWITTER"] } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
    expect(results).toHaveLength(2);
  });

  it("IT2-XA-028: chainTools で lineitem_create -> creative_create", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_create", args: { campaignId: "mock-id-123", name: "チェーンLI2", objective: "ENGAGEMENTS", placements: ["TWITTER_TIMELINE"] } },
      { tool: "x_ads_creative_create", args: { lineItemId: "mock-id-123", tweetId: "tweet-chain-001" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-XA-029: chainTools で lineitem_create -> targeting_create", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_create", args: { campaignId: "mock-id-123", name: "チェーンLI3", objective: "AWARENESS", placements: ["ALL_ON_TWITTER"] } },
      { tool: "x_ads_targeting_create", args: { lineItemId: "mock-id-123", targetingType: "INTEREST", targetingValue: "12345" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-XA-030: chainTools で campaign_list -> analytics", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_list", args: {} },
      { tool: "x_ads_analytics", args: { entityType: "CAMPAIGN", entityIds: "mock-id-123", startTime: "2026-03-01T00:00:00Z", endTime: "2026-03-28T23:59:59Z" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });
});
