/**
 * Google Ads OAuth2 認証の単体テスト
 * UT-AUTH-001 〜 UT-AUTH-005
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getGoogleAdsAccessToken, clearTokenCache } from "@/lib/platforms/google-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";

describe("Google Ads Auth", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.GOOGLE_ADS_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_ADS_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_ADS_REFRESH_TOKEN = "test-refresh-token";
    clearTokenCache();
  });

  afterEach(() => {
    process.env = savedEnv;
    clearTokenCache();
  });

  it("UT-AUTH-001: 正常なリフレッシュでアクセストークンを取得できる", async () => {
    const token = await getGoogleAdsAccessToken();
    expect(token).toBe("mock-access-token");
  });

  it("UT-AUTH-002: 2回目の呼び出しはキャッシュから返される", async () => {
    const token1 = await getGoogleAdsAccessToken();
    const token2 = await getGoogleAdsAccessToken();
    expect(token1).toBe("mock-access-token");
    expect(token2).toBe("mock-access-token");
    // キャッシュが効いているため同じ値
    expect(token1).toBe(token2);
  });

  it("UT-AUTH-003: キャッシュクリア後に再取得できる", async () => {
    const token1 = await getGoogleAdsAccessToken();
    expect(token1).toBe("mock-access-token");

    clearTokenCache();

    const token2 = await getGoogleAdsAccessToken();
    expect(token2).toBe("mock-access-token");
  });

  it("UT-AUTH-004: 無効な refresh token で PlatformError(401) がスローされる", async () => {
    process.env.GOOGLE_ADS_REFRESH_TOKEN = "invalid-refresh-token";

    await expect(getGoogleAdsAccessToken()).rejects.toThrow(PlatformError);
    await expect(getGoogleAdsAccessToken()).rejects.toMatchObject({
      platform: "google_ads",
      status: 401,
    });
  });

  it("UT-AUTH-005: サーバーエラー時に PlatformError(500) がスローされる", async () => {
    process.env.GOOGLE_ADS_REFRESH_TOKEN = "server-error-token";

    await expect(getGoogleAdsAccessToken()).rejects.toThrow(PlatformError);
    await expect(getGoogleAdsAccessToken()).rejects.toMatchObject({
      platform: "google_ads",
      status: 500,
    });
  });
});
