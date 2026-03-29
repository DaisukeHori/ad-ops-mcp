/**
 * Google Ads 予算更新ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsBudgetUpdate(server: McpServer): void {
  server.tool(
    "google_ads_budget_update",
    "Google Ads の既存キャンペーン予算を更新します。金額はマイクロ単位（1円 = 1,000,000）で指定してください。例: 日予算2,000円 → amountMicros = 2000000000",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      budgetId: z.string().describe("更新する予算のID"),
      name: z.string().optional().describe("新しい予算名"),
      amountMicros: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("新しい日予算額（マイクロ単位: 1円 = 1,000,000）"),
      deliveryMethod: z
        .enum(["STANDARD", "ACCELERATED"])
        .optional()
        .describe("新しい配信方法"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const cleanCustomerId = customerId.replace(/-/g, "");
        const resourceName = `customers/${cleanCustomerId}/campaignBudgets/${params.budgetId}`;

        const updateData: Record<string, unknown> = { resourceName };
        const updateMaskFields: string[] = [];

        if (params.name !== undefined) {
          updateData.name = params.name;
          updateMaskFields.push("name");
        }
        if (params.amountMicros !== undefined) {
          updateData.amountMicros = String(params.amountMicros);
          updateMaskFields.push("amount_micros");
        }
        if (params.deliveryMethod !== undefined) {
          updateData.deliveryMethod = params.deliveryMethod;
          updateMaskFields.push("delivery_method");
        }

        if (updateMaskFields.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "更新するフィールドが指定されていません。name, amountMicros, deliveryMethod のいずれかを指定してください。",
              },
            ],
            isError: true,
          };
        }

        const result = await mutateGoogleAds(customerId, "campaignBudgets", [
          {
            update: updateData,
            updateMask: updateMaskFields.join(","),
          },
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
