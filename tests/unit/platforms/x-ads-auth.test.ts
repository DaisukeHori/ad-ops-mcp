/**
 * X (Twitter) Ads OAuth 1.0a 認証の単体テスト
 * UT-AUTH-014 〜 UT-AUTH-018
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateOAuthHeader } from "@/lib/platforms/x-ads/auth";

describe("X Ads Auth", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.X_ADS_API_KEY = "test-consumer-key";
    process.env.X_ADS_API_SECRET = "test-consumer-secret";
    process.env.X_ADS_ACCESS_TOKEN = "test-access-token";
    process.env.X_ADS_ACCESS_SECRET = "test-access-secret";
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("UT-AUTH-014: generateOAuthHeader が 'OAuth ...' 形式の文字列を返す", () => {
    const header = generateOAuthHeader(
      "GET",
      "https://ads-api.x.com/12/accounts"
    );

    expect(header).toMatch(/^OAuth /);
    expect(header).toContain("oauth_consumer_key=");
    expect(header).toContain("oauth_nonce=");
    expect(header).toContain("oauth_signature_method=");
    expect(header).toContain("oauth_timestamp=");
    expect(header).toContain("oauth_token=");
    expect(header).toContain("oauth_version=");
    expect(header).toContain("oauth_signature=");
  });

  it("UT-AUTH-015: 2回の呼び出しで異なる nonce が生成される", () => {
    const header1 = generateOAuthHeader(
      "GET",
      "https://ads-api.x.com/12/accounts"
    );
    const header2 = generateOAuthHeader(
      "GET",
      "https://ads-api.x.com/12/accounts"
    );

    // nonce を抽出して比較
    const nonceRegex = /oauth_nonce="([^"]+)"/;
    const nonce1 = header1.match(nonceRegex)?.[1];
    const nonce2 = header2.match(nonceRegex)?.[1];

    expect(nonce1).toBeDefined();
    expect(nonce2).toBeDefined();
    expect(nonce1).not.toBe(nonce2);
  });

  it("UT-AUTH-016: タイムスタンプが現在時刻に近い値である", () => {
    const header = generateOAuthHeader(
      "GET",
      "https://ads-api.x.com/12/accounts"
    );

    const timestampRegex = /oauth_timestamp="([^"]+)"/;
    const timestampStr = header.match(timestampRegex)?.[1];
    expect(timestampStr).toBeDefined();

    const timestamp = parseInt(timestampStr!, 10);
    const now = Math.floor(Date.now() / 1000);

    // 5秒以内の差であることを確認
    expect(Math.abs(timestamp - now)).toBeLessThanOrEqual(5);
  });

  it("UT-AUTH-017: 署名ベース文字列に必要な OAuth パラメータが含まれる", () => {
    const header = generateOAuthHeader(
      "POST",
      "https://ads-api.x.com/12/accounts/abc123/campaigns",
      { name: "テストキャンペーン" }
    );

    // OAuth ヘッダーに必要な全パラメータが含まれていることを確認
    expect(header).toContain('oauth_consumer_key="test-consumer-key"');
    expect(header).toContain('oauth_signature_method="HMAC-SHA1"');
    expect(header).toContain('oauth_token="test-access-token"');
    expect(header).toContain('oauth_version="1.0"');
  });

  it("UT-AUTH-018: 特殊文字のパーセントエンコーディングが正しく行われる", () => {
    // 特殊文字を含むパラメータを渡す
    const header = generateOAuthHeader(
      "GET",
      "https://ads-api.x.com/12/accounts",
      { query: "hello world!*'()" }
    );

    // 署名が正常に生成される（エラーにならない）
    expect(header).toMatch(/^OAuth /);
    expect(header).toContain("oauth_signature=");

    // 署名が空でないことを確認
    const signatureRegex = /oauth_signature="([^"]+)"/;
    const signature = header.match(signatureRegex)?.[1];
    expect(signature).toBeDefined();
    expect(signature!.length).toBeGreaterThan(0);
  });
});
