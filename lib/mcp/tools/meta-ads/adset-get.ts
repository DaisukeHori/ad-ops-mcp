/**
 * Meta Ads 広告セット詳細取得ツール
 * GET /{adset_id}
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaAdSet } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsAdsetGet(server: McpServer): void {
  server.tool(
    "meta_ads_adset_get",
    "指定したMeta広告セットの詳細情報を取得します。",
    {
      adsetId: z.string().describe("広告セットID"),
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,status,targeting,daily_budget"
        ),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.fields) {
          queryParams.fields = params.fields;
        } else {
          queryParams.fields =
            "id,name,status,campaign_id,daily_budget,lifetime_budget,budget_remaining,bid_amount,bid_strategy,billing_event,optimization_goal,targeting,start_time,end_time,created_time,updated_time";
        }

        const result = await metaGet<MetaAdSet>(
          params.adsetId,
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
