/**
 * IT3 GBP (Google Business Profile) オペレーションテスト
 * IT3-GB-001 〜 IT3-GB-040（40件）
 *
 * 3ツール以上の連鎖実行による GBP 店舗管理フローのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  callTool,
  chainTools,
  extractText,
  extractJson,
} from "@/tests/helpers/mcp-client";
import { resetTokenCache } from "@/lib/platforms/gbp/auth";

const ENV_DEFAULTS: Record<string, string> = {
  GBP_CLIENT_ID: "test-gbp-client-id",
  GBP_CLIENT_SECRET: "test-gbp-client-secret",
  GBP_REFRESH_TOKEN: "test-gbp-refresh-token",
  GBP_ACCOUNT_ID: "test-account-id",
};

describe("IT3 GBP オペレーション", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...ENV_DEFAULTS };
    resetTokenCache();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ===========================================================================
  // IT3-GB-001: location_list → location_get → location_update
  // ===========================================================================
  it("IT3-GB-001: ロケーション一覧 → 詳細 → 更新", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_location_update",
        args: {
          locationId: "123456789",
          updateMask: "title,websiteUri",
          title: "テスト店舗",
          websiteUri: "https://example.com",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-002: location_list → review_list → review_reply
  // ===========================================================================
  it("IT3-GB-002: ロケーション一覧 → レビュー一覧 → レビュー返信", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-001", comment: "ご来店ありがとうございます！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-003: location_list → post_create → post_list
  // ===========================================================================
  it("IT3-GB-003: ロケーション一覧 → 投稿作成 → 投稿一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "本日のおすすめ商品はこちら！" },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-004: location_list → post_create → post_delete
  // ===========================================================================
  it("IT3-GB-004: ロケーション一覧 → 投稿作成 → 投稿削除", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "削除テスト投稿" },
      },
      {
        tool: "gbp_post_delete",
        args: { locationId: "123456789", postId: "mock-post" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-005: location_list → insight_get → location_update
  // ===========================================================================
  it("IT3-GB-005: ロケーション一覧 → インサイト → ロケーション更新", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["WEBSITE_CLICKS", "CALL_CLICKS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
      {
        tool: "gbp_location_update",
        args: {
          locationId: "123456789",
          updateMask: "websiteUri",
          websiteUri: "https://example.com/updated",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-006: location_get → review_list → review_reply (特定店舗レビュー管理)
  // ===========================================================================
  it("IT3-GB-006: ロケーション詳細 → レビュー一覧 → レビュー返信", async () => {
    const results = await chainTools([
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-002", comment: "レビューありがとうございます！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-007: location_list → location_get → insight_get (店舗分析)
  // ===========================================================================
  it("IT3-GB-007: ロケーション一覧 → 詳細 → インサイト", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-008: post_create → post_list → post_delete (投稿ライフサイクル)
  // ===========================================================================
  it("IT3-GB-008: 投稿作成 → 投稿一覧 → 投稿削除", async () => {
    const results = await chainTools([
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "ライフサイクルテスト投稿" },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
      { tool: "gbp_post_delete", args: { locationId: "123456789", postId: "mock-post" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-009: location_update → location_get → insight_get (更新後確認)
  // ===========================================================================
  it("IT3-GB-009: ロケーション更新 → 詳細確認 → インサイト", async () => {
    const results = await chainTools([
      {
        tool: "gbp_location_update",
        args: {
          locationId: "123456789",
          updateMask: "title",
          title: "更新後店舗名",
        },
      },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_IMPRESSIONS_MOBILE_MAPS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-010: location_list → media_upload → post_create (メディア付き投稿)
  // ===========================================================================
  it("IT3-GB-010: ロケーション一覧 → メディアアップロード → 投稿作成", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/photo.jpg",
          mediaFormat: "PHOTO",
          category: "ADDITIONAL",
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "新しい写真を追加しました！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-011: review_list → review_reply → review_list (返信確認)
  // ===========================================================================
  it("IT3-GB-011: レビュー一覧 → 返信 → 再度一覧確認", async () => {
    const results = await chainTools([
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-003", comment: "ご指摘ありがとうございます。" },
      },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-012: location_list → post_create → post_create (連続投稿)
  // ===========================================================================
  it("IT3-GB-012: ロケーション一覧 → 投稿作成1 → 投稿作成2", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "第1弾キャンペーン開始！" },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "第2弾キャンペーンもお見逃しなく！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-013: location_get → location_update → location_get (更新前後比較)
  // ===========================================================================
  it("IT3-GB-013: ロケーション詳細 → 更新 → 再度詳細", async () => {
    const results = await chainTools([
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_location_update",
        args: {
          locationId: "123456789",
          updateMask: "primaryPhone",
          primaryPhone: "03-1234-5678",
        },
      },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-014: insight_get → location_update → insight_get (改善サイクル)
  // ===========================================================================
  it("IT3-GB-014: インサイト取得 → ロケーション更新 → 再度インサイト", async () => {
    const results = await chainTools([
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["WEBSITE_CLICKS"],
          dailyRange: {
            startDate: { year: 2026, month: 2, day: 1 },
            endDate: { year: 2026, month: 2, day: 28 },
          },
        },
      },
      {
        tool: "gbp_location_update",
        args: {
          locationId: "123456789",
          updateMask: "websiteUri",
          websiteUri: "https://example.com/new-landing",
        },
      },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["WEBSITE_CLICKS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-015: location_list → location_get → post_create (店舗確認→投稿)
  // ===========================================================================
  it("IT3-GB-015: ロケーション一覧 → 詳細確認 → 投稿作成", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "営業時間を更新しました！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-016: location_list → media_upload → media_upload (複数メディア)
  // ===========================================================================
  it("IT3-GB-016: ロケーション一覧 → メディア1アップ → メディア2アップ", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/photo1.jpg",
          mediaFormat: "PHOTO",
          category: "EXTERIOR",
        },
      },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/photo2.jpg",
          mediaFormat: "PHOTO",
          category: "INTERIOR",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-017: location_get → review_list → insight_get (店舗評価分析)
  // ===========================================================================
  it("IT3-GB-017: ロケーション詳細 → レビュー一覧 → インサイト", async () => {
    const results = await chainTools([
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_CONVERSATIONS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-018: post_create → post_list → post_delete → post_list (投稿管理)
  // ===========================================================================
  it("IT3-GB-018: 投稿作成 → 一覧 → 削除 → 一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "管理テスト投稿" },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
      { tool: "gbp_post_delete", args: { locationId: "123456789", postId: "mock-post" } },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-019: location_list → location_update → post_create (更新告知)
  // ===========================================================================
  it("IT3-GB-019: ロケーション一覧 → 更新 → 投稿で告知", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_location_update",
        args: { locationId: "123456789", updateMask: "title", title: "リニューアル店舗" },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "店舗名をリニューアルしました！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-020: location_get → media_upload → post_create (写真付き投稿)
  // ===========================================================================
  it("IT3-GB-020: ロケーション詳細 → メディアアップ → 投稿作成", async () => {
    const results = await chainTools([
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/new-product.jpg",
          mediaFormat: "PHOTO",
          category: "PRODUCT",
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "新商品の写真をアップしました！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-021: location_list → review_list → review_reply → review_list
  // ===========================================================================
  it("IT3-GB-021: ロケーション一覧 → レビュー一覧 → 返信 → 再確認", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-004", comment: "ありがとうございます！" },
      },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-022: insight_get → post_create → post_list (データ駆動投稿)
  // ===========================================================================
  it("IT3-GB-022: インサイト取得 → 投稿作成 → 投稿一覧", async () => {
    const results = await chainTools([
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_DIRECTION_REQUESTS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "アクセス方法をご案内します！" },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-023: location_list → location_get → review_list (店舗調査)
  // ===========================================================================
  it("IT3-GB-023: ロケーション一覧 → 詳細 → レビュー一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-024: location_update → media_upload → post_create (フル更新)
  // ===========================================================================
  it("IT3-GB-024: ロケーション更新 → メディアアップ → 投稿", async () => {
    const results = await chainTools([
      {
        tool: "gbp_location_update",
        args: { locationId: "123456789", updateMask: "websiteUri", websiteUri: "https://new-site.com" },
      },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/new-cover.jpg",
          mediaFormat: "PHOTO",
          category: "COVER",
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "ウェブサイトとカバー写真を更新しました！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-025: location_list → insight_get → post_create (インサイト→アクション)
  // ===========================================================================
  it("IT3-GB-025: ロケーション一覧 → インサイト → 投稿作成", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["CALL_CLICKS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "お電話でのお問い合わせも受付中！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-026: post_create (EVENT) → post_list → post_delete (イベント投稿)
  // ===========================================================================
  it("IT3-GB-026: イベント投稿作成 → 一覧 → 削除", async () => {
    const results = await chainTools([
      {
        tool: "gbp_post_create",
        args: {
          locationId: "123456789",
          summary: "春のセール開催！",
          topicType: "EVENT",
          actionType: "LEARN_MORE",
          actionUrl: "https://example.com/sale",
        },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
      { tool: "gbp_post_delete", args: { locationId: "123456789", postId: "mock-post" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-027: post_create (OFFER) → post_list → insight_get (オファー効果)
  // ===========================================================================
  it("IT3-GB-027: オファー投稿作成 → 一覧 → インサイト確認", async () => {
    const results = await chainTools([
      {
        tool: "gbp_post_create",
        args: {
          locationId: "123456789",
          summary: "20%OFFクーポン配布中！",
          topicType: "OFFER",
        },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["WEBSITE_CLICKS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-028: location_list → location_get → media_upload (店舗写真管理)
  // ===========================================================================
  it("IT3-GB-028: ロケーション一覧 → 詳細 → メディアアップ", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/storefront.jpg",
          mediaFormat: "PHOTO",
          category: "PROFILE",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-029: review_list → review_reply → insight_get (レビュー対応→効果確認)
  // ===========================================================================
  it("IT3-GB-029: レビュー一覧 → 返信 → インサイト確認", async () => {
    const results = await chainTools([
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-005", comment: "改善いたします。" },
      },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_CONVERSATIONS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-030: location_list → location_update → location_get → insight_get (4ステップ)
  // ===========================================================================
  it("IT3-GB-030: ロケーション一覧 → 更新 → 詳細 → インサイト", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_location_update",
        args: { locationId: "123456789", updateMask: "title", title: "4ステップ店舗" },
      },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-031: media_upload → media_upload → post_create (複数メディア→投稿)
  // ===========================================================================
  it("IT3-GB-031: メディア1アップ → メディア2アップ → 投稿作成", async () => {
    const results = await chainTools([
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/img1.jpg",
          mediaFormat: "PHOTO",
          category: "ADDITIONAL",
        },
      },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/img2.jpg",
          mediaFormat: "PHOTO",
          category: "ADDITIONAL",
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "新しい写真を2枚追加しました！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-032: location_list → review_list → review_reply → review_reply (複数返信)
  // ===========================================================================
  it("IT3-GB-032: ロケーション一覧 → レビュー一覧 → 返信1 → 返信2", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-006", comment: "ありがとうございます！" },
      },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-007", comment: "貴重なご意見感謝します。" },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-033: insight_get → location_update → media_upload (分析→改善)
  // ===========================================================================
  it("IT3-GB-033: インサイト取得 → ロケーション更新 → メディアアップ", async () => {
    const results = await chainTools([
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_IMPRESSIONS_MOBILE_SEARCH"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
      {
        tool: "gbp_location_update",
        args: { locationId: "123456789", updateMask: "title", title: "SEO改善店舗" },
      },
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/seo-photo.jpg",
          mediaFormat: "PHOTO",
          category: "COVER",
        },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-034: location_get → post_list → post_create (既存確認→追加投稿)
  // ===========================================================================
  it("IT3-GB-034: ロケーション詳細 → 投稿一覧 → 投稿作成", async () => {
    const results = await chainTools([
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "追加のお知らせです！" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-035: location_list → location_get → location_update → post_create (4ステップ更新告知)
  // ===========================================================================
  it("IT3-GB-035: 一覧 → 詳細 → 更新 → 投稿告知", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      {
        tool: "gbp_location_update",
        args: { locationId: "123456789", updateMask: "websiteUri", websiteUri: "https://new-website.com" },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "ウェブサイトをリニューアルしました！" },
      },
    ]);
    expect(results).toHaveLength(4);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-036: review_list → review_reply → location_update (フィードバック反映)
  // ===========================================================================
  it("IT3-GB-036: レビュー一覧 → 返信 → ロケーション更新", async () => {
    const results = await chainTools([
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-008", comment: "ご指摘の件、対応いたしました。" },
      },
      {
        tool: "gbp_location_update",
        args: { locationId: "123456789", updateMask: "title", title: "改善済み店舗" },
      },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-037: media_upload → post_create → post_list (メディア→投稿→確認)
  // ===========================================================================
  it("IT3-GB-037: メディアアップ → 投稿作成 → 投稿一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "gbp_media_upload",
        args: {
          locationId: "123456789",
          sourceUrl: "https://example.com/menu.jpg",
          mediaFormat: "PHOTO",
          category: "FOOD_AND_DRINK",
        },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "新メニューの写真を公開しました！" },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-038: location_list → insight_get → review_list (総合分析)
  // ===========================================================================
  it("IT3-GB-038: ロケーション一覧 → インサイト → レビュー一覧", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_BOOKINGS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-039: post_create → post_create → post_list (連続投稿→確認)
  // ===========================================================================
  it("IT3-GB-039: 投稿1作成 → 投稿2作成 → 投稿一覧確認", async () => {
    const results = await chainTools([
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "朝のキャンペーン！" },
      },
      {
        tool: "gbp_post_create",
        args: { locationId: "123456789", summary: "夜のキャンペーン！" },
      },
      { tool: "gbp_post_list", args: { locationId: "123456789" } },
    ]);
    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });

  // ===========================================================================
  // IT3-GB-040: location_list → location_get → review_list → review_reply → insight_get (5ステップ)
  // ===========================================================================
  it("IT3-GB-040: 一覧 → 詳細 → レビュー → 返信 → インサイト（5ステップ）", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_location_get", args: { locationId: "123456789" } },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      {
        tool: "gbp_review_reply",
        args: { locationId: "123456789", reviewId: "review-009", comment: "総合管理テスト返信" },
      },
      {
        tool: "gbp_insight_get",
        args: {
          locationId: "123456789",
          dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_MAPS"],
          dailyRange: {
            startDate: { year: 2026, month: 3, day: 1 },
            endDate: { year: 2026, month: 3, day: 28 },
          },
        },
      },
    ]);
    expect(results).toHaveLength(5);
    results.forEach((r) => expect(r.isError).toBeUndefined());
  });
});
