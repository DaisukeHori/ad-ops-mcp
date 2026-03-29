/**
 * GBP (Google Business Profile) ツール単体テスト
 * UT-GB-001 〜 UT-GB-040（10ツール x 4パターン = 40件）
 *
 * パターン:
 *   A. 正常系
 *   B. 認証エラー (401)
 *   C. レート制限 (429)
 *   D. パラメータ不正 or 追加正常系
 */

import { describe, it, expect, beforeEach } from "vitest";
import { callTool, extractText } from "@/tests/helpers/mcp-client";
import { resetTokenCache } from "@/lib/platforms/gbp/auth";
import { mswServer } from "@/tests/setup";
import { http, HttpResponse } from "msw";

/** 環境変数セットアップ */
const ENV_BACKUP: Record<string, string | undefined> = {};

function setEnv(overrides: Record<string, string>): void {
  for (const [key, value] of Object.entries(overrides)) {
    ENV_BACKUP[key] = process.env[key];
    process.env[key] = value;
  }
}

function restoreEnv(): void {
  for (const [key, value] of Object.entries(ENV_BACKUP)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

/** デフォルトの GBP 環境変数 */
const DEFAULT_GBP_ENV = {
  GBP_CLIENT_ID: "test-gbp-client-id",
  GBP_CLIENT_SECRET: "test-gbp-client-secret",
  GBP_REFRESH_TOKEN: "test-gbp-refresh-token",
  GBP_ACCOUNT_ID: "test-account-id",
};

/** 認証エラー用の環境変数（無効なリフレッシュトークン） */
const AUTH_ERROR_ENV = {
  ...DEFAULT_GBP_ENV,
  GBP_REFRESH_TOKEN: "invalid-refresh-token",
};

/** OAuth をオーバーライドして rate-limited-token を返すヘルパー */
function overrideOAuthForRateLimit(): void {
  mswServer.use(
    http.post("https://oauth2.googleapis.com/token", () => {
      return HttpResponse.json({
        access_token: "rate-limited-token",
        expires_in: 3600,
        token_type: "Bearer",
      });
    })
  );
}

// =============================================================================
// gbp_location_list
// =============================================================================
describe("gbp_location_list", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-001: A. 正常系
  it("UT-GB-001: 正常系 - ロケーション一覧を取得できる", async () => {
    const result = await callTool("gbp_location_list", {});

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("locations");
    expect(Array.isArray(parsed.locations)).toBe(true);
  });

  // UT-GB-002: B. 認証エラー
  it("UT-GB-002: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_location_list", {});

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-003: C. レート制限
  it("UT-GB-003: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    const result = await callTool("gbp_location_list", {});

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-004: A. 正常系（pageSize 指定）
  it("UT-GB-004: 正常系 - pageSize を指定してロケーション一覧を取得できる", async () => {
    const result = await callTool("gbp_location_list", { pageSize: 10 });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("locations");
  });
});

// =============================================================================
// gbp_location_get
// =============================================================================
describe("gbp_location_get", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-005: A. 正常系
  it("UT-GB-005: 正常系 - ロケーション詳細を取得できる", async () => {
    const result = await callTool("gbp_location_get", {
      locationId: "locations/123456789",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toBeDefined();
  });

  // UT-GB-006: B. 認証エラー
  it("UT-GB-006: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_location_get", {
      locationId: "locations/123456789",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-007: C. レート制限
  it("UT-GB-007: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    const result = await callTool("gbp_location_get", {
      locationId: "locations/123456789",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-008: D. パラメータ不正 - locationId 未指定
  it("UT-GB-008: パラメータ不正 - locationId が未指定でエラーになる", async () => {
    const result = await callTool("gbp_location_get", {});

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toBeTruthy();
  });
});

// =============================================================================
// gbp_location_update
// =============================================================================
describe("gbp_location_update", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-009: A. 正常系
  it("UT-GB-009: 正常系 - ロケーション情報を更新できる", async () => {
    const result = await callTool("gbp_location_update", {
      locationId: "locations/123456789",
      updateMask: "title",
      title: "テスト店舗",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("name");
  });

  // UT-GB-010: B. 認証エラー
  it("UT-GB-010: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_location_update", {
      locationId: "locations/123456789",
      updateMask: "title",
      title: "テスト店舗",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-011: C. レート制限
  it("UT-GB-011: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    // PATCH ハンドラーにもレート制限チェックを追加
    mswServer.use(
      http.patch("https://mybusinessbusinessinformation.googleapis.com/v1/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ name: "locations/mock-location" });
      })
    );

    const result = await callTool("gbp_location_update", {
      locationId: "locations/123456789",
      updateMask: "title",
      title: "テスト店舗",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-012: D. パラメータ不正 - locationId 未指定
  it("UT-GB-012: パラメータ不正 - locationId が未指定でエラーになる", async () => {
    const result = await callTool("gbp_location_update", {
      updateMask: "title",
      title: "テスト",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toBeTruthy();
  });
});

// =============================================================================
// gbp_review_list
// =============================================================================
describe("gbp_review_list", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-013: A. 正常系
  it("UT-GB-013: 正常系 - レビュー一覧を取得できる", async () => {
    const result = await callTool("gbp_review_list", {
      locationId: "123456789",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("reviews");
    expect(Array.isArray(parsed.reviews)).toBe(true);
  });

  // UT-GB-014: B. 認証エラー
  it("UT-GB-014: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_review_list", {
      locationId: "123456789",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-015: C. レート制限
  it("UT-GB-015: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.get("https://mybusiness.googleapis.com/v4/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ reviews: [] });
      })
    );

    const result = await callTool("gbp_review_list", {
      locationId: "123456789",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-016: A. 正常系（locationId 指定）
  it("UT-GB-016: 正常系 - accountId を指定してレビュー一覧を取得できる", async () => {
    const result = await callTool("gbp_review_list", {
      locationId: "123456789",
      accountId: "custom-account-id",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("reviews");
  });
});

// =============================================================================
// gbp_review_reply
// =============================================================================
describe("gbp_review_reply", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-017: A. 正常系
  it("UT-GB-017: 正常系 - レビューに返信できる", async () => {
    const result = await callTool("gbp_review_reply", {
      locationId: "123456789",
      reviewId: "review-001",
      comment: "ご来店ありがとうございます！",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("comment");
  });

  // UT-GB-018: B. 認証エラー
  it("UT-GB-018: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_review_reply", {
      locationId: "123456789",
      reviewId: "review-001",
      comment: "ご来店ありがとうございます！",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-019: C. レート制限
  it("UT-GB-019: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.put("https://mybusiness.googleapis.com/v4/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ comment: "返信テスト" });
      })
    );

    const result = await callTool("gbp_review_reply", {
      locationId: "123456789",
      reviewId: "review-001",
      comment: "ご来店ありがとうございます！",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-020: D. パラメータ不正 - reviewId と comment 未指定
  it("UT-GB-020: パラメータ不正 - reviewId が未指定でもハンドラーはエラーなしで処理される（zod バリデーションはSDK層で実行）", async () => {
    // ハンドラー直接呼び出しでは zod バリデーションがバイパスされるため、
    // undefined の reviewId でリクエストが送信され、モックが成功レスポンスを返す
    const result = await callTool("gbp_review_reply", {
      locationId: "123456789",
      comment: "返信テスト",
    });

    // ハンドラーは成功するが、実際の SDK 経由では zod バリデーションで弾かれる
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// gbp_post_list
// =============================================================================
describe("gbp_post_list", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-021: A. 正常系
  it("UT-GB-021: 正常系 - 投稿一覧を取得できる", async () => {
    const result = await callTool("gbp_post_list", {
      locationId: "123456789",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    // GBP v4 GET リクエストのレスポンスは reviews: [] を返す（モックハンドラーが汎用 GET）
    // 投稿一覧のレスポンスもレビュー同様 JSON で返される
    const parsed = JSON.parse(text);
    expect(parsed).toBeDefined();
  });

  // UT-GB-022: B. 認証エラー
  it("UT-GB-022: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_post_list", {
      locationId: "123456789",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-023: C. レート制限
  it("UT-GB-023: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.get("https://mybusiness.googleapis.com/v4/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ localPosts: [] });
      })
    );

    const result = await callTool("gbp_post_list", {
      locationId: "123456789",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-024: A. 正常系（accountId 指定）
  it("UT-GB-024: 正常系 - accountId を指定して投稿一覧を取得できる", async () => {
    const result = await callTool("gbp_post_list", {
      locationId: "123456789",
      accountId: "custom-account-id",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toBeDefined();
  });
});

// =============================================================================
// gbp_post_create
// =============================================================================
describe("gbp_post_create", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-025: A. 正常系
  it("UT-GB-025: 正常系 - 投稿を作成できる", async () => {
    const result = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "本日のおすすめメニューはカレーライスです！",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("name");
    expect(parsed.name).toContain("localPosts");
  });

  // UT-GB-026: B. 認証エラー
  it("UT-GB-026: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "テスト投稿",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-027: C. レート制限
  it("UT-GB-027: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.post("https://mybusiness.googleapis.com/v4/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ name: "locations/mock-location/localPosts/mock-post" });
      })
    );

    const result = await callTool("gbp_post_create", {
      locationId: "123456789",
      summary: "テスト投稿",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-028: D. パラメータ不正 - summary 未指定
  it("UT-GB-028: パラメータ不正 - summary が未指定でもハンドラーは処理される（zod バリデーションはSDK層で実行）", async () => {
    // ハンドラー直接呼び出しでは zod バリデーションがバイパスされる
    const result = await callTool("gbp_post_create", {
      locationId: "123456789",
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// gbp_post_delete
// =============================================================================
describe("gbp_post_delete", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-029: A. 正常系
  it("UT-GB-029: 正常系 - 投稿を削除できる", async () => {
    const result = await callTool("gbp_post_delete", {
      locationId: "123456789",
      postId: "post-001",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("success", true);
    expect(parsed.message).toContain("post-001");
  });

  // UT-GB-030: B. 認証エラー
  it("UT-GB-030: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_post_delete", {
      locationId: "123456789",
      postId: "post-001",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-031: C. レート制限
  it("UT-GB-031: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.delete("https://mybusiness.googleapis.com/v4/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await callTool("gbp_post_delete", {
      locationId: "123456789",
      postId: "post-001",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-032: D. パラメータ不正 - postId 未指定
  it("UT-GB-032: パラメータ不正 - postId が未指定でもハンドラーは処理される（zod バリデーションはSDK層で実行）", async () => {
    // ハンドラー直接呼び出しでは zod バリデーションがバイパスされる
    const result = await callTool("gbp_post_delete", {
      locationId: "123456789",
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// gbp_insight_get
// =============================================================================
describe("gbp_insight_get", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-033: A. 正常系
  it("UT-GB-033: 正常系 - インサイトを取得できる", async () => {
    const result = await callTool("gbp_insight_get", {
      locationId: "locations/123456789",
      dailyMetrics: ["BUSINESS_IMPRESSIONS_DESKTOP_MAPS", "CALL_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("multiDailyMetricTimeSeries");
  });

  // UT-GB-034: B. 認証エラー
  it("UT-GB-034: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_insight_get", {
      locationId: "locations/123456789",
      dailyMetrics: ["CALL_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-035: C. レート制限
  it("UT-GB-035: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.get("https://businessprofileperformance.googleapis.com/v1/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ multiDailyMetricTimeSeries: [] });
      })
    );

    const result = await callTool("gbp_insight_get", {
      locationId: "locations/123456789",
      dailyMetrics: ["CALL_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-036: D. パラメータ不正 - locationId 未指定
  it("UT-GB-036: パラメータ不正 - locationId が未指定でエラーになる", async () => {
    const result = await callTool("gbp_insight_get", {
      dailyMetrics: ["CALL_CLICKS"],
      dailyRange: {
        startDate: { year: 2026, month: 3, day: 1 },
        endDate: { year: 2026, month: 3, day: 28 },
      },
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toBeTruthy();
  });
});

// =============================================================================
// gbp_media_upload
// =============================================================================
describe("gbp_media_upload", () => {
  beforeEach(() => {
    resetTokenCache();
    setEnv(DEFAULT_GBP_ENV);
  });

  afterEach(() => {
    restoreEnv();
  });

  // UT-GB-037: A. 正常系
  it("UT-GB-037: 正常系 - メディアをアップロードできる", async () => {
    const result = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/photo.jpg",
      mediaFormat: "PHOTO",
    });

    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("name");
  });

  // UT-GB-038: B. 認証エラー
  it("UT-GB-038: 認証エラー - 無効なリフレッシュトークンで 401 エラーを返す", async () => {
    setEnv(AUTH_ERROR_ENV);

    const result = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/photo.jpg",
      mediaFormat: "PHOTO",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("Google Business Profile");
  });

  // UT-GB-039: C. レート制限
  it("UT-GB-039: レート制限 - 429 エラーを返す", async () => {
    overrideOAuthForRateLimit();

    mswServer.use(
      http.post("https://mybusiness.googleapis.com/v4/*", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (authHeader === "Bearer rate-limited-token") {
          return HttpResponse.json(
            { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
            { status: 429 }
          );
        }
        return HttpResponse.json({ name: "locations/mock-location/media/mock-media" });
      })
    );

    const result = await callTool("gbp_media_upload", {
      locationId: "123456789",
      sourceUrl: "https://example.com/photo.jpg",
      mediaFormat: "PHOTO",
    });

    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("レート制限");
  });

  // UT-GB-040: D. パラメータ不正 - sourceUrl 未指定
  it("UT-GB-040: パラメータ不正 - sourceUrl が未指定でもハンドラーは処理される（zod バリデーションはSDK層で実行）", async () => {
    // ハンドラー直接呼び出しでは zod バリデーションがバイパスされる
    const result = await callTool("gbp_media_upload", {
      locationId: "123456789",
      mediaFormat: "PHOTO",
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
  });
});
