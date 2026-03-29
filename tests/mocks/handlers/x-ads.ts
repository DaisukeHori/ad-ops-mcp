/**
 * X (Twitter) Ads API モックハンドラー
 * プラットフォームテスト・ツールテストで使用
 */

import { http, HttpResponse } from "msw";

const BASE_URL = "https://ads-api.x.com/12";

export const xAdsHandlers = [
  // 汎用 GET
  http.get(`${BASE_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    // 認証エラー（OAuth 1.0a ヘッダーなし）
    if (!authHeader || !authHeader.startsWith("OAuth ")) {
      return HttpResponse.json(
        { errors: [{ code: "UNAUTHORIZED", message: "Invalid or expired token." }] },
        { status: 401 }
      );
    }

    // レート制限
    if (authHeader.includes("rate-limited")) {
      return HttpResponse.json(
        { errors: [{ code: "RATE_LIMIT", message: "Rate limit exceeded." }] },
        { status: 429 }
      );
    }

    // 正常レスポンス
    return HttpResponse.json({
      data: [],
      request: { params: {} },
    });
  }),

  // 汎用 POST
  http.post(`${BASE_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("OAuth ")) {
      return HttpResponse.json(
        { errors: [{ code: "UNAUTHORIZED", message: "Invalid or expired token." }] },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      data: { id: "mock-id-123" },
      request: { params: {} },
    });
  }),

  // 汎用 PUT
  http.put(`${BASE_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("OAuth ")) {
      return HttpResponse.json(
        { errors: [{ code: "UNAUTHORIZED", message: "Invalid or expired token." }] },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      data: { id: "mock-id-123" },
      request: { params: {} },
    });
  }),
];
