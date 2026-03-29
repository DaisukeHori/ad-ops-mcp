/**
 * Meta Marketing API モックハンドラー
 * プラットフォームテスト・ツールテストで使用
 */

import { http, HttpResponse } from "msw";

const BASE_URL = "https://graph.facebook.com/v25.0";

export const metaAdsHandlers = [
  // 汎用 GET
  http.get(`${BASE_URL}/*`, ({ request }) => {
    const url = new URL(request.url);
    const accessToken = url.searchParams.get("access_token");

    // 認証エラー
    if (!accessToken || accessToken === "invalid-token") {
      return HttpResponse.json(
        { error: { message: "Invalid OAuth access token.", type: "OAuthException", code: 190 } },
        { status: 401 }
      );
    }

    // レート制限
    if (accessToken === "rate-limited-token") {
      return HttpResponse.json(
        { error: { message: "Too many calls.", type: "OAuthException", code: 32 } },
        { status: 429 }
      );
    }

    // 正常レスポンス（空データ）
    return HttpResponse.json({ data: [] });
  }),

  // 汎用 POST
  http.post(`${BASE_URL}/*`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const accessToken = body.access_token as string | undefined;

    // 認証エラー
    if (!accessToken || accessToken === "invalid-token") {
      return HttpResponse.json(
        { error: { message: "Invalid OAuth access token.", type: "OAuthException", code: 190 } },
        { status: 401 }
      );
    }

    // レート制限
    if (accessToken === "rate-limited-token") {
      return HttpResponse.json(
        { error: { message: "Too many calls.", type: "OAuthException", code: 32 } },
        { status: 429 }
      );
    }

    // 正常レスポンス
    return HttpResponse.json({ id: "123456789" });
  }),
];
