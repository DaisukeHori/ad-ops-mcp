/**
 * Google Ads 広告一覧取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildAdListQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdList(server: McpServer): void {
  server.tool(
    "google_ads_ad_list",
    "Google Ads の広告一覧を取得します。広告グループIDやステータスでフィルタ可能です。レスポンシブ検索広告の見出し・説明文やメトリクスも含まれます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupId: z
        .string()
        .optional()
        .describe("広告グループIDでフィルタ"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .optional()
        .describe("広告ステータスでフィルタ"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10000)
        .optional()
        .describe("取得する最大件数"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const query = buildAdListQuery({
          adGroupId: params.adGroupId,
          status: params.status,
          limit: params.limit,
        });
        const rows = await searchGoogleAds(customerId, query);

        const ads = rows.map((row) => ({
          adGroupAd: row.adGroupAd,
          adGroup: row.adGroup,
          campaign: row.campaign,
          metrics: row.metrics,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: ads.length, ads },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof PlatformError
            ? error.toUserMessage()
            : String(error);
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    }
  );
}
