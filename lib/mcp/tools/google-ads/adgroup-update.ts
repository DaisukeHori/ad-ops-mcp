/**
 * Google Ads 広告グループ更新ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdGroupUpdate(server: McpServer): void {
  server.tool(
    "google_ads_adgroup_update",
    "Google Ads の既存広告グループを更新します。名前、ステータス、入札単価を変更できます。金額はマイクロ単位（1円 = 1,000,000）で指定してください。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupId: z.string().describe("更新する広告グループのID"),
      name: z.string().optional().describe("新しい広告グループ名"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .optional()
        .describe("新しいステータス"),
      cpcBidMicros: z
        .number()
        .int()
        .optional()
        .describe("新しいCPC入札単価（マイクロ単位: 1円 = 1,000,000）"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const cleanCustomerId = customerId.replace(/-/g, "");
        const resourceName = `customers/${cleanCustomerId}/adGroups/${params.adGroupId}`;

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
        if (params.cpcBidMicros !== undefined) {
          updateData.cpcBidMicros = String(params.cpcBidMicros);
          updateMaskFields.push("cpc_bid_micros");
        }

        if (updateMaskFields.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "更新するフィールドが指定されていません。name, status, cpcBidMicros のいずれかを指定してください。",
              },
            ],
            isError: true,
          };
        }

        const result = await mutateGoogleAds(customerId, "adGroups", [
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
