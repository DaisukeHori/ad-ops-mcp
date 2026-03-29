/**
 * Google Ads キャンペーン詳細取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildCampaignGetQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsCampaignGet(server: McpServer): void {
  server.tool(
    "google_ads_campaign_get",
    "Google Ads の特定キャンペーンの詳細情報を取得します。ネットワーク設定や詳細メトリクスを含みます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      campaignId: z
        .string()
        .describe("取得するキャンペーンのID"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const query = buildCampaignGetQuery(params.campaignId);
        const rows = await searchGoogleAds(customerId, query);

        if (rows.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `キャンペーンID ${params.campaignId} が見つかりませんでした。`,
              },
            ],
            isError: true,
          };
        }

        const result = {
          campaign: rows[0].campaign,
          metrics: rows[0].metrics,
        };

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
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
