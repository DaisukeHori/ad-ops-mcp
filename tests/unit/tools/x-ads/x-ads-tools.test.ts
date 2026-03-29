/**
 * X (Twitter) Ads ツール単体テスト
 * UT-XA-001 〜 UT-XA-048
 *
 * 全12ツール x 4パターン = 48テスト
 * A: 正常系
 * B: 認証エラー（X_ADS_API_KEY 削除 → getEnv() 例外）
 * C: レート制限（X_ADS_ACCESS_TOKEN=rate-limited → mock 429）
 * D: パラメータ不正 or 追加正常パターン
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { callTool, extractText } from "@/tests/helpers/mcp-client";

const ENV_DEFAULTS: Record<string, string> = {
  X_ADS_API_KEY: "test-api-key",
  X_ADS_API_SECRET: "test-api-secret",
  X_ADS_ACCESS_TOKEN: "test-access-token",
  X_ADS_ACCESS_SECRET: "test-access-secret",
  X_ADS_ACCOUNT_ID: "test-account-id",
};

describe("X Ads ツール単体テスト", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...ENV_DEFAULTS };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ==========================================================================
  // x_ads_account_list (UT-XA-001 〜 UT-XA-004)
  // ==========================================================================
  describe("x_ads_account_list", () => {
    it("UT-XA-001: 正常系 - アカウント一覧を取得できる", async () => {
      const result = await callTool("x_ads_account_list", {});
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it("UT-XA-002: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_account_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-003: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_account_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-004: 正常系 - count パラメータ付きで取得できる", async () => {
      const result = await callTool("x_ads_account_list", { count: 10 });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
    });
  });

  // ==========================================================================
  // x_ads_campaign_list (UT-XA-005 〜 UT-XA-008)
  // ==========================================================================
  describe("x_ads_campaign_list", () => {
    it("UT-XA-005: 正常系 - キャンペーン一覧を取得できる", async () => {
      const result = await callTool("x_ads_campaign_list", {});
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it("UT-XA-006: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_campaign_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-007: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_campaign_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-008: 正常系 - fundingInstrumentIds フィルタ付きで取得できる", async () => {
      const result = await callTool("x_ads_campaign_list", {
        fundingInstrumentIds: "fi-001,fi-002",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
    });
  });

  // ==========================================================================
  // x_ads_campaign_create (UT-XA-009 〜 UT-XA-012)
  // ==========================================================================
  describe("x_ads_campaign_create", () => {
    it("UT-XA-009: 正常系 - キャンペーンを作成できる", async () => {
      const result = await callTool("x_ads_campaign_create", {
        name: "テストキャンペーン",
        fundingInstrumentId: "fi-001",
        dailyBudgetAmountLocalMicro: 10000000000,
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveProperty("id", "mock-id-123");
    });

    it("UT-XA-010: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_campaign_create", {
        name: "テストキャンペーン",
        fundingInstrumentId: "fi-001",
        dailyBudgetAmountLocalMicro: 10000000000,
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-011: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_campaign_create", {
        name: "テストキャンペーン",
        fundingInstrumentId: "fi-001",
        dailyBudgetAmountLocalMicro: 10000000000,
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-012: パラメータ不正 - name 未指定でエラー", async () => {
      const result = await callTool("x_ads_campaign_create", {
        fundingInstrumentId: "fi-001",
        dailyBudgetAmountLocalMicro: 10000000000,
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // x_ads_campaign_update (UT-XA-013 〜 UT-XA-016)
  // ==========================================================================
  describe("x_ads_campaign_update", () => {
    it("UT-XA-013: 正常系 - キャンペーンを更新できる", async () => {
      const result = await callTool("x_ads_campaign_update", {
        campaignId: "camp-001",
        name: "更新キャンペーン",
        entityStatus: "ACTIVE",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveProperty("id", "mock-id-123");
    });

    it("UT-XA-014: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_campaign_update", {
        campaignId: "camp-001",
        name: "更新キャンペーン",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-015: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_campaign_update", {
        campaignId: "camp-001",
        name: "更新キャンペーン",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-016: パラメータ不正 - campaignId 未指定でエラー", async () => {
      const result = await callTool("x_ads_campaign_update", {
        name: "更新キャンペーン",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // x_ads_lineitem_list (UT-XA-017 〜 UT-XA-020)
  // ==========================================================================
  describe("x_ads_lineitem_list", () => {
    it("UT-XA-017: 正常系 - ラインアイテム一覧を取得できる", async () => {
      const result = await callTool("x_ads_lineitem_list", {});
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it("UT-XA-018: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_lineitem_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-019: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_lineitem_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-020: 正常系 - campaignIds フィルタ付きで取得できる", async () => {
      const result = await callTool("x_ads_lineitem_list", {
        campaignIds: "camp-001,camp-002",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
    });
  });

  // ==========================================================================
  // x_ads_lineitem_create (UT-XA-021 〜 UT-XA-024)
  // ==========================================================================
  describe("x_ads_lineitem_create", () => {
    it("UT-XA-021: 正常系 - ラインアイテムを作成できる", async () => {
      const result = await callTool("x_ads_lineitem_create", {
        campaignId: "camp-001",
        name: "テストラインアイテム",
        objective: "WEBSITE_CLICKS",
        placements: ["ALL_ON_TWITTER"],
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveProperty("id", "mock-id-123");
    });

    it("UT-XA-022: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_lineitem_create", {
        campaignId: "camp-001",
        name: "テストラインアイテム",
        objective: "WEBSITE_CLICKS",
        placements: ["ALL_ON_TWITTER"],
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-023: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_lineitem_create", {
        campaignId: "camp-001",
        name: "テストラインアイテム",
        objective: "WEBSITE_CLICKS",
        placements: ["ALL_ON_TWITTER"],
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-024: パラメータ不正 - name と campaignId 未指定でエラー", async () => {
      const result = await callTool("x_ads_lineitem_create", {
        objective: "WEBSITE_CLICKS",
        placements: ["ALL_ON_TWITTER"],
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // x_ads_lineitem_update (UT-XA-025 〜 UT-XA-028)
  // ==========================================================================
  describe("x_ads_lineitem_update", () => {
    it("UT-XA-025: 正常系 - ラインアイテムを更新できる", async () => {
      const result = await callTool("x_ads_lineitem_update", {
        lineItemId: "li-001",
        name: "更新ラインアイテム",
        entityStatus: "ACTIVE",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveProperty("id", "mock-id-123");
    });

    it("UT-XA-026: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_lineitem_update", {
        lineItemId: "li-001",
        name: "更新ラインアイテム",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-027: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_lineitem_update", {
        lineItemId: "li-001",
        name: "更新ラインアイテム",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-028: パラメータ不正 - lineItemId 未指定でエラー", async () => {
      const result = await callTool("x_ads_lineitem_update", {
        name: "更新ラインアイテム",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // x_ads_creative_list (UT-XA-029 〜 UT-XA-032)
  // ==========================================================================
  describe("x_ads_creative_list", () => {
    it("UT-XA-029: 正常系 - プロモツイート一覧を取得できる", async () => {
      const result = await callTool("x_ads_creative_list", {});
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it("UT-XA-030: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_creative_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-031: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_creative_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-032: 正常系 - lineItemIds フィルタ付きで取得できる", async () => {
      const result = await callTool("x_ads_creative_list", {
        lineItemIds: "li-001,li-002",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
    });
  });

  // ==========================================================================
  // x_ads_creative_create (UT-XA-033 〜 UT-XA-036)
  // ==========================================================================
  describe("x_ads_creative_create", () => {
    it("UT-XA-033: 正常系 - プロモツイートを作成できる", async () => {
      const result = await callTool("x_ads_creative_create", {
        lineItemId: "li-001",
        tweetId: "tweet-001",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveProperty("id", "mock-id-123");
    });

    it("UT-XA-034: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_creative_create", {
        lineItemId: "li-001",
        tweetId: "tweet-001",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-035: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_creative_create", {
        lineItemId: "li-001",
        tweetId: "tweet-001",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-036: パラメータ不正 - lineItemId と tweetId 未指定でエラー", async () => {
      const result = await callTool("x_ads_creative_create", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // x_ads_targeting_list (UT-XA-037 〜 UT-XA-040)
  // ==========================================================================
  describe("x_ads_targeting_list", () => {
    it("UT-XA-037: 正常系 - ターゲティング条件一覧を取得できる", async () => {
      const result = await callTool("x_ads_targeting_list", {});
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it("UT-XA-038: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_targeting_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-039: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_targeting_list", {});
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-040: 正常系 - lineItemIds フィルタ付きで取得できる", async () => {
      const result = await callTool("x_ads_targeting_list", {
        lineItemIds: "li-001",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
    });
  });

  // ==========================================================================
  // x_ads_targeting_create (UT-XA-041 〜 UT-XA-044)
  // ==========================================================================
  describe("x_ads_targeting_create", () => {
    it("UT-XA-041: 正常系 - ターゲティング条件を作成できる", async () => {
      const result = await callTool("x_ads_targeting_create", {
        lineItemId: "li-001",
        targetingType: "LOCATION",
        targetingValue: "jp",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
      expect(parsed.data).toHaveProperty("id", "mock-id-123");
    });

    it("UT-XA-042: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_targeting_create", {
        lineItemId: "li-001",
        targetingType: "LOCATION",
        targetingValue: "jp",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-043: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_targeting_create", {
        lineItemId: "li-001",
        targetingType: "LOCATION",
        targetingValue: "jp",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-044: パラメータ不正 - targetingType 未指定でエラー", async () => {
      const result = await callTool("x_ads_targeting_create", {
        lineItemId: "li-001",
        targetingValue: "jp",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // x_ads_analytics (UT-XA-045 〜 UT-XA-048)
  // ==========================================================================
  describe("x_ads_analytics", () => {
    it("UT-XA-045: 正常系 - アナリティクスデータを取得できる", async () => {
      const result = await callTool("x_ads_analytics", {
        entityType: "CAMPAIGN",
        entityIds: "camp-001",
        startTime: "2026-03-01T00:00:00Z",
        endTime: "2026-03-31T23:59:59Z",
      });
      expect(result.isError).toBeUndefined();
      const text = extractText(result);
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty("data");
    });

    it("UT-XA-046: 認証エラー - X_ADS_API_KEY 未設定で isError: true", async () => {
      delete process.env.X_ADS_API_KEY;
      const result = await callTool("x_ads_analytics", {
        entityType: "CAMPAIGN",
        entityIds: "camp-001",
        startTime: "2026-03-01T00:00:00Z",
        endTime: "2026-03-31T23:59:59Z",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-047: レート制限 - 429 で isError: true", async () => {
      process.env.X_ADS_ACCESS_TOKEN = "rate-limited";
      const result = await callTool("x_ads_analytics", {
        entityType: "CAMPAIGN",
        entityIds: "camp-001",
        startTime: "2026-03-01T00:00:00Z",
        endTime: "2026-03-31T23:59:59Z",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });

    it("UT-XA-048: パラメータ不正 - entityType と日付未指定でエラー", async () => {
      const result = await callTool("x_ads_analytics", {
        entityIds: "camp-001",
      });
      expect(result.isError).toBe(true);
      const text = extractText(result);
      expect(text).toBeTruthy();
    });
  });
});
