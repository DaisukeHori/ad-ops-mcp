/**
 * Google Ads キャンペーン一覧取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildCampaignListQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsCampaignList(server: McpServer): void {
  server.tool(
    "google_ads_campaign_list",
    "Google Ads のキャンペーン一覧を取得します。ステータスや上限件数でフィルタ可能です。メトリクス（表示回数、クリック数、費用など）も含まれます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .optional()
        .describe("キャンペーンステータスでフィルタ"),
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
        const query = buildCampaignListQuery({
          status: params.status,
          limit: params.limit,
        });
        const rows = await searchGoogleAds(customerId, query);

        const campaigns = rows.map((row) => ({
          campaign: row.campaign,
          metrics: row.metrics,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: campaigns.length, campaigns },
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
