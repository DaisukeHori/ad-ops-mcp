/**
 * Google Ads 広告更新ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdUpdate(server: McpServer): void {
  server.tool(
    "google_ads_ad_update",
    "Google Ads の既存広告のステータスを更新します。広告のテキスト変更はAPIの制約上、新規作成+旧広告削除で対応してください。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupId: z.string().describe("広告が所属する広告グループのID"),
      adId: z.string().describe("更新する広告のID"),
      status: z
        .enum(["ENABLED", "PAUSED", "REMOVED"])
        .describe("新しいステータス"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const cleanCustomerId = customerId.replace(/-/g, "");
        const resourceName = `customers/${cleanCustomerId}/adGroupAds/${params.adGroupId}~${params.adId}`;

        const updateData: Record<string, unknown> = {
          resourceName,
          status: params.status,
        };

        const result = await mutateGoogleAds(customerId, "adGroupAds", [
          {
            update: updateData,
            updateMask: "status",
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
