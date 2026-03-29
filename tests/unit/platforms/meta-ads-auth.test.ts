/**
 * Meta Ads 認証の単体テスト
 * UT-AUTH-006 〜 UT-AUTH-008
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getMetaAccessToken, getMetaAccountId } from "@/lib/platforms/meta-ads/auth";

describe("Meta Ads Auth", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.META_ADS_ACCESS_TOKEN = "test-meta-access-token";
    process.env.META_ADS_ACCOUNT_ID = "123456789";
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("UT-AUTH-006: getMetaAccessToken が環境変数からトークンを返す", () => {
    const token = getMetaAccessToken();
    expect(token).toBe("test-meta-access-token");
  });

  it("UT-AUTH-007: META_ADS_ACCESS_TOKEN が未設定の場合にエラーをスローする", () => {
    delete process.env.META_ADS_ACCESS_TOKEN;

    expect(() => getMetaAccessToken()).toThrow(
      "環境変数 META_ADS_ACCESS_TOKEN が設定されていません"
    );
  });

  it("UT-AUTH-008: getMetaAccountId が act_ プレフィックスを自動付与する", () => {
    // act_ プレフィックスなしの場合
    process.env.META_ADS_ACCOUNT_ID = "123456789";
    expect(getMetaAccountId()).toBe("act_123456789");

    // act_ プレフィックスありの場合はそのまま返す
    process.env.META_ADS_ACCOUNT_ID = "act_987654321";
    expect(getMetaAccountId()).toBe("act_987654321");
  });
});
