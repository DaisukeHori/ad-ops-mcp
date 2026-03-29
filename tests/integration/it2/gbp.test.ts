/**
 * IT2: GBP 2ツール結合テスト（30件）
 * 2つのツールを連鎖実行し、両方がエラーなく動作することを検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import { callTool, chainTools } from "@/tests/helpers/mcp-client";
import { resetTokenCache } from "@/lib/platforms/gbp/auth";

beforeEach(() => {
  resetTokenCache();
  process.env.GBP_CLIENT_ID = "test-gbp-client-id";
  process.env.GBP_CLIENT_SECRET = "test-gbp-client-secret";
  process.env.GBP_REFRESH_TOKEN = "test-gbp-refresh-token";
  process.env.GBP_ACCOUNT_ID = "test-account-id";
});

describe("IT2-GBP: ロケーション一覧・詳細 連携", () => {
  it("IT2-GBP-001: location_list -> location_get", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_get", {
      locationId: "locations/123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-002: location_list -> location_update", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_update", {
      locationId: "locations/123456789",
      updateMask: "title",
      title: "更新後店舗名",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-003: location_get -> location_update", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_update", {
      locationId: "123456789",
      updateMask: "websiteUri",
      websiteUri: "https://example.com/new",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-004: location_list -> review_list", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_review_list", {
      locationId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-005: location_list -> post_list", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_list", {
      locationId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-GBP: レビュー連携", () => {
  it("IT2-GBP-006: review_list -> review_reply", async () => {
    const r1 = await callTool("gbp_review_list", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_review_reply", {
      locationId: "123456789",
      reviewId: "review-001",
      comment: "レビューありがとうございます。",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-007: location_get -> review_list", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_review_list", {
      locationId: "123456789",
      pageSize: 10,
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-008: review_list -> review_list (別ロケーション)", async () => {
    const r1 = await callTool("gbp_review_list", {
      locationId: "111111111",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_review_list", {
      locationId: "222222222",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-GBP: 投稿 CRUD 連携", () => {
  it("IT2-GBP-009: post_create -> post_list", async () => {
    const r1 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "新しい投稿のテストです。",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_list", {
      locationId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-010: post_create -> post_delete", async () => {
    const r1 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "削除テスト用投稿です。",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_delete", {
      locationId: "123456789",
      postId: "mock-post",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-011: post_list -> post_delete", async () => {
    const r1 = await callTool("gbp_post_list", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_delete", {
      locationId: "123456789",
      postId: "post-001",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-012: location_get -> post_create", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "店舗情報確認後の投稿です。",
      topicType: "STANDARD",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-GBP: 投稿タイプバリエーション", () => {
  it("IT2-GBP-013: post_create (イベント) -> post_list", async () => {
    const r1 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "春の特別イベント開催中！",
      topicType: "EVENT",
      eventTitle: "春の特別イベント",
      eventStartDate: { year: 2026, month: 4, day: 1 },
      eventEndDate: { year: 2026, month: 4, day: 30 },
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_list", {
      locationId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-014: post_create (オファー) -> post_list", async () => {
    const r1 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "今だけ20%OFF！",
      topicType: "OFFER",
      couponCode: "SPRING20",
      redeemOnlineUrl: "https://example.com/offer",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_list", {
      locationId: "123456789",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-015: post_create (CTA付き) -> post_delete", async () => {
    const r1 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "詳細はウェブサイトをご覧ください。",
      actionType: "LEARN_MORE",
      actionUrl: "https://example.com/learn",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_delete", {
      locationId: "123456789",
      postId: "mock-post",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-GBP: インサイト連携", () => {
  it("IT2-GBP-016: location_list -> insight_get", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_insight_get", {
      locationId: "locations/123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_MAPS", "WEBSITE_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-017: location_get -> insight_get", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["CALL_CLICKS", "BUSINESS_DIRECTION_REQUESTS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-018: insight_get -> location_update", async () => {
    const r1 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["WEBSITE_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_update", {
      locationId: "123456789",
      updateMask: "title,websiteUri",
      title: "インサイトに基づく更新",
      websiteUri: "https://example.com/optimized",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-019: insight_get -> post_create", async () => {
    const r1 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_MOBILE_SEARCH"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "インサイトに基づく投稿です。",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-GBP: メディア連携", () => {
  it("IT2-GBP-020: location_get -> media_upload", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/photo.jpg",
      mediaFormat: "PHOTO",
      category: "EXTERIOR",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-021: media_upload -> post_create", async () => {
    const r1 = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/interior.jpg",
      mediaFormat: "PHOTO",
      category: "INTERIOR",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "メディアアップロード後の投稿です。",
      mediaSourceUrl: "https://example.com/interior.jpg",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-022: media_upload -> media_upload (複数アップロード)", async () => {
    const r1 = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/photo1.jpg",
      mediaFormat: "PHOTO",
      category: "PRODUCT",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/photo2.jpg",
      mediaFormat: "PHOTO",
      category: "FOOD_AND_DRINK",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-023: location_list -> media_upload", async () => {
    const r1 = await callTool("gbp_location_list", {});
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/cover.jpg",
      mediaFormat: "PHOTO",
      category: "COVER",
      description: "カバー写真のテスト",
    });
    expect(r2.isError).toBeFalsy();
  });
});

describe("IT2-GBP: chainTools による連鎖実行", () => {
  it("IT2-GBP-024: chainTools で location_list -> review_list", async () => {
    const results = await chainTools([
      { tool: "gbp_location_list", args: {} },
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
    expect(results).toHaveLength(2);
  });

  it("IT2-GBP-025: chainTools で post_create -> post_delete", async () => {
    const results = await chainTools([
      { tool: "gbp_post_create", args: { locationId: "123456789", summary: "チェーンテスト投稿" } },
      { tool: "gbp_post_delete", args: { locationId: "123456789", postId: "mock-post" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });

  it("IT2-GBP-026: chainTools で review_list -> review_reply", async () => {
    const results = await chainTools([
      { tool: "gbp_review_list", args: { locationId: "123456789" } },
      { tool: "gbp_review_reply", args: { locationId: "123456789", reviewId: "review-001", comment: "ありがとうございます！" } },
    ]);
    expect(results[0].isError).toBeFalsy();
    expect(results[1].isError).toBeFalsy();
  });
});

describe("IT2-GBP: ロケーション更新バリエーション", () => {
  it("IT2-GBP-027: location_get -> location_update (電話番号)", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
      readMask: "title,phoneNumbers",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_update", {
      locationId: "123456789",
      updateMask: "phoneNumbers",
      primaryPhone: "+81-3-1234-5678",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-028: location_get -> location_update (営業時間)", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
      readMask: "title,regularHours",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_update", {
      locationId: "123456789",
      updateMask: "regularHours",
      regularHours: {
        periods: [
          { openDay: "MONDAY", openTime: "09:00", closeDay: "MONDAY", closeTime: "18:00" },
          { openDay: "TUESDAY", openTime: "09:00", closeDay: "TUESDAY", closeTime: "18:00" },
        ],
      },
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-029: location_get -> location_update (住所)", async () => {
    const r1 = await callTool("gbp_location_get", {
      locationId: "123456789",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_location_update", {
      locationId: "123456789",
      updateMask: "storefrontAddress",
      addressLines: ["東京都渋谷区道玄坂1-1-1"],
      regionCode: "JP",
      postalCode: "150-0043",
      administrativeArea: "東京都",
      locality: "渋谷区",
    });
    expect(r2.isError).toBeFalsy();
  });

  it("IT2-GBP-030: location_update -> insight_get", async () => {
    const r1 = await callTool("gbp_location_update", {
      locationId: "123456789",
      updateMask: "title",
      title: "更新テスト店舗",
    });
    expect(r1.isError).toBeFalsy();

    const r2 = await callTool("gbp_insight_get", {
      locationId: "123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH", "BUSINESS_IMPRESSIONS_MOBILE_SEARCH"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });
    expect(r2.isError).toBeFalsy();
  });
});
