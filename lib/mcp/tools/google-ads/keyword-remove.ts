/**
 * Google Ads キーワード削除ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsKeywordRemove(server: McpServer): void {
  server.tool(
    "google_ads_keyword_remove",
    "Google Ads からキーワードを削除（REMOVED状態に変更）します。広告グループIDとキーワードのcriterionIDを指定します。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupId: z
        .string()
        .describe("キーワードが所属する広告グループのID"),
      criterionIds: z
        .array(z.string())
        .min(1)
        .describe("削除するキーワードのcriterion IDリスト"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const cleanCustomerId = customerId.replace(/-/g, "");

        const operations = params.criterionIds.map((criterionId) => ({
          remove: `customers/${cleanCustomerId}/adGroupCriteria/${params.adGroupId}~${criterionId}`,
        }));

        const result = await mutateGoogleAds(
          customerId,
          "adGroupCriteria",
          operations
        );

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
