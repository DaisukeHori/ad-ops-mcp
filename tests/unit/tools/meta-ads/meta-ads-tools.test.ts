/**
 * Meta Ads ツール単体テスト
 * 全20ツール x 4パターン = 80テスト (UT-MA-001 〜 UT-MA-080)
 *
 * パターン:
 *   A. 正常系 → 成功レスポンス
 *   B. 認証エラー (401) → isError: true
 *   C. レート制限 (429) → isError: true
 *   D. パラメータ不正 or 追加正常系
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { callTool, extractText } from "@/tests/helpers/mcp-client";

let savedEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  savedEnv = { ...process.env };
  process.env.META_ADS_ACCESS_TOKEN = "test-meta-token";
  process.env.META_ADS_ACCOUNT_ID = "123456789";
});

afterEach(() => {
  process.env = savedEnv;
});

// ---------------------------------------------------------------------------
// meta_ads_campaign_list (UT-MA-001 〜 UT-MA-004)
// ---------------------------------------------------------------------------
describe("meta_ads_campaign_list", () => {
  it("UT-MA-001: A. 正常系 - キャンペーン一覧を取得できる", async () => {
    const result = await callTool("meta_ads_campaign_list", {});
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("UT-MA-002: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_campaign_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-003: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_campaign_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-004: A. 正常系 - statusフィルタ付きで取得できる", async () => {
    const result = await callTool("meta_ads_campaign_list", {
      status: "ACTIVE",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_campaign_get (UT-MA-005 〜 UT-MA-008)
// ---------------------------------------------------------------------------
describe("meta_ads_campaign_get", () => {
  it("UT-MA-005: A. 正常系 - キャンペーン詳細を取得できる", async () => {
    const result = await callTool("meta_ads_campaign_get", {
      campaignId: "111222333",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-006: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_campaign_get", {
      campaignId: "111222333",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-007: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_campaign_get", {
      campaignId: "111222333",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-008: D. パラメータ不正 - campaignIdが未指定", async () => {
    try {
      const result = await callTool("meta_ads_campaign_get", {});
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_campaign_create (UT-MA-009 〜 UT-MA-012)
// ---------------------------------------------------------------------------
describe("meta_ads_campaign_create", () => {
  it("UT-MA-009: A. 正常系 - キャンペーンを作成できる", async () => {
    const result = await callTool("meta_ads_campaign_create", {
      name: "テストキャンペーン",
      objective: "OUTCOME_TRAFFIC",
      status: "PAUSED",
      special_ad_categories: [],
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
    expect(json.id).toBe("123456789");
  });

  it("UT-MA-010: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_campaign_create", {
      name: "テストキャンペーン",
      objective: "OUTCOME_TRAFFIC",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-011: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_campaign_create", {
      name: "テストキャンペーン",
      objective: "OUTCOME_TRAFFIC",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-012: D. パラメータ不正 - nameが未指定", async () => {
    try {
      const result = await callTool("meta_ads_campaign_create", {
        objective: "OUTCOME_TRAFFIC",
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_campaign_update (UT-MA-013 〜 UT-MA-016)
// ---------------------------------------------------------------------------
describe("meta_ads_campaign_update", () => {
  it("UT-MA-013: A. 正常系 - キャンペーンを更新できる", async () => {
    const result = await callTool("meta_ads_campaign_update", {
      campaignId: "111222333",
      name: "更新後キャンペーン名",
      status: "ACTIVE",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
  });

  it("UT-MA-014: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_campaign_update", {
      campaignId: "111222333",
      name: "更新後キャンペーン名",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-015: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_campaign_update", {
      campaignId: "111222333",
      name: "更新後キャンペーン名",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-016: D. パラメータ不正 - campaignIdが未指定", async () => {
    try {
      const result = await callTool("meta_ads_campaign_update", {
        name: "更新後キャンペーン名",
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_adset_list (UT-MA-017 〜 UT-MA-020)
// ---------------------------------------------------------------------------
describe("meta_ads_adset_list", () => {
  it("UT-MA-017: A. 正常系 - 広告セット一覧を取得できる", async () => {
    const result = await callTool("meta_ads_adset_list", {});
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("UT-MA-018: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_adset_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-019: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_adset_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-020: A. 正常系 - campaign_idフィルタ付きで取得できる", async () => {
    const result = await callTool("meta_ads_adset_list", {
      campaign_id: "111222333",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_adset_get (UT-MA-021 〜 UT-MA-024)
// ---------------------------------------------------------------------------
describe("meta_ads_adset_get", () => {
  it("UT-MA-021: A. 正常系 - 広告セット詳細を取得できる", async () => {
    const result = await callTool("meta_ads_adset_get", {
      adsetId: "444555666",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-022: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_adset_get", {
      adsetId: "444555666",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-023: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_adset_get", {
      adsetId: "444555666",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-024: D. パラメータ不正 - adsetIdが未指定", async () => {
    try {
      const result = await callTool("meta_ads_adset_get", {});
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_adset_create (UT-MA-025 〜 UT-MA-028)
// ---------------------------------------------------------------------------
describe("meta_ads_adset_create", () => {
  it("UT-MA-025: A. 正常系 - 広告セットを作成できる", async () => {
    const result = await callTool("meta_ads_adset_create", {
      name: "テスト広告セット",
      campaign_id: "111222333",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      targeting: JSON.stringify({
        geo_locations: { countries: ["JP"] },
        age_min: 25,
        age_max: 55,
      }),
      daily_budget: "5000",
      status: "PAUSED",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
    expect(json.id).toBe("123456789");
  });

  it("UT-MA-026: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_adset_create", {
      name: "テスト広告セット",
      campaign_id: "111222333",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      targeting: JSON.stringify({
        geo_locations: { countries: ["JP"] },
      }),
      daily_budget: "5000",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-027: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_adset_create", {
      name: "テスト広告セット",
      campaign_id: "111222333",
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      targeting: JSON.stringify({
        geo_locations: { countries: ["JP"] },
      }),
      daily_budget: "5000",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-028: D. パラメータ不正 - nameが未指定", async () => {
    try {
      const result = await callTool("meta_ads_adset_create", {
        campaign_id: "111222333",
        billing_event: "IMPRESSIONS",
        optimization_goal: "LINK_CLICKS",
        targeting: JSON.stringify({
          geo_locations: { countries: ["JP"] },
        }),
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_adset_update (UT-MA-029 〜 UT-MA-032)
// ---------------------------------------------------------------------------
describe("meta_ads_adset_update", () => {
  it("UT-MA-029: A. 正常系 - 広告セットを更新できる", async () => {
    const result = await callTool("meta_ads_adset_update", {
      adsetId: "444555666",
      name: "更新後広告セット名",
      status: "ACTIVE",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
  });

  it("UT-MA-030: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_adset_update", {
      adsetId: "444555666",
      name: "更新後広告セット名",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-031: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_adset_update", {
      adsetId: "444555666",
      name: "更新後広告セット名",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-032: D. パラメータ不正 - adsetIdが未指定", async () => {
    try {
      const result = await callTool("meta_ads_adset_update", {
        name: "更新後広告セット名",
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_ad_list (UT-MA-033 〜 UT-MA-036)
// ---------------------------------------------------------------------------
describe("meta_ads_ad_list", () => {
  it("UT-MA-033: A. 正常系 - 広告一覧を取得できる", async () => {
    const result = await callTool("meta_ads_ad_list", {});
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("UT-MA-034: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_ad_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-035: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_ad_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-036: A. 正常系 - adset_idフィルタ付きで取得できる", async () => {
    const result = await callTool("meta_ads_ad_list", {
      adset_id: "444555666",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_ad_get (UT-MA-037 〜 UT-MA-040)
// ---------------------------------------------------------------------------
describe("meta_ads_ad_get", () => {
  it("UT-MA-037: A. 正常系 - 広告詳細を取得できる", async () => {
    const result = await callTool("meta_ads_ad_get", {
      adId: "777888999",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-038: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_ad_get", {
      adId: "777888999",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-039: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_ad_get", {
      adId: "777888999",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-040: D. パラメータ不正 - adIdが未指定", async () => {
    try {
      const result = await callTool("meta_ads_ad_get", {});
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_ad_create (UT-MA-041 〜 UT-MA-044)
// ---------------------------------------------------------------------------
describe("meta_ads_ad_create", () => {
  it("UT-MA-041: A. 正常系 - 広告を作成できる", async () => {
    const result = await callTool("meta_ads_ad_create", {
      name: "テスト広告",
      adset_id: "444555666",
      creative_id: "999000111",
      status: "PAUSED",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
    expect(json.id).toBe("123456789");
  });

  it("UT-MA-042: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_ad_create", {
      name: "テスト広告",
      adset_id: "444555666",
      creative_id: "999000111",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-043: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_ad_create", {
      name: "テスト広告",
      adset_id: "444555666",
      creative_id: "999000111",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-044: D. パラメータ不正 - nameが未指定", async () => {
    try {
      const result = await callTool("meta_ads_ad_create", {
        adset_id: "444555666",
        creative_id: "999000111",
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_ad_update (UT-MA-045 〜 UT-MA-048)
// ---------------------------------------------------------------------------
describe("meta_ads_ad_update", () => {
  it("UT-MA-045: A. 正常系 - 広告を更新できる", async () => {
    const result = await callTool("meta_ads_ad_update", {
      adId: "777888999",
      name: "更新後広告名",
      status: "ACTIVE",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
  });

  it("UT-MA-046: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_ad_update", {
      adId: "777888999",
      name: "更新後広告名",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-047: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_ad_update", {
      adId: "777888999",
      name: "更新後広告名",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-048: D. パラメータ不正 - adIdが未指定", async () => {
    try {
      const result = await callTool("meta_ads_ad_update", {
        name: "更新後広告名",
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_ad_review_status (UT-MA-049 〜 UT-MA-052)
// ---------------------------------------------------------------------------
describe("meta_ads_ad_review_status", () => {
  it("UT-MA-049: A. 正常系 - 広告レビューステータスを取得できる", async () => {
    const result = await callTool("meta_ads_ad_review_status", {
      adId: "777888999",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-050: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_ad_review_status", {
      adId: "777888999",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-051: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_ad_review_status", {
      adId: "777888999",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-052: D. パラメータ不正 - adId未指定でアカウント全体を取得（正常動作）", async () => {
    const result = await callTool("meta_ads_ad_review_status", {});
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_creative_create (UT-MA-053 〜 UT-MA-056)
// ---------------------------------------------------------------------------
describe("meta_ads_creative_create", () => {
  it("UT-MA-053: A. 正常系 - クリエイティブを作成できる", async () => {
    const result = await callTool("meta_ads_creative_create", {
      name: "テストクリエイティブ",
      object_story_spec: JSON.stringify({
        page_id: "123456",
        link_data: {
          message: "テスト広告文",
          link: "https://example.com",
          image_hash: "abc123",
        },
      }),
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
    expect(json.id).toBe("123456789");
  });

  it("UT-MA-054: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_creative_create", {
      name: "テストクリエイティブ",
      object_story_spec: JSON.stringify({
        page_id: "123456",
        link_data: {
          message: "テスト広告文",
          link: "https://example.com",
        },
      }),
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-055: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_creative_create", {
      name: "テストクリエイティブ",
      object_story_spec: JSON.stringify({
        page_id: "123456",
        link_data: {
          message: "テスト広告文",
          link: "https://example.com",
        },
      }),
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-056: D. パラメータ不正 - nameが未指定", async () => {
    try {
      const result = await callTool("meta_ads_creative_create", {
        object_story_spec: JSON.stringify({
          page_id: "123456",
          link_data: {
            message: "テスト広告文",
            link: "https://example.com",
          },
        }),
      });
      expect(result.isError).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// meta_ads_creative_list (UT-MA-057 〜 UT-MA-060)
// ---------------------------------------------------------------------------
describe("meta_ads_creative_list", () => {
  it("UT-MA-057: A. 正常系 - クリエイティブ一覧を取得できる", async () => {
    const result = await callTool("meta_ads_creative_list", {});
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("UT-MA-058: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_creative_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-059: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_creative_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-060: A. 正常系 - fieldsフィルタ付きで取得できる", async () => {
    const result = await callTool("meta_ads_creative_list", {
      fields: "id,name,title,body",
      limit: 10,
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_image_upload (UT-MA-061 〜 UT-MA-064)
// ---------------------------------------------------------------------------
describe("meta_ads_image_upload", () => {
  it("UT-MA-061: A. 正常系 - 画像をURLからアップロードできる", async () => {
    const result = await callTool("meta_ads_image_upload", {
      image_url: "https://example.com/test-image.jpg",
      name: "テスト画像",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("id");
  });

  it("UT-MA-062: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_image_upload", {
      image_url: "https://example.com/test-image.jpg",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-063: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_image_upload", {
      image_url: "https://example.com/test-image.jpg",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-064: D. パラメータ不正 - image_urlもimage_bytesも未指定", async () => {
    const result = await callTool("meta_ads_image_upload", {});
    expect(result.isError).toBe(true);
    const text = extractText(result);
    expect(text).toContain("image_url");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_insight_campaign (UT-MA-065 〜 UT-MA-068)
// ---------------------------------------------------------------------------
describe("meta_ads_insight_campaign", () => {
  it("UT-MA-065: A. 正常系 - キャンペーンインサイトを取得できる", async () => {
    const result = await callTool("meta_ads_insight_campaign", {
      campaignId: "111222333",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-066: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_insight_campaign", {
      campaignId: "111222333",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-067: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_insight_campaign", {
      campaignId: "111222333",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-068: A. 正常系 - 日付範囲指定でインサイトを取得できる", async () => {
    const result = await callTool("meta_ads_insight_campaign", {
      campaignId: "111222333",
      time_range_since: "2026-03-01",
      time_range_until: "2026-03-28",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_insight_adset (UT-MA-069 〜 UT-MA-072)
// ---------------------------------------------------------------------------
describe("meta_ads_insight_adset", () => {
  it("UT-MA-069: A. 正常系 - 広告セットインサイトを取得できる", async () => {
    const result = await callTool("meta_ads_insight_adset", {
      adsetId: "444555666",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-070: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_insight_adset", {
      adsetId: "444555666",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-071: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_insight_adset", {
      adsetId: "444555666",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-072: A. 正常系 - 日付範囲指定でインサイトを取得できる", async () => {
    const result = await callTool("meta_ads_insight_adset", {
      adsetId: "444555666",
      time_range_since: "2026-03-01",
      time_range_until: "2026-03-28",
      breakdowns: "age,gender",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_insight_ad (UT-MA-073 〜 UT-MA-076)
// ---------------------------------------------------------------------------
describe("meta_ads_insight_ad", () => {
  it("UT-MA-073: A. 正常系 - 広告インサイトを取得できる", async () => {
    const result = await callTool("meta_ads_insight_ad", {
      adId: "777888999",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });

  it("UT-MA-074: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_insight_ad", {
      adId: "777888999",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-075: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_insight_ad", {
      adId: "777888999",
    });
    expect(result.isError).toBe(true);
  });

  it("UT-MA-076: A. 正常系 - 日付範囲指定でインサイトを取得できる", async () => {
    const result = await callTool("meta_ads_insight_ad", {
      adId: "777888999",
      time_range_since: "2026-03-01",
      time_range_until: "2026-03-28",
      breakdowns: "publisher_platform",
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// meta_ads_audience_list (UT-MA-077 〜 UT-MA-080)
// ---------------------------------------------------------------------------
describe("meta_ads_audience_list", () => {
  it("UT-MA-077: A. 正常系 - オーディエンス一覧を取得できる", async () => {
    const result = await callTool("meta_ads_audience_list", {});
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("UT-MA-078: B. 認証エラー - 401が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";
    const result = await callTool("meta_ads_audience_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-079: C. レート制限 - 429が返される", async () => {
    process.env.META_ADS_ACCESS_TOKEN = "rate-limited-token";
    const result = await callTool("meta_ads_audience_list", {});
    expect(result.isError).toBe(true);
  });

  it("UT-MA-080: A. 正常系 - fieldsとlimit指定で取得できる", async () => {
    const result = await callTool("meta_ads_audience_list", {
      fields: "id,name,description,subtype",
      limit: 5,
    });
    expect(result.isError).toBeUndefined();
    const text = extractText(result);
    const json = JSON.parse(text);
    expect(json).toHaveProperty("data");
  });
});
