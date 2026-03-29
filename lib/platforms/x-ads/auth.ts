/**
 * X (Twitter) Ads OAuth 1.0a 認証
 * RFC 5849 に準拠した HMAC-SHA1 署名生成を行う
 */

import crypto from "node:crypto";
import { getEnv } from "@/lib/config";

/**
 * RFC 5849 に準拠したパーセントエンコーディング。
 * encodeURIComponent では不足する文字（! * ' ( )）も正しくエンコードする。
 */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

/**
 * OAuth 1.0a の Authorization ヘッダー文字列を生成する。
 *
 * @param method - HTTP メソッド（GET, POST, PUT, DELETE）
 * @param url - リクエスト先の完全な URL（クエリパラメータ含まない）
 * @param params - リクエストパラメータ（クエリパラメータや POST ボディ）
 * @returns "OAuth oauth_consumer_key=..., ..." 形式のヘッダー値
 */
export function generateOAuthHeader(
  method: string,
  url: string,
  params?: Record<string, string>
): string {
  const consumerKey = getEnv("X_ADS_API_KEY");
  const consumerSecret = getEnv("X_ADS_API_SECRET");
  const accessToken = getEnv("X_ADS_ACCESS_TOKEN");
  const accessTokenSecret = getEnv("X_ADS_ACCESS_SECRET");

  const oauthNonce = crypto.randomBytes(16).toString("hex");
  const oauthTimestamp = Math.floor(Date.now() / 1000).toString();

  // OAuth パラメータ
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: oauthNonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: oauthTimestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // 全パラメータを結合（OAuth パラメータ + リクエストパラメータ）
  const allParams: Record<string, string> = { ...oauthParams };
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      allParams[key] = value;
    }
  }

  // パラメータをキー名でソートし、パーセントエンコードして連結
  const sortedKeys = Object.keys(allParams).sort();
  const parameterString = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join("&");

  // 署名ベース文字列: METHOD&url_encode(base_url)&url_encode(sorted_params)
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(parameterString),
  ].join("&");

  // 署名キー: consumer_secret&token_secret
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;

  // HMAC-SHA1 署名を生成し、Base64 エンコード
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBaseString)
    .digest("base64");

  // Authorization ヘッダー用に OAuth パラメータ + 署名を組み立て
  oauthParams["oauth_signature"] = signature;

  const headerParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(", ");

  return `OAuth ${headerParams}`;
}
