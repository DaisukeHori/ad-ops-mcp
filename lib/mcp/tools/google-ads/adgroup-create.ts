/**
 * Google Ads 広告グループ作成ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdGroupCreate(server: McpServer): void {
  server.tool(
    "google_ads_adgroup_create",
    "Google Ads に新しい広告グループを作成します。キャンペーンのリソース名と入札単価を指定します。金額はマイクロ単位（1円 = 1,000,000）で指定してください。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      campaignResourceName: z
        .string()
        .describe("所属キャンペーンのリソース名（例: customers/123/campaigns/456）"),
      name: z.string().describe("広告グループ名"),
      status: z
        .enum(["ENABLED", "PAUSED"])
        .optional()
        .describe("広告グループステータス（デフォルト: ENABLED）"),
      type: z
        .enum([
          "SEARCH_STANDARD",
          "DISPLAY_STANDARD",
          "SHOPPING_PRODUCT_ADS",
          "VIDEO_TRUE_VIEW_IN_STREAM",
          "VIDEO_BUMPER",
        ])
        .optional()
        .describe("広告グループタイプ（デフォルト: SEARCH_STANDARD）"),
      cpcBidMicros: z
        .number()
        .int()
        .optional()
        .describe("CPC 入札単価（マイクロ単位: 1円 = 1,000,000）"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");

        const adGroupData: Record<string, unknown> = {
          campaign: params.campaignResourceName,
          name: params.name,
          status: params.status ?? "ENABLED",
          type: params.type ?? "SEARCH_STANDARD",
        };

        if (params.cpcBidMicros !== undefined) {
          adGroupData.cpcBidMicros = String(params.cpcBidMicros);
        }

        const result = await mutateGoogleAds(customerId, "adGroups", [
          { create: adGroupData },
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
