/**
 * Google Business Profile API クライアントの単体テスト
 * UT-CLI-009 〜 UT-CLI-012
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { gbpGet, gbpPatch } from "@/lib/platforms/gbp/client";
import { resetTokenCache } from "@/lib/platforms/gbp/auth";
import { PlatformError } from "@/lib/platforms/errors";

describe("GBP Client", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.GBP_CLIENT_ID = "test-gbp-client-id";
    process.env.GBP_CLIENT_SECRET = "test-gbp-client-secret";
    process.env.GBP_REFRESH_TOKEN = "test-gbp-refresh-token";
    process.env.GBP_ACCOUNT_ID = "test-gbp-account-id";
    resetTokenCache();
  });

  afterEach(() => {
    process.env = savedEnv;
    resetTokenCache();
  });

  it("UT-CLI-009: gbpGet がデータを返す", async () => {
    const result = await gbpGet<{ locations: unknown[] }>(
      "https://mybusinessbusinessinformation.googleapis.com/v1/accounts/test-account/locations"
    );
    expect(result).toBeDefined();
    expect(result.locations).toBeDefined();
    expect(Array.isArray(result.locations)).toBe(true);
  });

  it("UT-CLI-010: gbpPatch がデータを返す", async () => {
    const result = await gbpPatch<{ name: string }>(
      "https://mybusinessbusinessinformation.googleapis.com/v1/locations/mock-location",
      { title: "更新テスト" }
    );
    expect(result).toBeDefined();
    expect(result.name).toBe("locations/mock-location");
  });

  it("UT-CLI-011: Authorization ヘッダーが Bearer トークンである", async () => {
    // モック側は Authorization: Bearer が無い場合 401 を返す設定
    // 正常にデータが返る = Bearer トークンが正しく送信されている
    const result = await gbpGet<{ locations: unknown[] }>(
      "https://mybusinessbusinessinformation.googleapis.com/v1/accounts/test-account/locations"
    );
    expect(result).toBeDefined();
    expect(result.locations).toBeDefined();
  });

  it("UT-CLI-012: API エラー時に PlatformError('gbp') がスローされる", async () => {
    // 無効な refresh token を設定してトークン取得を失敗させる
    process.env.GBP_REFRESH_TOKEN = "invalid-refresh-token";
    resetTokenCache();

    await expect(
      gbpGet("https://mybusinessbusinessinformation.googleapis.com/v1/accounts/test/locations")
    ).rejects.toThrow(PlatformError);

    await expect(
      gbpGet("https://mybusinessbusinessinformation.googleapis.com/v1/accounts/test/locations")
    ).rejects.toMatchObject({
      platform: "gbp",
    });
  });
});
