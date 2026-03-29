/**
 * Google Business Profile 認証の単体テスト
 * UT-AUTH-009 〜 UT-AUTH-013
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getGbpAccessToken, resetTokenCache } from "@/lib/platforms/gbp/auth";
import { PlatformError } from "@/lib/platforms/errors";

describe("GBP Auth", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.GBP_CLIENT_ID = "test-gbp-client-id";
    process.env.GBP_CLIENT_SECRET = "test-gbp-client-secret";
    process.env.GBP_REFRESH_TOKEN = "test-gbp-refresh-token";
    resetTokenCache();
  });

  afterEach(() => {
    process.env = savedEnv;
    resetTokenCache();
  });

  it("UT-AUTH-009: 正常なトークンリフレッシュでアクセストークンを取得できる", async () => {
    const token = await getGbpAccessToken();
    expect(token).toBe("mock-access-token");
  });

  it("UT-AUTH-010: 2回目の呼び出しはキャッシュから返される", async () => {
    const token1 = await getGbpAccessToken();
    const token2 = await getGbpAccessToken();
    expect(token1).toBe("mock-access-token");
    expect(token2).toBe("mock-access-token");
    expect(token1).toBe(token2);
  });

  it("UT-AUTH-011: resetTokenCache 後に再取得できる", async () => {
    const token1 = await getGbpAccessToken();
    expect(token1).toBe("mock-access-token");

    resetTokenCache();

    const token2 = await getGbpAccessToken();
    expect(token2).toBe("mock-access-token");
  });

  it("UT-AUTH-012: 無効な refresh token で PlatformError がスローされる", async () => {
    process.env.GBP_REFRESH_TOKEN = "invalid-refresh-token";

    await expect(getGbpAccessToken()).rejects.toThrow(PlatformError);
    await expect(getGbpAccessToken()).rejects.toMatchObject({
      platform: "gbp",
      status: 401,
    });
  });

  it("UT-AUTH-013: GBP_REFRESH_TOKEN が未設定の場合にエラーをスローする", async () => {
    delete process.env.GBP_REFRESH_TOKEN;

    await expect(getGbpAccessToken()).rejects.toThrow(
      "環境変数 GBP_REFRESH_TOKEN が設定されていません"
    );
  });
});
