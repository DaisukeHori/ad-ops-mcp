/**
 * Google Ads OAuth2 認証
 * Refresh Token を使って Access Token を自動取得・キャッシュする
 */

import { getEnv } from "@/lib/config";
import { PlatformError } from "@/lib/platforms/errors";

/** モジュールレベルのトークンキャッシュ */
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/** トークンレスポンスの型 */
interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/** エラーレスポンスの型 */
interface TokenErrorResponse {
  error: string;
  error_description: string;
}

/**
 * Google Ads API 用の Access Token を取得する。
 * キャッシュが有効な場合はキャッシュから返す。
 * 有効期限の60秒前にリフレッシュを行う。
 */
export async function getGoogleAdsAccessToken(): Promise<string> {
  const now = Date.now();

  // キャッシュが有効（有効期限の60秒前まで）ならそのまま返す
  if (cachedAccessToken && now < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const clientId = getEnv("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_ADS_CLIENT_SECRET");
  const refreshToken = getEnv("GOOGLE_ADS_REFRESH_TOKEN");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = (await response.json()) as TokenErrorResponse;
      errorMessage = `${errorData.error}: ${errorData.error_description}`;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new PlatformError("google_ads", response.status, `OAuth2 トークンリフレッシュに失敗しました: ${errorMessage}`);
  }

  const data = (await response.json()) as TokenResponse;

  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return cachedAccessToken;
}

/**
 * テスト用: キャッシュをクリアする
 */
export function clearTokenCache(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}
