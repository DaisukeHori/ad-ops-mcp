/**
 * Google Ads REST API クライアントの単体テスト
 * UT-CLI-001 〜 UT-CLI-004
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { searchGoogleAds, mutateGoogleAds, listAccessibleCustomers } from "@/lib/platforms/google-ads/client";
import { clearTokenCache } from "@/lib/platforms/google-ads/auth";

describe("Google Ads Client", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.GOOGLE_ADS_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_ADS_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_ADS_REFRESH_TOKEN = "test-refresh-token";
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN = "test-developer-token";
    process.env.GOOGLE_ADS_CUSTOMER_ID = "1234567890";
    process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = "9876543210";
    clearTokenCache();
  });

  afterEach(() => {
    process.env = savedEnv;
    clearTokenCache();
  });

  it("UT-CLI-001: searchGoogleAds が rows 配列を返す", async () => {
    const rows = await searchGoogleAds(
      "1234567890",
      "SELECT campaign.id, campaign.name FROM campaign"
    );
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("UT-CLI-002: mutateGoogleAds が results を返す", async () => {
    const result = await mutateGoogleAds(
      "1234567890",
      "campaignBudgets:mutate",
      [{ create: { name: "テスト予算", amountMicros: "1000000000" } }]
    );
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].resourceName).toContain("customers/1234567890");
  });

  it("UT-CLI-003: developer-token ヘッダーが送信される（存在しないと403になるモック設定で確認）", async () => {
    // developer-token が正しく設定されている場合、searchGoogleAds は成功する
    // モック側で developer-token が無い場合は 403 を返す設定になっている
    const rows = await searchGoogleAds(
      "1234567890",
      "SELECT campaign.id FROM campaign"
    );
    // developer-token が送信されているので成功する
    expect(Array.isArray(rows)).toBe(true);
  });

  it("UT-CLI-004: listAccessibleCustomers がリソース名の配列を返す", async () => {
    const resourceNames = await listAccessibleCustomers();
    expect(Array.isArray(resourceNames)).toBe(true);
    expect(resourceNames).toEqual(["customers/1234567890", "customers/9876543210"]);
  });
});
