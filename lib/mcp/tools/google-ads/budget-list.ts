/**
 * Google Ads 予算一覧取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildBudgetListQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsBudgetList(server: McpServer): void {
  server.tool(
    "google_ads_budget_list",
    "Google Ads のキャンペーン予算一覧を取得します。予算額はマイクロ単位（1円 = 1,000,000）で返されます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
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
        const query = buildBudgetListQuery({ limit: params.limit });
        const rows = await searchGoogleAds(customerId, query);

        const budgets = rows.map((row) => row.campaignBudget);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: budgets.length, budgets },
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
