/**
 * Google Business Profile API モックハンドラー
 * プラットフォームテスト・ツールテストで使用
 */

import { http, HttpResponse } from "msw";

const GBP_BASE_URL = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GBP_REVIEWS_URL = "https://mybusiness.googleapis.com/v4";
const GBP_PERFORMANCE_URL = "https://businessprofileperformance.googleapis.com/v1";

export const gbpHandlers = [
  // Business Information API - 汎用 GET
  http.get(`${GBP_BASE_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    if (authHeader === "Bearer rate-limited-token") {
      return HttpResponse.json(
        { error: { code: 429, message: "RESOURCE_EXHAUSTED", status: "RESOURCE_EXHAUSTED" } },
        { status: 429 }
      );
    }

    return HttpResponse.json({ locations: [] });
  }),

  // Business Information API - 汎用 PATCH
  http.patch(`${GBP_BASE_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({ name: "locations/mock-location" });
  }),

  // Reviews API - 汎用 GET
  http.get(`${GBP_REVIEWS_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({ reviews: [] });
  }),

  // Reviews API - 汎用 PUT (返信)
  http.put(`${GBP_REVIEWS_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({ comment: "返信テスト" });
  }),

  // Reviews API - 汎用 POST (投稿作成)
  http.post(`${GBP_REVIEWS_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({ name: "locations/mock-location/localPosts/mock-post" });
  }),

  // Reviews API - 汎用 DELETE
  http.delete(`${GBP_REVIEWS_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Performance API - GET
  http.get(`${GBP_PERFORMANCE_URL}/*`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({ multiDailyMetricTimeSeries: [] });
  }),
];
