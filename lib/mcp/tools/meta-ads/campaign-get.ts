/**
 * Meta Ads キャンペーン詳細取得ツール
 * GET /{campaign_id}
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaCampaign } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsCampaignGet(server: McpServer): void {
  server.tool(
    "meta_ads_campaign_get",
    "指定したMeta広告キャンペーンの詳細情報を取得します。",
    {
      campaignId: z.string().describe("キャンペーンID"),
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,status,objective,daily_budget"
        ),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.fields) {
          queryParams.fields = params.fields;
        } else {
          queryParams.fields =
            "id,name,status,objective,buying_type,bid_strategy,daily_budget,lifetime_budget,budget_remaining,special_ad_categories,created_time,updated_time,start_time,stop_time";
        }

        const result = await metaGet<MetaCampaign>(
          params.campaignId,
          queryParams
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
