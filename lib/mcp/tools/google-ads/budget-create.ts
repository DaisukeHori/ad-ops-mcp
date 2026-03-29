/**
 * Google Ads 予算作成ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsBudgetCreate(server: McpServer): void {
  server.tool(
    "google_ads_budget_create",
    "Google Ads に新しいキャンペーン予算を作成します。金額はマイクロ単位（1円 = 1,000,000）で指定してください。例: 日予算1,000円 → amountMicros = 1000000000",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      name: z.string().describe("予算名"),
      amountMicros: z
        .number()
        .int()
        .min(1)
        .describe("日予算額（マイクロ単位: 1円 = 1,000,000）"),
      deliveryMethod: z
        .enum(["STANDARD", "ACCELERATED"])
        .optional()
        .describe("配信方法（デフォルト: STANDARD）"),
      explicitlyShared: z
        .boolean()
        .optional()
        .describe("複数キャンペーンで共有するか（デフォルト: false）"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");

        const budgetData: Record<string, unknown> = {
          name: params.name,
          amountMicros: String(params.amountMicros),
          deliveryMethod: params.deliveryMethod ?? "STANDARD",
          explicitlyShared: params.explicitlyShared ?? false,
        };

        const result = await mutateGoogleAds(customerId, "campaignBudgets", [
          { create: budgetData },
        ]);

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
