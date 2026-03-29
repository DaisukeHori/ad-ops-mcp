/**
 * Meta Ads Graph API クライアントの単体テスト
 * UT-CLI-005 〜 UT-CLI-008
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { metaGet, metaPost } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";

describe("Meta Ads Client", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.META_ADS_ACCESS_TOKEN = "test-meta-access-token";
    process.env.META_ADS_ACCOUNT_ID = "123456789";
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("UT-CLI-005: metaGet がデータを返す", async () => {
    const result = await metaGet<{ data: unknown[] }>("act_123456789/campaigns");
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("UT-CLI-006: metaPost がデータを返す", async () => {
    const result = await metaPost<{ id: string }>("act_123456789/campaigns", {
      name: "テストキャンペーン",
      objective: "OUTCOME_AWARENESS",
      status: "PAUSED",
    });
    expect(result).toBeDefined();
    expect(result.id).toBe("123456789");
  });

  it("UT-CLI-007: GET リクエストで access_token がクエリパラメータに含まれる", async () => {
    // モック側は access_token パラメータが存在しない場合 401 を返す
    // 正常にデータが返る = access_token がクエリパラメータに含まれている
    const result = await metaGet<{ data: unknown[] }>("act_123456789/campaigns");
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
  });

  it("UT-CLI-008: API エラー時に PlatformError('meta') がスローされる", async () => {
    // 無効なトークンを設定してエラーを起こす
    process.env.META_ADS_ACCESS_TOKEN = "invalid-token";

    await expect(
      metaGet("act_123456789/campaigns")
    ).rejects.toThrow(PlatformError);

    await expect(
      metaGet("act_123456789/campaigns")
    ).rejects.toMatchObject({
      platform: "meta",
      status: 401,
    });
  });
});
