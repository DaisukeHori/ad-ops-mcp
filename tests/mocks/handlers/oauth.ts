/**
 * OAuth2 トークンエンドポイントのモックハンドラー
 * Google Ads / GBP の OAuth2 リフレッシュに使用
 */

import { http, HttpResponse } from "msw";

export const oauthHandlers = [
  // Google OAuth2 トークンリフレッシュ
  http.post("https://oauth2.googleapis.com/token", async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const refreshToken = params.get("refresh_token");

    // 無効な refresh token
    if (refreshToken === "invalid-refresh-token") {
      return HttpResponse.json(
        { error: "invalid_grant", error_description: "Token has been revoked." },
        { status: 401 }
      );
    }

    // サーバーエラー
    if (refreshToken === "server-error-token") {
      return HttpResponse.json(
        { error: "server_error", error_description: "Internal server error." },
        { status: 500 }
      );
    }

    // 正常レスポンス
    return HttpResponse.json({
      access_token: "mock-access-token",
      expires_in: 3600,
      token_type: "Bearer",
      scope: "https://www.googleapis.com/auth/adwords",
    });
  }),
];
