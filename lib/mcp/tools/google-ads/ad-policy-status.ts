/**
 * Google Ads 広告ポリシーステータス取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildAdPolicyStatusQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdPolicyStatus(server: McpServer): void {
  server.tool(
    "google_ads_ad_policy_status",
    "Google Ads の広告ポリシー審査ステータスを取得します。不承認や制限付き承認の広告を確認できます。",
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
        const query = buildAdPolicyStatusQuery({
          adGroupId: params.adGroupId,
          campaignId: params.campaignId,
          limit: params.limit,
        });
        const rows = await searchGoogleAds(customerId, query);

        const policyStatuses = rows.map((row) => ({
          adGroupAd: row.adGroupAd,
          adGroup: row.adGroup,
          campaign: row.campaign,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: policyStatuses.length, policyStatuses },
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
