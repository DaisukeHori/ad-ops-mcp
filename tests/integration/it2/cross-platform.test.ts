/**
 * IT2: クロスプラットフォーム 2ツール結合テスト（40件）
 * 異なるプラットフォーム間での2ツール連鎖実行を検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import { callTool, chainTools } from "@/tests/helpers/mcp-client";
import { clearTokenCache } from "@/lib/platforms/google-ads/auth";
import { resetTokenCache } from "@/lib/platforms/gbp/auth";

beforeEach(() => {
  clearTokenCache();
  resetTokenCache();

  // Google Ads
  process.env.GOOGLE_ADS_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_ADS_CLIENT_SECRET = "test-client-secret";
  process.env.GOOGLE_ADS_REFRESH_TOKEN = "test-refresh-token";
  process.env.GOOGLE_ADS_DEVELOPER_TOKEN = "test-dev-token";
  process.env.GOOGLE_ADS_CUSTOMER_ID = "1234567890";

  // Meta Ads
  process.env.META_ADS_ACCESS_TOKEN = "test-meta-token";
  process.env.META_ADS_ACCOUNT_ID = "123456789";

  // GBP
  process.env.GBP_CLIENT_ID = "test-gbp-client-id";
  process.env.GBP_CLIENT_SECRET = "test-gbp-client-secret";
  process.env.GBP_REFRESH_TOKEN = "test-gbp-refresh-token";
  process.env.GBP_ACCOUNT_ID = "test-account-id";

  // X Ads
  process.env.X_ADS_API_KEY = "test-api-key";
  process.env.X_ADS_API_SECRET = "test-api-secret";
  process.env.X_ADS_ACCESS_TOKEN = "test-access-token";
  process.env.X_ADS_ACCESS_SECRET = "test-access-secret";
  process.env.X_ADS_ACCOUNT_ID = "test-account-id";
});

describe("IT2-CP: Google Ads -> Meta Ads 連携", () => {
  it("IT2-CP-001: GA campaign_list -> MA campaign_list (クロスプラットフォーム比較)", async () => {
    const r1 = await callTool("google_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-002: GA report_campaign -> MA insight_campaign (クロスレポート)", async () => {
    const r1 = await callTool("google_ads_report_campaign", {
      startDate: "2026-03-01",
      endDate: "2026-03-28",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      date_preset: "last_30d",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-003: GA campaign_create -> MA campaign_create (両方に同名キャンペーン)", async () => {
    const r1 = await callTool("google_ads_campaign_create", {
      name: "マルチプラットフォームCP",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_create", {
      name: "マルチプラットフォームCP",
      objective: "OUTCOME_TRAFFIC",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-004: GA keyword_list -> MA audience_list (キーワードとオーディエンス比較)", async () => {
    const r1 = await callTool("google_ads_keyword_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_audience_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-005: GA ad_list -> MA ad_list (広告一覧クロス比較)", async () => {
    const r1 = await callTool("google_ads_ad_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-006: GA budget_create -> MA campaign_create (予算確保後にMeta展開)", async () => {
    const r1 = await callTool("google_ads_budget_create", {
      name: "クロスPF予算",
      amountMicros: 5000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_create", {
      name: "Meta展開CP",
      objective: "OUTCOME_AWARENESS",
      daily_budget: "5000",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-007: GA ad_policy_status -> MA ad_review_status (審査ステータスクロス確認)", async () => {
    const r1 = await callTool("google_ads_ad_policy_status", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_review_status", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-008: GA report_keyword -> MA insight_ad (キーワード→広告レポートクロス分析)", async () => {
    const r1 = await callTool("google_ads_report_keyword", {
      startDate: "2026-03-01",
      endDate: "2026-03-28",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_ad", {
      adId: "123456789",
      date_preset: "last_30d",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: Google Ads -> X Ads 連携", () => {
  it("IT2-CP-009: GA campaign_list -> XA campaign_list (検索広告とSNS広告の比較)", async () => {
    const r1 = await callTool("google_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-010: GA report_campaign -> XA analytics (クロスレポート)", async () => {
    const r1 = await callTool("google_ads_report_campaign", {
      startDate: "2026-03-01",
      endDate: "2026-03-28",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_analytics", {
      entityType: "CAMPAIGN",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-011: GA campaign_create -> XA campaign_create (マルチプラットフォーム展開)", async () => {
    const r1 = await callTool("google_ads_campaign_create", {
      name: "GA+XA CP",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_create", {
      name: "GA+XA CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 10000000000,
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-012: GA account_list -> XA account_list (アカウント横断確認)", async () => {
    const r1 = await callTool("google_ads_account_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_account_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-013: GA adgroup_list -> XA lineitem_list (広告グループvsラインアイテム)", async () => {
    const r1 = await callTool("google_ads_adgroup_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_list", {});
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: Google Ads -> GBP 連携", () => {
  it("IT2-CP-014: GA campaign_list -> GBP location_list (広告とGBPの横断管理)", async () => {
    const r1 = await callTool("google_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-015: GA report_campaign -> GBP insight_get (広告パフォーマンスとGBPインサイト)", async () => {
    const r1 = await callTool("google_ads_report_campaign", {
      startDate: "2026-03-01",
      endDate: "2026-03-28",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH", "WEBSITE_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-016: GA campaign_create -> GBP post_create (広告開始時にGBP投稿)", async () => {
    const r1 = await callTool("google_ads_campaign_create", {
      name: "GBP連動CP",
      budgetResourceName: "customers/1234567890/campaignBudgets/123456",
      advertisingChannelType: "SEARCH",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "新しいキャンペーンを開始しました！",
      actionType: "LEARN_MORE",
      actionUrl: "https://example.com",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-017: GA account_list -> GBP location_list (アカウントとロケーション管理)", async () => {
    const r1 = await callTool("google_ads_account_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_list", {});
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: Meta Ads -> X Ads 連携", () => {
  it("IT2-CP-018: MA campaign_list -> XA campaign_list (SNS広告クロス比較)", async () => {
    const r1 = await callTool("meta_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-019: MA insight_campaign -> XA analytics (SNS広告レポートクロス分析)", async () => {
    const r1 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      date_preset: "last_7d",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_analytics", {
      entityType: "CAMPAIGN",
      entityIds: "mock-id-123",
      startTime: "2026-03-22T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-020: MA campaign_create -> XA campaign_create (SNSマルチ展開)", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "SNS統合CP",
      objective: "OUTCOME_ENGAGEMENT",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_create", {
      name: "SNS統合CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 5000000000,
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-021: MA ad_list -> XA creative_list (広告クリエイティブクロス確認)", async () => {
    const r1 = await callTool("meta_ads_ad_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_creative_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-022: MA adset_list -> XA lineitem_list (セット/LI横断確認)", async () => {
    const r1 = await callTool("meta_ads_adset_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_lineitem_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-023: MA creative_list -> XA creative_list (クリエイティブ横断管理)", async () => {
    const r1 = await callTool("meta_ads_creative_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_creative_list", {});
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: Meta Ads -> GBP 連携", () => {
  it("IT2-CP-024: MA insight_campaign -> GBP insight_get (デジタル広告+GBPクロス分析)", async () => {
    const r1 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      date_preset: "last_30d",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_MOBILE_SEARCH", "CALL_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-025: MA campaign_create -> GBP post_create (Meta広告開始+GBP投稿)", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "GBP連携CP",
      objective: "OUTCOME_TRAFFIC",
      daily_budget: "5000",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "Facebook/Instagramで新キャンペーン開始！",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-026: MA campaign_list -> GBP review_list (広告効果とレビューの相関分析)", async () => {
    const r1 = await callTool("meta_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_review_list", {
      locationId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-027: MA image_upload -> GBP media_upload (画像のマルチPF利用)", async () => {
    const r1 = await callTool("meta_ads_image_upload", {
      image_url: "https://example.com/shared-image.jpg",
      name: "共有画像",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/shared-image.jpg",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: X Ads -> GBP 連携", () => {
  it("IT2-CP-028: XA campaign_list -> GBP location_list (X広告とGBP管理)", async () => {
    const r1 = await callTool("x_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-029: XA analytics -> GBP insight_get (X広告とGBPインサイト比較)", async () => {
    const r1 = await callTool("x_ads_analytics", {
      entityType: "CAMPAIGN",
      entityIds: "mock-id-123",
      startTime: "2026-03-01T00:00:00Z",
      endTime: "2026-03-28T23:59:59Z",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["WEBSITE_CLICKS", "BUSINESS_DIRECTION_REQUESTS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-030: XA campaign_create -> GBP post_create (X広告開始+GBP投稿)", async () => {
    const r1 = await callTool("x_ads_campaign_create", {
      name: "X+GBP CP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 5000000000,
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "X (Twitter) で新キャンペーン配信中！",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: 全プラットフォーム横断", () => {
  it("IT2-CP-031: GA account_list -> MA campaign_list (アカウント確認後にMeta確認)", async () => {
    const r1 = await callTool("google_ads_account_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-032: GA budget_list -> XA campaign_list (予算確認後にX確認)", async () => {
    const r1 = await callTool("google_ads_budget_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-033: GBP review_list -> MA campaign_create (レビュー分析後にMeta広告作成)", async () => {
    const r1 = await callTool("gbp_review_list", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_create", {
      name: "レビュー対策CP",
      objective: "OUTCOME_ENGAGEMENT",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-034: GBP insight_get -> GA campaign_update (GBPインサイト→GA広告調整)", async () => {
    const r1 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("google_ads_campaign_update", {
      campaignId: "123456",
      status: "ENABLED",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-CP-035: GBP location_list -> XA campaign_create (ロケーション確認後にX広告)", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("x_ads_campaign_create", {
      name: "ローカル連動XCP",
      fundingInstrumentId: "fi-001",
      dailyBudgetAmountLocalMicro: 3000000000,
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-CP: chainTools によるクロスプラットフォーム連鎖", () => {
  it("IT2-CP-036: chainTools で GA campaign_list -> MA campaign_list", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
    expect(results).toHaveLength(2);
  });

  it("IT2-CP-037: chainTools で GA report_campaign -> XA analytics", async () => {
    const results = await chainTools([
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "x_ads_analytics", args: { entityType: "CAMPAIGN", entityIds: "mock-id-123", startTime: "2026-03-01T00:00:00Z", endTime: "2026-03-28T23:59:59Z" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-CP-038: chainTools で MA insight_campaign -> GBP insight_get", async () => {
    const results = await chainTools([
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "last_30d" } },
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["WEBSITE_CLICKS"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-CP-039: chainTools で GBP review_list -> GBP review_reply (同PF)", async () => {
    const results = await chainTools([
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      { tool: "gbp_review_reply", args: { locationId: "123456789", reviewId: "review-001", comment: "レビューありがとうございます！" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-CP-040: chainTools で XA campaign_create -> MA campaign_create", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_create", args: { name: "クロスPF CP", fundingInstrumentId: "fi-001", dailyBudgetAmountLocalMicro: 5000000000 } },
      { tool: "meta_ads_campaign_create", args: { name: "クロスPF CP", objective: "OUTCOME_TRAFFIC" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });
});
