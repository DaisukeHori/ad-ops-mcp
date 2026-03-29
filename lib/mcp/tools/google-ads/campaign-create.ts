/**
 * Google Ads キャンペーン作成ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsCampaignCreate(server: McpServer): void {
  server.tool(
    "google_ads_campaign_create",
    "Google Ads に新しいキャンペーンを作成します。予算リソース名、チャネルタイプ、入札戦略を指定します。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      name: z.string().describe("キャンペーン名"),
      budgetResourceName: z
        .string()
        .describe("予算のリソース名（例: customers/123/campaignBudgets/456）"),
      advertisingChannelType: z
        .enum([
          "SEARCH",
          "DISPLAY",
          "SHOPPING",
          "VIDEO",
          "MULTI_CHANNEL",
          "PERFORMANCE_MAX",
          "LOCAL",
          "SMART",
          "DEMAND_GEN",
        ])
        .describe("広告チャネルタイプ"),
      status: z
        .enum(["ENABLED", "PAUSED"])
        .optional()
        .describe("キャンペーンステータス（デフォルト: PAUSED）"),
      biddingStrategyType: z
        .enum([
          "MANUAL_CPC",
          "TARGET_CPA",
          "TARGET_ROAS",
          "MAXIMIZE_CONVERSIONS",
          "MAXIMIZE_CONVERSION_VALUE",
          "TARGET_SPEND",
        ])
        .optional()
        .describe("入札戦略タイプ（デフォルト: MANUAL_CPC）"),
      targetCpaMicros: z
        .number()
        .int()
        .optional()
        .describe("目標CPA（マイクロ単位: 1円 = 1,000,000）。TARGET_CPA 戦略で使用"),
      targetRoas: z
        .number()
        .optional()
        .describe("目標ROAS（例: 4.0 = 400%）。TARGET_ROAS 戦略で使用"),
      startDate: z
        .string()
        .optional()
        .describe("開始日（YYYY-MM-DD形式）"),
      endDate: z
        .string()
        .optional()
        .describe("終了日（YYYY-MM-DD形式）"),
      targetGoogleSearch: z
        .boolean()
        .optional()
        .describe("Google 検索ネットワークに配信するか"),
      targetSearchNetwork: z
        .boolean()
        .optional()
        .describe("検索パートナーに配信するか"),
      targetContentNetwork: z
        .boolean()
        .optional()
        .describe("ディスプレイネットワークに配信するか"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");

        const campaignData: Record<string, unknown> = {
          name: params.name,
          campaignBudget: params.budgetResourceName,
          advertisingChannelType: params.advertisingChannelType,
          status: params.status ?? "PAUSED",
        };

        // 入札戦略の設定
        const biddingStrategy = params.biddingStrategyType ?? "MANUAL_CPC";
        switch (biddingStrategy) {
          case "MANUAL_CPC":
            campaignData.manualCpc = { enhancedCpcEnabled: false };
            break;
          case "TARGET_CPA":
            campaignData.targetCpa = {
              targetCpaMicros: params.targetCpaMicros
                ? String(params.targetCpaMicros)
                : undefined,
            };
            break;
          case "TARGET_ROAS":
            campaignData.targetRoas = {
              targetRoas: params.targetRoas,
            };
            break;
          case "MAXIMIZE_CONVERSIONS":
            campaignData.maximizeConversions = {
              targetCpaMicros: params.targetCpaMicros
                ? String(params.targetCpaMicros)
                : undefined,
            };
            break;
          case "MAXIMIZE_CONVERSION_VALUE":
            campaignData.maximizeConversionValue = {
              targetRoas: params.targetRoas,
            };
            break;
          case "TARGET_SPEND":
            campaignData.targetSpend = {};
            break;
        }

        if (params.startDate) {
          campaignData.startDate = params.startDate.replace(/-/g, "");
        }
        if (params.endDate) {
          campaignData.endDate = params.endDate.replace(/-/g, "");
        }

        // ネットワーク設定
        if (
          params.targetGoogleSearch !== undefined ||
          params.targetSearchNetwork !== undefined ||
          params.targetContentNetwork !== undefined
        ) {
          campaignData.networkSettings = {
            targetGoogleSearch: params.targetGoogleSearch ?? true,
            targetSearchNetwork: params.targetSearchNetwork ?? false,
            targetContentNetwork: params.targetContentNetwork ?? false,
            targetPartnerSearchNetwork: false,
          };
        }

        const result = await mutateGoogleAds(customerId, "campaigns", [
          { create: campaignData },
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
