/**
 * Google Ads キーワード一覧取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildKeywordListQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsKeywordList(server: McpServer): void {
  server.tool(
    "google_ads_keyword_list",
    "Google Ads のキーワード一覧を取得します。広告グループID、キャンペーンID、ステータスでフィルタ可能です。品質スコアやメトリクスも含まれます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupId: z
        .string()
        .optional()
        .describe("広告グループIDでフィルタ"),
      campaignId: z
        .string()
        .optional()
        .describe("キャンペーンIDでフィルタ"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .optional()
        .describe("キーワードステータスでフィルタ"),
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
        const query = buildKeywordListQuery({
          adGroupId: params.adGroupId,
          campaignId: params.campaignId,
          status: params.status,
          limit: params.limit,
        });
        const rows = await searchGoogleAds(customerId, query);

        const keywords = rows.map((row) => ({
          adGroupCriterion: row.adGroupCriterion,
          adGroup: row.adGroup,
          campaign: row.campaign,
          metrics: row.metrics,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: keywords.length, keywords },
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
