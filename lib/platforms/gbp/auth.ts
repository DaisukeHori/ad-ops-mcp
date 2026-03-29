/**
 * Google Business Profile 認証管理
 * OAuth2 リフレッシュトークンを使用してアクセストークンを取得・キャッシュする
 */

import { getEnv } from "@/lib/config";
import { PlatformError } from "@/lib/platforms/errors";

/** トークンキャッシュ（モジュールレベル） */
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/** アクセストークンレスポンスの型 */
interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * GBP の OAuth2 アクセストークンを取得する。
 * キャッシュが有効（有効期限の60秒前まで）であればキャッシュから返す。
 * 期限切れの場合はリフレッシュトークンを使って新しいトークンを取得する。
 */
export async function getGbpAccessToken(): Promise<string> {
  const now = Date.now();

  // キャッシュが有効ならそのまま返す（60秒のバッファ）
  if (cachedAccessToken && now < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const clientId = getEnv("GBP_CLIENT_ID");
  const clientSecret = getEnv("GBP_CLIENT_SECRET");
  const refreshToken = getEnv("GBP_REFRESH_TOKEN");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new PlatformError(
      "gbp",
      response.status,
      `OAuth2 トークンリフレッシュに失敗しました: ${errorText}`
    );
  }

  const data = (await response.json()) as TokenResponse;

  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return cachedAccessToken;
}

/**
 * GBP のアカウント ID を環境変数から取得する。
 */
export function getGbpAccountId(): string {
  return getEnv("GBP_ACCOUNT_ID");
}

/**
 * テスト用: トークンキャッシュをリセットする
 */
export function resetTokenCache(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}
