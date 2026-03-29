/**
 * Google Ads API モックハンドラー
 * プラットフォームテスト・ツールテストで使用
 */

import { http, HttpResponse } from "msw";

const BASE_URL = "https://googleads.googleapis.com/v23";

export const googleAdsHandlers = [
  // searchStream
  http.post(`${BASE_URL}/customers/:customerId/googleAds:searchStream`, async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    const devToken = request.headers.get("developer-token");

    // 認証エラー
    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "Request had invalid authentication credentials.", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    // developer-token 未設定
    if (!devToken) {
      return HttpResponse.json(
        { error: { code: 403, message: "Developer token is required.", status: "PERMISSION_DENIED" } },
        { status: 403 }
      );
    }

    // レート制限
    if (devToken === "rate-limited-token") {
      return HttpResponse.json(
        { error: { code: 429, message: "Resource has been exhausted.", status: "RESOURCE_EXHAUSTED" } },
        { status: 429 }
      );
    }

    // 正常レスポンス（サンプルデータ付き）
    return HttpResponse.json([{ results: [{ campaign: { id: "123456", name: "テストキャンペーン", status: "ENABLED", advertisingChannelType: "SEARCH" }, adGroup: { id: "789012", name: "テスト広告グループ", status: "ENABLED" }, adGroupAd: { ad: { id: "345678", type: "RESPONSIVE_SEARCH_AD" }, status: "ENABLED", policySummary: { approvalStatus: "APPROVED", reviewStatus: "REVIEWED" } }, adGroupCriterion: { criterionId: "567890", keyword: { text: "テストキーワード", matchType: "BROAD" }, status: "ENABLED" }, campaignBudget: { id: "111222", name: "テスト予算", amountMicros: "1000000000", status: "ENABLED" }, metrics: { impressions: "1000", clicks: "50", costMicros: "500000000", conversions: "5", ctr: "0.05", averageCpc: "10000000" }, segments: { date: "2026-03-28" } }] }]);
  }),

  // mutate（汎用）
  http.post(`${BASE_URL}/customers/:customerId/:service`, async ({ request, params }) => {
    const authHeader = request.headers.get("authorization");
    const service = params.service as string;

    // 認証エラー
    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "Request had invalid authentication credentials.", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    // レート制限
    if (request.headers.get("developer-token") === "rate-limited-token") {
      return HttpResponse.json(
        { error: { code: 429, message: "Resource has been exhausted.", status: "RESOURCE_EXHAUSTED" } },
        { status: 429 }
      );
    }

    // 正常レスポンス
    const customerId = params.customerId as string;
    return HttpResponse.json({
      results: [
        {
          resourceName: `customers/${customerId}/${service}/123456`,
        },
      ],
    });
  }),

  // ListAccessibleCustomers
  http.get(`${BASE_URL}/customers:listAccessibleCustomers`, ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || authHeader === "Bearer invalid-token") {
      return HttpResponse.json(
        { error: { code: 401, message: "UNAUTHENTICATED", status: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      resourceNames: ["customers/1234567890", "customers/9876543210"],
    });
  }),
];
