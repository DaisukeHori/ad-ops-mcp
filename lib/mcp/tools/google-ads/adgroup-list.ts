/**
 * Google Ads 広告グループ一覧取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildAdGroupListQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdGroupList(server: McpServer): void {
  server.tool(
    "google_ads_adgroup_list",
    "Google Ads の広告グループ一覧を取得します。キャンペーンIDやステータスでフィルタ可能です。メトリクスも含まれます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      campaignId: z
        .string()
        .optional()
        .describe("キャンペーンIDでフィルタ"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .optional()
        .describe("広告グループステータスでフィルタ"),
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
        const query = buildAdGroupListQuery({
          campaignId: params.campaignId,
          status: params.status,
          limit: params.limit,
        });
        const rows = await searchGoogleAds(customerId, query);

        const adGroups = rows.map((row) => ({
          adGroup: row.adGroup,
          campaign: row.campaign,
          metrics: row.metrics,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: adGroups.length, adGroups },
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
