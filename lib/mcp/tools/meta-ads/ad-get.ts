/**
 * Meta Ads 広告詳細取得ツール
 * GET /{ad_id}
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaAd } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsAdGet(server: McpServer): void {
  server.tool(
    "meta_ads_ad_get",
    "指定したMeta広告の詳細情報を取得します。",
    {
      adId: z.string().describe("広告ID"),
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,status,adset_id,creative,tracking_specs"
        ),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.fields) {
          queryParams.fields = params.fields;
        } else {
          queryParams.fields =
            "id,name,status,adset_id,campaign_id,creative,tracking_specs,created_time,updated_time";
        }

        const result = await metaGet<MetaAd>(params.adId, queryParams);

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
