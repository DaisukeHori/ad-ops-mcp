/**
 * IT3 クロスプラットフォーム結合テスト
 * 3つ以上のツールを異なるプラットフォーム間で連鎖実行する
 * IT3-CP-001 〜 IT3-CP-080
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { callTool, chainTools } from "@/tests/helpers/mcp-client";
import { clearTokenCache } from "@/lib/platforms/google-ads/auth";
import { resetTokenCache } from "@/lib/platforms/gbp/auth";

describe("IT3 クロスプラットフォーム", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.GOOGLE_ADS_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_ADS_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_ADS_REFRESH_TOKEN = "test-refresh-token";
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN = "test-dev-token";
    process.env.GOOGLE_ADS_CUSTOMER_ID = "1234567890";
    process.env.META_ADS_ACCESS_TOKEN = "test-meta-token";
    process.env.META_ADS_ACCOUNT_ID = "123456789";
    process.env.GBP_CLIENT_ID = "test-gbp-client-id";
    process.env.GBP_CLIENT_SECRET = "test-gbp-client-secret";
    process.env.GBP_REFRESH_TOKEN = "test-gbp-refresh-token";
    process.env.GBP_ACCOUNT_ID = "test-account-id";
    process.env.X_ADS_API_KEY = "test-api-key";
    process.env.X_ADS_API_SECRET = "test-api-secret";
    process.env.X_ADS_ACCESS_TOKEN = "test-access-token";
    process.env.X_ADS_ACCESS_SECRET = "test-access-secret";
    process.env.X_ADS_ACCOUNT_ID = "test-account-id";
    clearTokenCache();
    resetTokenCache();
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("IT3-CP-001: Google→Meta→X キャンペーン一覧横断", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "x_ads_campaign_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-002: Google レポート→Meta インサイト→GBP インサイト", async () => {
    const results = await chainTools([
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789" } },
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["WEBSITE_CLICKS"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-003: Google アカウント→Meta オーディエンス→X アカウント", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "meta_ads_audience_list", args: {} },
      { tool: "x_ads_account_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-004: Google 予算作成→Meta キャンペーン作成→X キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "テスト予算", amountMicros: 1000000000 } },
      { tool: "meta_ads_campaign_create", args: { name: "テスト", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "テスト", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-005: GBP ロケーション→Google キャンペーン→Meta キャンペーン", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-006: Google 広告→Meta 広告→X クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "x_ads_creative_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-007: Google KWリスト→Meta オーディエンス→X ターゲティング", async () => {
    const results = await chainTools([
      { tool: "google_ads_keyword_list", args: {} },
      { tool: "meta_ads_audience_list", args: {} },
      { tool: "x_ads_targeting_list", args: { accountId: "test-account-id", lineItemIds: "mock-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-008: Google 予算一覧→Meta キャンペーン一覧→GBP レビュー", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-009: GBP 投稿作成→Google キャンペーン作成→Meta キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "テスト", topicType: "STANDARD" } },
      { tool: "google_ads_campaign_create", args: { name: "テスト", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "meta_ads_campaign_create", args: { name: "テスト", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-010: X アナリティクス→Google レポート→Meta インサイト", async () => {
    const results = await chainTools([
      { tool: "x_ads_analytics", args: { accountId: "test-account-id", entityType: "CAMPAIGN", entityIds: "mock-id", startTime: "2026-03-01", endTime: "2026-03-28", granularity: "DAY", placement: "ALL_ON_TWITTER" } },
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-011: Google→Meta→GBP→X 全プラットフォーム一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "gbp_location_list", args: {} },
      { tool: "x_ads_campaign_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-012: Google アカウント→GBP ロケーション→X アカウント", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "gbp_location_list", args: {} },
      { tool: "x_ads_account_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-013: Meta 広告セット一覧→Google 広告グループ→X ラインアイテム", async () => {
    const results = await chainTools([
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "google_ads_adgroup_list", args: {} },
      { tool: "x_ads_lineitem_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-014: Google キャンペーン作成→Meta アドセット作成→X ラインアイテム作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_create", args: { name: "テスト", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "meta_ads_adset_create", args: { campaign_id: "123456789", name: "テスト", billing_event: "IMPRESSIONS", optimization_goal: "REACH", targeting: "{\"geo_locations\":{\"countries\":[\"JP\"]}}", daily_budget: "1000", start_time: "2026-04-01T00:00:00+0900" } },
      { tool: "x_ads_lineitem_create", args: { accountId: "test-account-id", campaignId: "mock-id-123", name: "テスト", placements: ["ALL_ON_TWITTER"], objective: "ENGAGEMENTS", bidAmountLocalMicro: 1000000 } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-015: GBP インサイト→Google レポート→X アナリティクス", async () => {
    const results = await chainTools([
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["WEBSITE_CLICKS"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "x_ads_analytics", args: { accountId: "test-account-id", entityType: "CAMPAIGN", entityIds: "mock-id", startTime: "2026-03-01", endTime: "2026-03-28", granularity: "DAY", placement: "ALL_ON_TWITTER" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-016: Google 広告ポリシー→Meta 広告レビュー→X クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_policy_status", args: {} },
      { tool: "meta_ads_ad_review_status", args: {} },
      { tool: "x_ads_creative_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-017: Meta クリエイティブ一覧→Google 広告一覧→X クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_creative_list", args: {} },
      { tool: "google_ads_ad_list", args: {} },
      { tool: "x_ads_creative_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-018: GBP ロケーション→レビュー→Google キャンペーン一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      { tool: "google_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-019: Google KW追加→Meta 広告作成→GBP 投稿作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_keyword_add", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", keywords: [{ text: "テスト", matchType: "BROAD" }] } },
      { tool: "meta_ads_ad_create", args: { adset_id: "123456789", name: "テスト", creative_id: "123456789", status: "PAUSED" } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "テスト投稿", topicType: "STANDARD" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-020: X キャンペーン作成→Google キャンペーン作成→Meta キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "テスト", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
      { tool: "google_ads_campaign_create", args: { name: "テスト", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "meta_ads_campaign_create", args: { name: "テスト", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-021: Google 広告グループ一覧→Meta 広告セット一覧→GBP 投稿一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_adgroup_list", args: {} },
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-022: Meta インサイト→GBP インサイト→Google レポート", async () => {
    const results = await chainTools([
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789" } },
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["CALL_CLICKS"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
      { tool: "google_ads_report_keyword", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-023: X アカウント→X キャンペーン→Google キャンペーン→Meta キャンペーン", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      { tool: "x_ads_campaign_list", args: { accountId: "test-account-id" } },
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-024: GBP メディア→Google 広告作成→Meta クリエイティブ作成", async () => {
    const results = await chainTools([
      { tool: "gbp_media_upload", args: { locationId: "123456789", mediaFormat: "PHOTO", sourceUrl: "https://example.com/photo.jpg", category: "EXTERIOR" } },
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "見出し1" }, { text: "見出し2" }, { text: "見出し3" }], descriptions: [{ text: "説明1" }, { text: "説明2" }], finalUrls: ["https://example.com"] } },
      { tool: "meta_ads_creative_create", args: { name: "テスト", object_story_spec: "{\"page_id\":\"123\",\"link_data\":{\"link\":\"https://example.com\",\"message\":\"テスト\"}}" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-025: Google 予算→キャンペーン→Meta キャンペーン→アドセット", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "予算", amountMicros: 1000000000 } },
      { tool: "google_ads_campaign_create", args: { name: "テスト", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "meta_ads_campaign_create", args: { name: "テスト", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
      { tool: "meta_ads_adset_create", args: { campaign_id: "123456789", name: "テスト", billing_event: "IMPRESSIONS", optimization_goal: "REACH", targeting: "{\"geo_locations\":{\"countries\":[\"JP\"]}}", daily_budget: "1000", start_time: "2026-04-01T00:00:00+0900" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-026: GBP レビュー返信→Google KW一覧→Meta 広告一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_review_reply", args: { locationId: "123456789", reviewId: "review-123", comment: "ありがとう" } },
      { tool: "google_ads_keyword_list", args: {} },
      { tool: "meta_ads_ad_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-027: X ターゲティング作成→Google KW追加→Meta オーディエンス", async () => {
    const results = await chainTools([
      { tool: "x_ads_targeting_create", args: { accountId: "test-account-id", lineItemId: "mock-id", targetingType: "LOCATION", targetingValue: "JP" } },
      { tool: "google_ads_keyword_add", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", keywords: [{ text: "テスト", matchType: "EXACT" }] } },
      { tool: "meta_ads_audience_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-028: Google キャンペーン更新→Meta キャンペーン更新→X キャンペーン更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_update", args: { campaignId: "123456", status: "PAUSED" } },
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", status: "PAUSED" } },
      { tool: "x_ads_campaign_update", args: { accountId: "test-account-id", campaignId: "mock-id", entityStatus: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-029: Google 広告グループ作成→Meta 広告セット作成→X ラインアイテム作成→GBP 投稿", async () => {
    const results = await chainTools([
      { tool: "google_ads_adgroup_create", args: { campaignResourceName: "customers/1234567890/campaigns/123456", name: "テスト" } },
      { tool: "meta_ads_adset_create", args: { campaign_id: "123456789", name: "テスト", billing_event: "IMPRESSIONS", optimization_goal: "REACH", targeting: "{\"geo_locations\":{\"countries\":[\"JP\"]}}", daily_budget: "1000", start_time: "2026-04-01T00:00:00+0900" } },
      { tool: "x_ads_lineitem_create", args: { accountId: "test-account-id", campaignId: "mock-id-123", name: "テスト", placements: ["ALL_ON_TWITTER"], objective: "ENGAGEMENTS", bidAmountLocalMicro: 1000000 } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "新サービス", topicType: "STANDARD" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-030: Google 予算一覧→Meta キャンペーン一覧→X アカウント一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "x_ads_account_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-031: Meta 画像アップ→Google 広告作成→X クリエイティブ作成", async () => {
    const results = await chainTools([
      { tool: "meta_ads_image_upload", args: { image_url: "https://example.com/img.jpg" } },
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "H1" }, { text: "H2" }, { text: "H3" }], descriptions: [{ text: "D1" }, { text: "D2" }], finalUrls: ["https://example.com"] } },
      { tool: "x_ads_creative_create", args: { accountId: "test-account-id", lineItemId: "mock-li-id", tweetId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-032: GBP ロケーション更新→Google キャンペーン更新→Meta 広告更新", async () => {
    const results = await chainTools([
      { tool: "gbp_location_update", args: { locationId: "123456789", updateMask: "websiteUri", websiteUri: "https://example.com" } },
      { tool: "google_ads_campaign_update", args: { campaignId: "123456", status: "ENABLED" } },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", status: "ACTIVE" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-033: Google KWレポート→Meta AdSetインサイト→X アナリティクス", async () => {
    const results = await chainTools([
      { tool: "google_ads_report_keyword", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789" } },
      { tool: "x_ads_analytics", args: { accountId: "test-account-id", entityType: "CAMPAIGN", entityIds: "id1", startTime: "2026-03-01", endTime: "2026-03-28", granularity: "DAY", placement: "ALL_ON_TWITTER" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-034: Google 広告更新→Meta 広告セット更新→X ラインアイテム更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_update", args: { adGroupId: "123456", adId: "789", status: "PAUSED" } },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", status: "PAUSED" } },
      { tool: "x_ads_lineitem_update", args: { accountId: "test-account-id", lineItemId: "mock-id", entityStatus: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-035: GBP ロケーション一覧→詳細→Google キャンペーン一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "google_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-036: Meta キャンペーンGet→Google キャンペーンGet→X キャンペーン一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_get", args: { campaignId: "123456789" } },
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "x_ads_campaign_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-037: Google 広告グループ更新→Meta 広告更新→GBP ロケーション更新", async () => {
    const results = await chainTools([
      { tool: "google_ads_adgroup_update", args: { adGroupId: "123456", status: "PAUSED" } },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", status: "PAUSED" } },
      { tool: "gbp_location_update", args: { locationId: "123456789", updateMask: "websiteUri", websiteUri: "https://new.com" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-038: X ラインアイテム一覧→Google 広告グループ一覧→Meta 広告セット一覧→GBP 投稿一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_lineitem_list", args: { accountId: "test-account-id" } },
      { tool: "google_ads_adgroup_list", args: {} },
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-039: Google 予算作成→予算更新→Meta キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "新予算", amountMicros: 2000000000 } },
      { tool: "google_ads_budget_update", args: { budgetId: "123456", amountMicros: 3000000000 } },
      { tool: "meta_ads_campaign_create", args: { name: "連携キャンペーン", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-040: Meta インサイト(ad)→Google レポート→GBP インサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_insight_ad", args: { adId: "123456789" } },
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-041: GBP 投稿削除→Google KW削除→Meta キャンペーン更新", async () => {
    const results = await chainTools([
      { tool: "gbp_post_delete", args: { locationId: "123456789", postId: "456" } },
      { tool: "google_ads_keyword_remove", args: { adGroupId: "123456", criterionIds: ["789"] } },
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-042: X クリエイティブ作成→X ターゲティング→Google 広告作成", async () => {
    const results = await chainTools([
      { tool: "x_ads_creative_create", args: { accountId: "test-account-id", lineItemId: "mock-li-id", tweetId: "111" } },
      { tool: "x_ads_targeting_create", args: { accountId: "test-account-id", lineItemId: "mock-id", targetingType: "LOCATION", targetingValue: "JP" } },
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "A" }, { text: "B" }, { text: "C" }], descriptions: [{ text: "D1" }, { text: "D2" }], finalUrls: ["https://example.com"] } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-043: Google アカウント→Meta キャンペーンGet→X キャンペーン一覧→GBP ロケーション", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "meta_ads_campaign_get", args: { campaignId: "123456789" } },
      { tool: "x_ads_campaign_list", args: { accountId: "test-account-id" } },
      { tool: "gbp_location_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-044: Google 広告一覧→Meta 広告一覧→Meta 広告Get→X クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_get", args: { adId: "123456789" } },
      { tool: "x_ads_creative_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-045: GBP レビュー一覧→返信→Google 広告ポリシー", async () => {
    const results = await chainTools([
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      { tool: "gbp_review_reply", args: { locationId: "123456789", reviewId: "review-123", comment: "感謝" } },
      { tool: "google_ads_ad_policy_status", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-046: Meta 広告セットGet→Google 広告グループ一覧→X ラインアイテム一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_adset_get", args: { adsetId: "123456789" } },
      { tool: "google_ads_adgroup_list", args: {} },
      { tool: "x_ads_lineitem_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-047: Google 予算一覧→キャンペーン一覧→Meta キャンペーン一覧→GBP 投稿一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_list", args: {} },
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-048: X アカウント→キャンペーン作成→ラインアイテム作成→Meta キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "x_ads_account_list", args: {} },
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "テスト", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
      { tool: "x_ads_lineitem_create", args: { accountId: "test-account-id", campaignId: "mock-id-123", name: "テスト", placements: ["ALL_ON_TWITTER"], objective: "ENGAGEMENTS", bidAmountLocalMicro: 1000000 } },
      { tool: "meta_ads_campaign_create", args: { name: "並行", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-049: Google KW一覧→KWレポート→Meta インサイトキャンペーン", async () => {
    const results = await chainTools([
      { tool: "google_ads_keyword_list", args: {} },
      { tool: "google_ads_report_keyword", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-050: GBP メディア→投稿作成→Google 広告作成", async () => {
    const results = await chainTools([
      { tool: "gbp_media_upload", args: { locationId: "123456789", mediaFormat: "PHOTO", sourceUrl: "https://example.com/img.jpg", category: "EXTERIOR" } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "新メニュー", topicType: "STANDARD" } },
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "H1" }, { text: "H2" }, { text: "H3" }], descriptions: [{ text: "D1" }, { text: "D2" }], finalUrls: ["https://example.com"] } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-051: Meta クリエイティブ作成→広告作成→Google 広告作成", async () => {
    const results = await chainTools([
      { tool: "meta_ads_creative_create", args: { name: "CR1", object_story_spec: "{\"page_id\":\"1\",\"link_data\":{\"link\":\"https://example.com\",\"message\":\"hi\"}}" } },
      { tool: "meta_ads_ad_create", args: { adset_id: "123456789", name: "広告1", creative_id: "123456789", status: "PAUSED" } },
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "H1" }, { text: "H2" }, { text: "H3" }], descriptions: [{ text: "D1" }, { text: "D2" }], finalUrls: ["https://example.com"] } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-052: X ターゲティング一覧→Google KW一覧→Meta オーディエンス一覧", async () => {
    const results = await chainTools([
      { tool: "x_ads_targeting_list", args: { accountId: "test-account-id", lineItemIds: "mock-id" } },
      { tool: "google_ads_keyword_list", args: {} },
      { tool: "meta_ads_audience_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-053: Google キャンペーン作成→広告グループ作成→Meta キャンペーン作成→X キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_create", args: { name: "GA", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "google_ads_adgroup_create", args: { campaignResourceName: "customers/1234567890/campaigns/123456", name: "AG" } },
      { tool: "meta_ads_campaign_create", args: { name: "META", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "X", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-054: GBP ロケーション→投稿→Meta 広告→X クリエイティブ", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "テスト", topicType: "STANDARD" } },
      { tool: "meta_ads_ad_create", args: { adset_id: "123456789", name: "Ad", creative_id: "123", status: "PAUSED" } },
      { tool: "x_ads_creative_create", args: { accountId: "test-account-id", lineItemId: "mock-li-id", tweetId: "111" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-055: Google レポート→KWレポート→Meta インサイト", async () => {
    const results = await chainTools([
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "google_ads_report_keyword", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-056: Meta 広告一覧→広告Get→Google 広告ポリシー→X クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_get", args: { adId: "123456789" } },
      { tool: "google_ads_ad_policy_status", args: {} },
      { tool: "x_ads_creative_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-057: GBP インサイト→レビュー→Google キャンペーン更新", async () => {
    const results = await chainTools([
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["CALL_CLICKS"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      { tool: "google_ads_campaign_update", args: { campaignId: "123456", status: "ENABLED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-058: X キャンペーン更新→ラインアイテム更新→Google 広告グループ更新→Meta 広告セット更新", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_update", args: { accountId: "test-account-id", campaignId: "mock-id", entityStatus: "PAUSED" } },
      { tool: "x_ads_lineitem_update", args: { accountId: "test-account-id", lineItemId: "mock-id", entityStatus: "PAUSED" } },
      { tool: "google_ads_adgroup_update", args: { adGroupId: "123456", status: "PAUSED" } },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-059: Google 予算作成→キャンペーン→X キャンペーン→GBP 投稿", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "B1", amountMicros: 500000000 } },
      { tool: "google_ads_campaign_create", args: { name: "C1", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "XC", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "告知", topicType: "STANDARD" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-060: Meta キャンペーン一覧→広告セット一覧→広告一覧→Google 広告一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "google_ads_ad_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-061: Google キャンペーン一覧→広告グループ→KW→X ターゲティング一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "google_ads_adgroup_list", args: {} },
      { tool: "google_ads_keyword_list", args: {} },
      { tool: "x_ads_targeting_list", args: { accountId: "test-account-id", lineItemIds: "mock-id" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-062: GBP ロケーション詳細→更新→Google 広告作成", async () => {
    const results = await chainTools([
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "gbp_location_update", args: { locationId: "123456789", updateMask: "websiteUri", websiteUri: "https://new.example.com" } },
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "新URL" }, { text: "H2" }, { text: "H3" }], descriptions: [{ text: "D1" }, { text: "D2" }], finalUrls: ["https://new.example.com"] } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-063: Meta 画像アップ→クリエイティブ作成→広告作成→X クリエイティブ作成", async () => {
    const results = await chainTools([
      { tool: "meta_ads_image_upload", args: { image_url: "https://example.com/img.jpg" } },
      { tool: "meta_ads_creative_create", args: { name: "CR", object_story_spec: "{\"page_id\":\"1\",\"link_data\":{\"link\":\"https://example.com\",\"message\":\"hi\"}}" } },
      { tool: "meta_ads_ad_create", args: { adset_id: "123", name: "Ad", creative_id: "123", status: "PAUSED" } },
      { tool: "x_ads_creative_create", args: { accountId: "test-account-id", lineItemId: "mock-li-id", tweetId: "111" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-064: Google 予算一覧→Meta オーディエンス→X アカウント→GBP ロケーション", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_list", args: {} },
      { tool: "meta_ads_audience_list", args: {} },
      { tool: "x_ads_account_list", args: {} },
      { tool: "gbp_location_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-065: Google 広告ポリシー→Meta レビュー→GBP レビュー一覧", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_policy_status", args: {} },
      { tool: "meta_ads_ad_review_status", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-066: X アナリティクス→Meta インサイトAd→Google レポートKW", async () => {
    const results = await chainTools([
      { tool: "x_ads_analytics", args: { accountId: "test-account-id", entityType: "LINE_ITEM", entityIds: "id1", startTime: "2026-03-01", endTime: "2026-03-28", granularity: "DAY", placement: "ALL_ON_TWITTER" } },
      { tool: "meta_ads_insight_ad", args: { adId: "123456789" } },
      { tool: "google_ads_report_keyword", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-067: Google キャンペーン作成→Meta キャンペーン作成→GBP 投稿→X キャンペーン作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_create", args: { name: "GA", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "meta_ads_campaign_create", args: { name: "MA", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "告知", topicType: "STANDARD" } },
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "XA", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-068: GBP ロケーション→投稿一覧→Meta クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
      { tool: "meta_ads_creative_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-069: Google KW追加→KW削除→Meta 広告セット作成", async () => {
    const results = await chainTools([
      { tool: "google_ads_keyword_add", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", keywords: [{ text: "テスト", matchType: "BROAD" }] } },
      { tool: "google_ads_keyword_remove", args: { adGroupId: "123456", criterionIds: ["789"] } },
      { tool: "meta_ads_adset_create", args: { campaign_id: "123456789", name: "セット", billing_event: "IMPRESSIONS", optimization_goal: "REACH", targeting: "{\"geo_locations\":{\"countries\":[\"JP\"]}}", daily_budget: "1000", start_time: "2026-04-01T00:00:00+0900" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-070: X キャンペーン→ラインアイテム→ターゲティング→Google KW追加", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "XC", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
      { tool: "x_ads_lineitem_create", args: { accountId: "test-account-id", campaignId: "mock-id-123", name: "LI", placements: ["ALL_ON_TWITTER"], objective: "ENGAGEMENTS", bidAmountLocalMicro: 1000000 } },
      { tool: "x_ads_targeting_create", args: { accountId: "test-account-id", lineItemId: "mock-id", targetingType: "LOCATION", targetingValue: "JP" } },
      { tool: "google_ads_keyword_add", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", keywords: [{ text: "並行KW", matchType: "EXACT" }] } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-071: 全プラットフォーム レポート/インサイト横断", async () => {
    const results = await chainTools([
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789" } },
      { tool: "gbp_insight_get", args: { locationId: "123456789", dailyMetrics: ["WEBSITE_CLICKS", "CALL_CLICKS"], dailyRange: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } } } },
      { tool: "x_ads_analytics", args: { accountId: "test-account-id", entityType: "CAMPAIGN", entityIds: "id1", startTime: "2026-03-01", endTime: "2026-03-28", granularity: "DAY", placement: "ALL_ON_TWITTER" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-072: Google 広告作成→Meta クリエイティブ→X クリエイティブ→GBP メディア", async () => {
    const results = await chainTools([
      { tool: "google_ads_ad_create", args: { adGroupResourceName: "customers/1234567890/adGroups/123456", headlines: [{ text: "H1" }, { text: "H2" }, { text: "H3" }], descriptions: [{ text: "D1" }, { text: "D2" }], finalUrls: ["https://example.com"] } },
      { tool: "meta_ads_creative_create", args: { name: "MC", object_story_spec: "{\"page_id\":\"1\",\"link_data\":{\"link\":\"https://example.com\",\"message\":\"hi\"}}" } },
      { tool: "x_ads_creative_create", args: { accountId: "test-account-id", lineItemId: "mock-li-id", tweetId: "111" } },
      { tool: "gbp_media_upload", args: { locationId: "123456789", mediaFormat: "PHOTO", sourceUrl: "https://example.com/img.jpg", category: "EXTERIOR" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-073: Meta キャンペーン→セット→広告→Google キャンペーン一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_create", args: { name: "MC", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
      { tool: "meta_ads_adset_create", args: { campaign_id: "123456789", name: "MS", billing_event: "IMPRESSIONS", optimization_goal: "REACH", targeting: "{\"geo_locations\":{\"countries\":[\"JP\"]}}", daily_budget: "1000", start_time: "2026-04-01T00:00:00+0900" } },
      { tool: "meta_ads_ad_create", args: { adset_id: "123456789", name: "MA", creative_id: "123", status: "PAUSED" } },
      { tool: "google_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-074: GBP 全操作→Google キャンペーン", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "test", topicType: "STANDARD" } },
      { tool: "google_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-075: Google 予算→キャンペーン→広告グループ→Meta キャンペーン→セット", async () => {
    const results = await chainTools([
      { tool: "google_ads_budget_create", args: { name: "B", amountMicros: 1000000000 } },
      { tool: "google_ads_campaign_create", args: { name: "C", advertisingChannelType: "SEARCH", budgetResourceName: "customers/123/campaignBudgets/456" } },
      { tool: "google_ads_adgroup_create", args: { campaignResourceName: "customers/1234567890/campaigns/123456", name: "AG" } },
      { tool: "meta_ads_campaign_create", args: { name: "MC", objective: "OUTCOME_AWARENESS", status: "PAUSED" } },
      { tool: "meta_ads_adset_create", args: { campaign_id: "123456789", name: "MS", billing_event: "IMPRESSIONS", optimization_goal: "REACH", targeting: "{\"geo_locations\":{\"countries\":[\"JP\"]}}", daily_budget: "1000", start_time: "2026-04-01T00:00:00+0900" } },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-076: X 全セットアップ→GBP 投稿", async () => {
    const results = await chainTools([
      { tool: "x_ads_campaign_create", args: { accountId: "test-account-id", name: "XC", fundingInstrumentId: "abc", dailyBudgetAmountLocalMicro: 5000000000, startTime: "2026-04-01T00:00:00Z" } },
      { tool: "x_ads_lineitem_create", args: { accountId: "test-account-id", campaignId: "mock-id-123", name: "LI", placements: ["ALL_ON_TWITTER"], objective: "ENGAGEMENTS", bidAmountLocalMicro: 1000000 } },
      { tool: "x_ads_creative_create", args: { accountId: "test-account-id", lineItemId: "mock-li-id", tweetId: "111" } },
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "X配信開始", topicType: "STANDARD" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-077: Google キャンペーン一覧→Meta 広告セットGet→GBP ロケーション詳細", async () => {
    const results = await chainTools([
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_adset_get", args: { adsetId: "123456789" } },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-078: Meta 広告レビュー→Google 広告更新→X クリエイティブ一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_ad_review_status", args: {} },
      { tool: "google_ads_ad_update", args: { adGroupId: "123456", adId: "789", status: "ENABLED" } },
      { tool: "x_ads_creative_list", args: { accountId: "test-account-id" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-079: GBP ロケーション→更新→メディア→Google キャンペーン→Meta キャンペーン", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_update", args: { locationId: "123456789", updateMask: "websiteUri", websiteUri: "https://update.com" } },
      { tool: "gbp_media_upload", args: { locationId: "123456789", mediaFormat: "PHOTO", sourceUrl: "https://example.com/img.jpg", category: "EXTERIOR" } },
      { tool: "google_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  it("IT3-CP-080: 全プラットフォーム5ツール横断", async () => {
    const results = await chainTools([
      { tool: "google_ads_account_list", args: {} },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "gbp_location_list", args: {} },
      { tool: "x_ads_account_list", args: {} },
      { tool: "google_ads_report_campaign", args: { startDate: "2026-03-01", endDate: "2026-03-28" } },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });
});
