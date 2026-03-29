/**
 * IT3 Meta Ads 広告作成ワークフローテスト
 * IT3-MA-001 〜 IT3-MA-040（40件）
 *
 * 3ツール以上の連鎖実行による Meta Ads 広告構築・分析フローのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  callTool,
  chainTools,
  extractText,
  extractJson,
} from "@/tests/helpers/mcp-client";

const ENV_DEFAULTS: Record<string, string> = {
  META_ADS_ACCESS_TOKEN: "test-meta-token",
  META_ADS_ACCOUNT_ID: "123456789",
};

describe("IT3 Meta Ads 広告作成ワークフロー", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...ENV_DEFAULTS };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ===========================================================================
  // IT3-MA-001: campaign_create → adset_create → ad_create
  // ===========================================================================
  it("IT3-MA-001: キャンペーン作成 → 広告セット作成 → 広告作成", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "テストキャンペーン", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "テスト広告セット",
          campaign_id: "123456789",
          daily_budget: "5000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: {
          name: "テスト広告",
          adset_id: "123456789",
          creative_id: "111222333",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-002: campaign_create → adset_create → adset_update
  // ===========================================================================
  it("IT3-MA-002: キャンペーン作成 → 広告セット作成 → 広告セット更新", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "セット更新キャンペーン", objective: "OUTCOME_LEADS" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "セット更新用",
          campaign_id: "123456789",
          daily_budget: "3000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LEAD_GENERATION",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_adset_update",
        args: { adsetId: "123456789", daily_budget: "5000", name: "更新後セット" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-003: campaign_list → campaign_get → insight_campaign
  // ===========================================================================
  it("IT3-MA-003: キャンペーン一覧 → キャンペーン詳細 → インサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_get", args: { campaignId: "123456789" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-004: creative_create → ad_create → ad_get
  // ===========================================================================
  it("IT3-MA-004: クリエイティブ作成 → 広告作成 → 広告詳細取得", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "テストクリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "テスト広告文", link: "https://example.com", image_hash: "abc123" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "クリエイティブ広告", adset_id: "123456789", creative_id: "123456789" },
      },
      { tool: "meta_ads_ad_get", args: { adId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-005: campaign → adset → creative → ad (4ステップ)
  // ===========================================================================
  it("IT3-MA-005: キャンペーン → 広告セット → クリエイティブ → 広告（4ステップ）", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "4ステップキャンペーン", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "4ステップ広告セット",
          campaign_id: "123456789",
          daily_budget: "10000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "4ステップクリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "広告文", link: "https://example.com", image_hash: "xyz789" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "4ステップ広告", adset_id: "123456789", creative_id: "123456789" },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-006: campaign_create → campaign_update → campaign_get
  // ===========================================================================
  it("IT3-MA-006: キャンペーン作成 → 更新 → 詳細取得", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "更新確認用", objective: "OUTCOME_AWARENESS" },
      },
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", name: "更新後", status: "PAUSED" } },
      { tool: "meta_ads_campaign_get", args: { campaignId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-007: adset_list → adset_get → insight_adset
  // ===========================================================================
  it("IT3-MA-007: 広告セット一覧 → 詳細 → インサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "meta_ads_adset_get", args: { adsetId: "123456789" } },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-008: ad_list → ad_get → insight_ad
  // ===========================================================================
  it("IT3-MA-008: 広告一覧 → 広告詳細 → 広告インサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_get", args: { adId: "123456789" } },
      { tool: "meta_ads_insight_ad", args: { adId: "123456789", date_preset: "last_30d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-009: campaign_list → adset_list → ad_list (ドリルダウン)
  // ===========================================================================
  it("IT3-MA-009: キャンペーン一覧 → 広告セット一覧 → 広告一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_adset_list", args: { campaign_id: "123456789" } },
      { tool: "meta_ads_ad_list", args: { adset_id: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-010: ad_create → ad_update → ad_get (広告ライフサイクル)
  // ===========================================================================
  it("IT3-MA-010: 広告作成 → 更新 → 詳細取得", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_ad_create",
        args: { name: "LC広告", adset_id: "123456789", creative_id: "111222333" },
      },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", status: "PAUSED" } },
      { tool: "meta_ads_ad_get", args: { adId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-011: audience_list → adset_create → ad_create (オーディエンス活用)
  // ===========================================================================
  it("IT3-MA-011: オーディエンス一覧 → 広告セット作成 → 広告作成", async () => {
    const results = await chainTools([
      { tool: "meta_ads_audience_list", args: {} },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "オーディエンス広告セット",
          campaign_id: "123456789",
          daily_budget: "8000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] }, custom_audiences: [{ id: "111" }] }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "オーディエンス広告", adset_id: "123456789", creative_id: "111222333" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-012: image_upload → creative_create → ad_create (画像広告作成)
  // ===========================================================================
  it("IT3-MA-012: 画像アップ → クリエイティブ作成 → 広告作成", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_image_upload",
        args: { image_url: "https://example.com/image.jpg", name: "テスト画像" },
      },
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "画像クリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "画像広告", link: "https://example.com", image_hash: "hash123" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "画像広告", adset_id: "123456789", creative_id: "123456789" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-013: creative_list → creative_create → ad_create (クリエイティブ管理)
  // ===========================================================================
  it("IT3-MA-013: クリエイティブ一覧 → 作成 → 広告作成", async () => {
    const results = await chainTools([
      { tool: "meta_ads_creative_list", args: {} },
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "管理用クリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "テスト", link: "https://example.com", image_hash: "def456" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "管理用広告", adset_id: "123456789", creative_id: "123456789" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-014: campaign_create → adset_create → adset_get (作成確認)
  // ===========================================================================
  it("IT3-MA-014: キャンペーン作成 → 広告セット作成 → 広告セット詳細確認", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "確認用キャンペーン", objective: "OUTCOME_SALES" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "確認用広告セット",
          campaign_id: "123456789",
          daily_budget: "6000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "CONVERSIONS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      { tool: "meta_ads_adset_get", args: { adsetId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-015: insight_campaign → insight_adset → insight_ad (マルチレベル分析)
  // ===========================================================================
  it("IT3-MA-015: キャンペーンインサイト → セットインサイト → 広告インサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "last_7d" } },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789", date_preset: "last_7d" } },
      { tool: "meta_ads_insight_ad", args: { adId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-016: campaign_update → adset_update → ad_update (一括ステータス変更)
  // ===========================================================================
  it("IT3-MA-016: キャンペーン更新 → 広告セット更新 → 広告更新（一括停止）", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", status: "PAUSED" } },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", status: "PAUSED" } },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-017: campaign_list → campaign_update → insight_campaign (最適化フロー)
  // ===========================================================================
  it("IT3-MA-017: キャンペーン一覧 → 更新 → インサイト確認", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", daily_budget: "15000" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "last_30d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-018: adset_list → adset_update → insight_adset (セット最適化)
  // ===========================================================================
  it("IT3-MA-018: 広告セット一覧 → 更新 → インサイト確認", async () => {
    const results = await chainTools([
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", daily_budget: "12000" } },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789", date_preset: "this_month" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-019: ad_list → ad_update → insight_ad (広告最適化)
  // ===========================================================================
  it("IT3-MA-019: 広告一覧 → 更新 → インサイト確認", async () => {
    const results = await chainTools([
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", status: "ACTIVE" } },
      { tool: "meta_ads_insight_ad", args: { adId: "123456789", date_preset: "yesterday" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-020: campaign_create → adset_create → ad_create → ad_review_status
  // ===========================================================================
  it("IT3-MA-020: キャンペーン → セット → 広告 → 審査ステータス", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "審査確認用", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "審査確認セット",
          campaign_id: "123456789",
          daily_budget: "3000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "審査確認広告", adset_id: "123456789", creative_id: "111222333" },
      },
      { tool: "meta_ads_ad_review_status", args: { adId: "123456789" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-021: image_upload → creative_create → creative_list (クリエイティブ管理)
  // ===========================================================================
  it("IT3-MA-021: 画像アップ → クリエイティブ作成 → 一覧確認", async () => {
    const results = await chainTools([
      { tool: "meta_ads_image_upload", args: { image_url: "https://example.com/pic.png" } },
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "一覧確認クリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "テスト", link: "https://example.com", image_hash: "ghi789" },
          }),
        },
      },
      { tool: "meta_ads_creative_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-022: campaign_create → campaign_list → insight_campaign (作成後分析)
  // ===========================================================================
  it("IT3-MA-022: キャンペーン作成 → 一覧確認 → インサイト", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "分析用", objective: "OUTCOME_ENGAGEMENT" },
      },
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-023: audience_list → campaign_create → adset_create (オーディエンス→キャンペーン)
  // ===========================================================================
  it("IT3-MA-023: オーディエンス一覧 → キャンペーン作成 → 広告セット作成", async () => {
    const results = await chainTools([
      { tool: "meta_ads_audience_list", args: {} },
      {
        tool: "meta_ads_campaign_create",
        args: { name: "オーディエンス活用", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "オーディエンスセット",
          campaign_id: "123456789",
          daily_budget: "7000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-024: campaign_create → adset_create → ad_create → insight_ad (フル分析)
  // ===========================================================================
  it("IT3-MA-024: キャンペーン → セット → 広告 → 広告インサイト", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "フル分析用", objective: "OUTCOME_SALES" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "フル分析セット",
          campaign_id: "123456789",
          daily_budget: "9000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "CONVERSIONS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "フル分析広告", adset_id: "123456789", creative_id: "111222333" },
      },
      { tool: "meta_ads_insight_ad", args: { adId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-025: ad_list → ad_review_status → ad_update (審査対応フロー)
  // ===========================================================================
  it("IT3-MA-025: 広告一覧 → 審査ステータス → 広告更新", async () => {
    const results = await chainTools([
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "meta_ads_ad_review_status", args: {} },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", status: "PAUSED" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-026: campaign_create → adset_create → adset_list (作成確認)
  // ===========================================================================
  it("IT3-MA-026: キャンペーン作成 → 広告セット作成 → 一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "一覧確認キャンペーン", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "一覧確認セット",
          campaign_id: "123456789",
          daily_budget: "4000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      { tool: "meta_ads_adset_list", args: { campaign_id: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-027: creative_create → ad_create → ad_update (クリエイティブ広告管理)
  // ===========================================================================
  it("IT3-MA-027: クリエイティブ作成 → 広告作成 → 広告更新", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "管理クリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "管理テスト", link: "https://example.com", image_hash: "mng123" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "管理広告", adset_id: "123456789", creative_id: "123456789" },
      },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", name: "管理広告v2" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-028: campaign_list → adset_list → insight_adset (セット分析)
  // ===========================================================================
  it("IT3-MA-028: キャンペーン一覧 → 広告セット一覧 → セットインサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-029: campaign_create → campaign_get → campaign_update (確認→更新)
  // ===========================================================================
  it("IT3-MA-029: キャンペーン作成 → 詳細確認 → 更新", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "確認更新用", objective: "OUTCOME_AWARENESS" },
      },
      { tool: "meta_ads_campaign_get", args: { campaignId: "123456789" } },
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", name: "確認更新後" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-030: adset_create → ad_create → ad_list (広告作成→確認)
  // ===========================================================================
  it("IT3-MA-030: 広告セット作成 → 広告作成 → 広告一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "広告確認セット",
          campaign_id: "123456789",
          daily_budget: "5000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "広告確認", adset_id: "123456789", creative_id: "111222333" },
      },
      { tool: "meta_ads_ad_list", args: { adset_id: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-031: image_upload → creative_create → ad_create → ad_review_status (画像→審査)
  // ===========================================================================
  it("IT3-MA-031: 画像アップ → クリエイティブ → 広告 → 審査ステータス", async () => {
    const results = await chainTools([
      { tool: "meta_ads_image_upload", args: { image_url: "https://example.com/banner.jpg" } },
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "審査用クリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "審査テスト", link: "https://example.com", image_hash: "rev123" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "審査用広告", adset_id: "123456789", creative_id: "123456789" },
      },
      { tool: "meta_ads_ad_review_status", args: { adId: "123456789" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-032: campaign_list → campaign_get → campaign_update (一覧→詳細→更新)
  // ===========================================================================
  it("IT3-MA-032: キャンペーン一覧 → 詳細 → 更新", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: { status: "ACTIVE" } },
      { tool: "meta_ads_campaign_get", args: { campaignId: "123456789" } },
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", bid_strategy: "LOWEST_COST_WITHOUT_CAP" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-033: adset_get → adset_update → insight_adset (セット調整→確認)
  // ===========================================================================
  it("IT3-MA-033: 広告セット詳細 → 更新 → インサイト確認", async () => {
    const results = await chainTools([
      { tool: "meta_ads_adset_get", args: { adsetId: "123456789" } },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", name: "調整後セット" } },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-034: campaign_create → adset_create → insight_campaign (作成→即分析)
  // ===========================================================================
  it("IT3-MA-034: キャンペーン作成 → 広告セット作成 → キャンペーンインサイト", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "即分析用", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "即分析セット",
          campaign_id: "123456789",
          daily_budget: "6000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "today" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-035: ad_get → ad_update → ad_review_status (広告修正→審査確認)
  // ===========================================================================
  it("IT3-MA-035: 広告詳細 → 更新 → 審査ステータス確認", async () => {
    const results = await chainTools([
      { tool: "meta_ads_ad_get", args: { adId: "123456789" } },
      { tool: "meta_ads_ad_update", args: { adId: "123456789", creative_id: "999888777" } },
      { tool: "meta_ads_ad_review_status", args: { adId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-036: campaign_list → adset_list → ad_list → insight_ad (フルドリルダウン)
  // ===========================================================================
  it("IT3-MA-036: キャンペーン → セット → 広告一覧 → 広告インサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_list", args: {} },
      { tool: "meta_ads_adset_list", args: {} },
      { tool: "meta_ads_ad_list", args: {} },
      { tool: "meta_ads_insight_ad", args: { adId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-037: audience_list → creative_list → ad_list (アセット確認フロー)
  // ===========================================================================
  it("IT3-MA-037: オーディエンス一覧 → クリエイティブ一覧 → 広告一覧", async () => {
    const results = await chainTools([
      { tool: "meta_ads_audience_list", args: {} },
      { tool: "meta_ads_creative_list", args: {} },
      { tool: "meta_ads_ad_list", args: {} },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-038: campaign_create → adset_create → adset_update → insight_adset
  // ===========================================================================
  it("IT3-MA-038: キャンペーン → セット作成 → セット更新 → セットインサイト", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "セット管理用", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "管理セット",
          campaign_id: "123456789",
          daily_budget: "5000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", daily_budget: "8000" } },
      { tool: "meta_ads_insight_adset", args: { adsetId: "123456789", date_preset: "last_7d" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-039: campaign_update → adset_update → insight_campaign (まとめて最適化)
  // ===========================================================================
  it("IT3-MA-039: キャンペーン更新 → セット更新 → キャンペーンインサイト", async () => {
    const results = await chainTools([
      { tool: "meta_ads_campaign_update", args: { campaignId: "123456789", name: "最適化キャンペーン" } },
      { tool: "meta_ads_adset_update", args: { adsetId: "123456789", daily_budget: "10000" } },
      { tool: "meta_ads_insight_campaign", args: { campaignId: "123456789", date_preset: "this_month" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-MA-040: campaign → adset → creative → ad → ad_review (5ステップフル構築)
  // ===========================================================================
  it("IT3-MA-040: キャンペーン → セット → クリエイティブ → 広告 → 審査確認（5ステップ）", async () => {
    const results = await chainTools([
      {
        tool: "meta_ads_campaign_create",
        args: { name: "5ステップ", objective: "OUTCOME_TRAFFIC" },
      },
      {
        tool: "meta_ads_adset_create",
        args: {
          name: "5ステップセット",
          campaign_id: "123456789",
          daily_budget: "20000",
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify({ geo_locations: { countries: ["JP"] } }),
        },
      },
      {
        tool: "meta_ads_creative_create",
        args: {
          name: "5ステップクリエイティブ",
          object_story_spec: JSON.stringify({
            page_id: "123456",
            link_data: { message: "フル構築", link: "https://example.com", image_hash: "full123" },
          }),
        },
      },
      {
        tool: "meta_ads_ad_create",
        args: { name: "5ステップ広告", adset_id: "123456789", creative_id: "123456789" },
      },
      { tool: "meta_ads_ad_review_status", args: { adId: "123456789" } },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });
});
