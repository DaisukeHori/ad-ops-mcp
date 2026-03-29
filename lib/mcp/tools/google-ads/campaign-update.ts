/**
 * Google Ads キャンペーン更新ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsCampaignUpdate(server: McpServer): void {
  server.tool(
    "google_ads_campaign_update",
    "Google Ads の既存キャンペーンを更新します。名前、ステータス、入札戦略などを変更できます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      campaignId: z.string().describe("更新するキャンペーンのID"),
      name: z.string().optional().describe("新しいキャンペーン名"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .optional()
        .describe("新しいステータス"),
      budgetResourceName: z
        .string()
        .optional()
        .describe("新しい予算のリソース名（例: customers/123/campaignBudgets/456）"),
      targetCpaMicros: z
        .number()
        .int()
        .optional()
        .describe("新しい目標CPA（マイクロ単位: 1円 = 1,000,000）"),
      targetRoas: z
        .number()
        .optional()
        .describe("新しい目標ROAS（例: 4.0 = 400%）"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const cleanCustomerId = customerId.replace(/-/g, "");
        const resourceName = `customers/${cleanCustomerId}/campaigns/${params.campaignId}`;

        const updateData: Record<string, unknown> = { resourceName };
        const updateMaskFields: string[] = [];

        if (params.name !== undefined) {
          updateData.name = params.name;
          updateMaskFields.push("name");
        }
        if (params.status !== undefined) {
          updateData.status = params.status;
          updateMaskFields.push("status");
        }
        if (params.budgetResourceName !== undefined) {
          updateData.campaignBudget = params.budgetResourceName;
          updateMaskFields.push("campaign_budget");
        }
        if (params.targetCpaMicros !== undefined) {
          updateData.targetCpa = {
            targetCpaMicros: String(params.targetCpaMicros),
          };
          updateMaskFields.push("target_cpa.target_cpa_micros");
        }
        if (params.targetRoas !== undefined) {
          updateData.targetRoas = { targetRoas: params.targetRoas };
          updateMaskFields.push("target_roas.target_roas");
        }

        if (updateMaskFields.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "更新するフィールドが指定されていません。name, status, budgetResourceName, targetCpaMicros, targetRoas のいずれかを指定してください。",
              },
            ],
            isError: true,
          };
        }

        const result = await mutateGoogleAds(customerId, "campaigns", [
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
