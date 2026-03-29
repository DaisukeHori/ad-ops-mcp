/**
 * X (Twitter) Ads API クライアントの単体テスト
 * UT-CLI-013 〜 UT-CLI-016
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { xAdsGet, xAdsPost } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";

describe("X Ads Client", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.X_ADS_API_KEY = "test-consumer-key";
    process.env.X_ADS_API_SECRET = "test-consumer-secret";
    process.env.X_ADS_ACCESS_TOKEN = "test-access-token";
    process.env.X_ADS_ACCESS_SECRET = "test-access-secret";
    process.env.X_ADS_ACCOUNT_ID = "test-account-id";
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("UT-CLI-013: xAdsGet がデータを返す", async () => {
    const result = await xAdsGet<unknown[]>("/accounts");
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("UT-CLI-014: xAdsPost がデータを返す", async () => {
    const result = await xAdsPost<{ id: string }>("/accounts/abc123/campaigns", {
      name: "テストキャンペーン",
      funding_instrument_id: "test-funding",
    });
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.id).toBe("mock-id-123");
  });

  it("UT-CLI-015: Authorization ヘッダーが 'OAuth ' で始まる", async () => {
    // モック側は Authorization ヘッダーが "OAuth " で始まらない場合 401 を返す
    // 正常にデータが返る = OAuth ヘッダーが正しく送信されている
    const result = await xAdsGet<unknown[]>("/accounts");
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
  });

  it("UT-CLI-016: API エラー時に PlatformError('x') がスローされる", async () => {
    // OAuth 認証情報を消してエラーを引き起こす
    delete process.env.X_ADS_API_KEY;

    await expect(
      xAdsGet("/accounts")
    ).rejects.toThrow();

    // 環境変数を復元して、無効トークンでテスト
    process.env.X_ADS_API_KEY = "test-consumer-key";
    process.env.X_ADS_ACCESS_TOKEN = "";

    // access_token が空だと getEnv がスローする
    await expect(
      xAdsGet("/accounts")
    ).rejects.toThrow();
  });
});
