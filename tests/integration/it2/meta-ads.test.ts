/**
 * IT2: Meta Ads 2ツール結合テスト（50件）
 * 2つのツールを連鎖実行し、両方がエラーなく動作することを検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import { callTool, chainTools } from "@/tests/helpers/mcp-client";

beforeEach(() => {
  process.env.META_ADS_ACCESS_TOKEN = "test-meta-token";
  process.env.META_ADS_ACCOUNT_ID = "123456789";
});

describe("IT2-MA: キャンペーン CRUD 連携", () => {
  it("IT2-MA-001: campaign_create -> campaign_list", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "テストキャンペーン",
      objective: "OUTCOME_TRAFFIC",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-002: campaign_create -> campaign_get", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "取得テストCP",
      objective: "OUTCOME_AWARENESS",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_get", {
      campaignId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-003: campaign_create -> campaign_update", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "更新テストCP",
      objective: "OUTCOME_ENGAGEMENT",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_update", {
      campaignId: "123456789",
      status: "ACTIVE",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-004: campaign_list -> campaign_get", async () => {
    const r1 = await callTool("meta_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_get", {
      campaignId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-005: campaign_list -> campaign_update", async () => {
    const r1 = await callTool("meta_ads_campaign_list", { status: "ACTIVE" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_update", {
      campaignId: "123456789",
      name: "更新後CP名",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-006: campaign_get -> campaign_update", async () => {
    const r1 = await callTool("meta_ads_campaign_get", {
      campaignId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_update", {
      campaignId: "123456789",
      daily_budget: "10000",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: キャンペーン -> 広告セット 連携", () => {
  it("IT2-MA-007: campaign_create -> adset_create", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "広告セット用CP",
      objective: "OUTCOME_TRAFFIC",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_create", {
      name: "テスト広告セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      daily_budget: "5000",
      targeting: '{"geo_locations":{"countries":["JP"]},"age_min":25,"age_max":55}',
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-008: campaign_list -> adset_list", async () => {
    const r1 = await callTool("meta_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_list", { campaign_id: "123456789" });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-009: campaign_get -> adset_list", async () => {
    const r1 = await callTool("meta_ads_campaign_get", { campaignId: "123456789" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_list", {});
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: 広告セット CRUD 連携", () => {
  it("IT2-MA-010: adset_create -> adset_list", async () => {
    const r1 = await callTool("meta_ads_adset_create", {
      name: "リストテスト広告セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "REACH",
      daily_budget: "3000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-011: adset_create -> adset_get", async () => {
    const r1 = await callTool("meta_ads_adset_create", {
      name: "詳細取得テスト",
      campaign_id: "123456789",
      billing_event: "LINK_CLICKS",
      optimization_goal: "LINK_CLICKS",
      daily_budget: "5000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_get", {
      adsetId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-012: adset_create -> adset_update", async () => {
    const r1 = await callTool("meta_ads_adset_create", {
      name: "更新テスト広告セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "IMPRESSIONS",
      daily_budget: "2000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      daily_budget: "8000",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-013: adset_list -> adset_get", async () => {
    const r1 = await callTool("meta_ads_adset_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_get", { adsetId: "123456789" });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-014: adset_list -> adset_update", async () => {
    const r1 = await callTool("meta_ads_adset_list", { status: "PAUSED" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      status: "ACTIVE",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-015: adset_get -> adset_update", async () => {
    const r1 = await callTool("meta_ads_adset_get", { adsetId: "123456789" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      name: "更新後広告セット名",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: 広告セット -> 広告 連携", () => {
  it("IT2-MA-016: adset_create -> ad_create", async () => {
    const r1 = await callTool("meta_ads_adset_create", {
      name: "広告作成用セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      daily_budget: "5000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_create", {
      name: "テスト広告",
      adset_id: "123456789",
      creative_id: "111222333",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-017: adset_list -> ad_list", async () => {
    const r1 = await callTool("meta_ads_adset_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_list", { adset_id: "123456789" });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: 広告 CRUD 連携", () => {
  it("IT2-MA-018: ad_create -> ad_list", async () => {
    const r1 = await callTool("meta_ads_ad_create", {
      name: "リストテスト広告",
      adset_id: "123456789",
      creative_id: "111222333",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-019: ad_create -> ad_get", async () => {
    const r1 = await callTool("meta_ads_ad_create", {
      name: "詳細取得テスト広告",
      adset_id: "123456789",
      creative_id: "111222333",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_get", { adId: "123456789" });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-020: ad_create -> ad_update", async () => {
    const r1 = await callTool("meta_ads_ad_create", {
      name: "更新テスト広告",
      adset_id: "123456789",
      creative_id: "111222333",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_update", {
      adId: "123456789",
      status: "ACTIVE",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-021: ad_list -> ad_get", async () => {
    const r1 = await callTool("meta_ads_ad_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_get", { adId: "123456789" });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-022: ad_list -> ad_update", async () => {
    const r1 = await callTool("meta_ads_ad_list", { status: "PAUSED" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_update", {
      adId: "123456789",
      name: "更新後広告名",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-023: ad_get -> ad_update", async () => {
    const r1 = await callTool("meta_ads_ad_get", { adId: "123456789" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_update", {
      adId: "123456789",
      creative_id: "999888777",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: クリエイティブ連携", () => {
  it("IT2-MA-024: creative_create -> ad_create", async () => {
    const r1 = await callTool("meta_ads_creative_create", {
      name: "テストクリエイティブ",
      object_story_spec: '{"page_id":"123","link_data":{"message":"テスト","link":"https://example.com","image_hash":"abc123"}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_create", {
      name: "クリエイティブ使用広告",
      adset_id: "123456789",
      creative_id: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-025: creative_create -> creative_list", async () => {
    const r1 = await callTool("meta_ads_creative_create", {
      name: "リスト確認用クリエイティブ",
      object_story_spec: '{"page_id":"123","link_data":{"message":"テスト","link":"https://example.com"}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_creative_list", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-026: creative_list -> ad_create", async () => {
    const r1 = await callTool("meta_ads_creative_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_create", {
      name: "リスト後の広告作成",
      adset_id: "123456789",
      creative_id: "111222333",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-027: image_upload -> creative_create", async () => {
    const r1 = await callTool("meta_ads_image_upload", {
      image_url: "https://example.com/image.jpg",
      name: "テスト画像",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_creative_create", {
      name: "画像使用クリエイティブ",
      object_story_spec: '{"page_id":"123","link_data":{"message":"画像テスト","link":"https://example.com","image_hash":"abc123"}}',
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: インサイト連携", () => {
  it("IT2-MA-028: campaign_list -> insight_campaign", async () => {
    const r1 = await callTool("meta_ads_campaign_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      date_preset: "last_7d",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-029: campaign_get -> insight_campaign", async () => {
    const r1 = await callTool("meta_ads_campaign_get", { campaignId: "123456789" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      time_range_since: "2026-03-01",
      time_range_until: "2026-03-28",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-030: adset_list -> insight_adset", async () => {
    const r1 = await callTool("meta_ads_adset_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_adset", {
      adsetId: "123456789",
      date_preset: "last_30d",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-031: adset_get -> insight_adset", async () => {
    const r1 = await callTool("meta_ads_adset_get", { adsetId: "123456789" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_adset", {
      adsetId: "123456789",
      date_preset: "last_7d",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-032: ad_list -> insight_ad", async () => {
    const r1 = await callTool("meta_ads_ad_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_ad", {
      adId: "123456789",
      date_preset: "last_7d",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-033: ad_get -> insight_ad", async () => {
    const r1 = await callTool("meta_ads_ad_get", { adId: "123456789" });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_ad", {
      adId: "123456789",
      time_range_since: "2026-03-01",
      time_range_until: "2026-03-28",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-034: insight_campaign -> campaign_update", async () => {
    const r1 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      date_preset: "last_7d",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_campaign_update", {
      campaignId: "123456789",
      daily_budget: "15000",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-035: insight_adset -> adset_update", async () => {
    const r1 = await callTool("meta_ads_insight_adset", {
      adsetId: "123456789",
      date_preset: "last_30d",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      bid_amount: "500",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: レビュー・オーディエンス連携", () => {
  it("IT2-MA-036: ad_create -> ad_review_status", async () => {
    const r1 = await callTool("meta_ads_ad_create", {
      name: "レビュー確認用広告",
      adset_id: "123456789",
      creative_id: "111222333",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_review_status", {
      adId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-037: ad_list -> ad_review_status", async () => {
    const r1 = await callTool("meta_ads_ad_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_review_status", {});
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-038: audience_list -> adset_create", async () => {
    const r1 = await callTool("meta_ads_audience_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_create", {
      name: "オーディエンス利用セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "CONVERSIONS",
      daily_budget: "10000",
      targeting: '{"geo_locations":{"countries":["JP"]},"custom_audiences":[{"id":"123"}]}',
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-039: audience_list -> adset_update", async () => {
    const r1 = await callTool("meta_ads_audience_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      targeting: '{"geo_locations":{"countries":["JP"]},"custom_audiences":[{"id":"456"}]}',
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: chainTools による連鎖実行", () => {
  it("IT2-MA-040: chainTools で campaign_create -> adset_create", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_create", args: { name: "チェーンCP", objective: "OUTCOME_TRAFFIC" } },
      { tool: "meta_ads_adset_create", args: { name: "チェーン広告セット", campaign_id: "123456789", billing_event: "IMPRESSIONS", optimization_goal: "LINK_CLICKS", daily_budget: "5000", targeting: '{"geo_locations":{"countries":["JP"]}}' } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-MA-041: chainTools で adset_create -> ad_create", async () => {
    const results = await chainTools([
      { tool: "meta_ads_adset_create", args: { name: "チェーン広告セット2", campaign_id: "123456789", billing_event: "IMPRESSIONS", optimization_goal: "REACH", daily_budget: "3000", targeting: '{"geo_locations":{"countries":["JP"]}}' } },
      { tool: "meta_ads_ad_create", args: { name: "チェーン広告", adset_id: "123456789", creative_id: "111222333" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-MA-042: chainTools で creative_create -> ad_create", async () => {
    const results = await chainTools([
      { tool: "meta_ads_creative_create", args: { name: "チェーンCR", object_story_spec: '{"page_id":"123","link_data":{"message":"test","link":"https://example.com"}}' } },
      { tool: "meta_ads_ad_create", args: { name: "チェーンAD", adset_id: "123456789", creative_id: "123456789" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });
});

describe("IT2-MA: 目的別キャンペーンバリエーション", () => {
  it("IT2-MA-043: campaign_create (OUTCOME_LEADS) -> adset_create", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "リード獲得CP",
      objective: "OUTCOME_LEADS",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_create", {
      name: "リード獲得セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LEAD_GENERATION",
      daily_budget: "8000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-044: campaign_create (OUTCOME_SALES) -> adset_create", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "売上CP",
      objective: "OUTCOME_SALES",
      bid_strategy: "COST_CAP",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_create", {
      name: "売上セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "CONVERSIONS",
      daily_budget: "20000",
      targeting: '{"geo_locations":{"countries":["JP"]},"age_min":18,"age_max":65}',
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-045: campaign_create (with budget) -> insight_campaign", async () => {
    const r1 = await callTool("meta_ads_campaign_create", {
      name: "予算付きCP",
      objective: "OUTCOME_TRAFFIC",
      daily_budget: "5000",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_campaign", {
      campaignId: "123456789",
      date_preset: "last_7d",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: ターゲティング・予算バリエーション", () => {
  it("IT2-MA-046: adset_create (lifetime_budget) -> adset_update", async () => {
    const r1 = await callTool("meta_ads_adset_create", {
      name: "通算予算セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "REACH",
      lifetime_budget: "100000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
      end_time: "2026-04-30T23:59:59+0900",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      lifetime_budget: "150000",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-047: adset_create -> insight_adset (ブレイクダウン付き)", async () => {
    const r1 = await callTool("meta_ads_adset_create", {
      name: "ブレイクダウン確認セット",
      campaign_id: "123456789",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      daily_budget: "5000",
      targeting: '{"geo_locations":{"countries":["JP"]}}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_adset", {
      adsetId: "123456789",
      date_preset: "last_7d",
      breakdowns: "age,gender",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-048: adset_update (ターゲティング変更) -> insight_adset", async () => {
    const r1 = await callTool("meta_ads_adset_update", {
      adsetId: "123456789",
      targeting: '{"geo_locations":{"countries":["JP","US"]},"age_min":20,"age_max":45}',
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_insight_adset", {
      adsetId: "123456789",
      date_preset: "last_30d",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-MA: 画像・クリエイティブ連携", () => {
  it("IT2-MA-049: image_upload -> creative_list", async () => {
    const r1 = await callTool("meta_ads_image_upload", {
      image_url: "https://example.com/banner.png",
      name: "バナー画像",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_creative_list", { limit: 10 });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-MA-050: creative_create (CTA付き) -> ad_create", async () => {
    const r1 = await callTool("meta_ads_creative_create", {
      name: "CTA付きクリエイティブ",
      object_story_spec: '{"page_id":"123","link_data":{"message":"今すぐ購入","link":"https://example.com/shop","image_hash":"def456"}}',
      call_to_action_type: "SHOP_NOW",
      url_tags: "utm_source=facebook&utm_medium=cpc",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("meta_ads_ad_create", {
      name: "CTA付き広告",
      adset_id: "123456789",
      creative_id: "123456789",
      status: "ACTIVE",
    });
    expect(r2.isError).toBeFalsy();
  });
});
