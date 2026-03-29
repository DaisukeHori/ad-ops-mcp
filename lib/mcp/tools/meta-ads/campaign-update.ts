/**
 * Meta Ads キャンペーン更新ツール
 * POST /{campaign_id}
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsCampaignUpdate(server: McpServer): void {
  server.tool(
    "meta_ads_campaign_update",
    "既存のMeta広告キャンペーンを更新します。名前、ステータス、予算、入札戦略などを変更できます。",
    {
      campaignId: z.string().describe("更新対象のキャンペーンID"),
      name: z.string().optional().describe("新しいキャンペーン名"),
      status: z
        .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
        .optional()
        .describe("新しいステータス"),
      daily_budget: z
        .string()
        .optional()
        .describe("新しい日予算（セント単位の文字列）"),
      lifetime_budget: z
        .string()
        .optional()
        .describe("新しい通算予算（セント単位の文字列）"),
      bid_strategy: z
        .enum([
          "LOWEST_COST_WITHOUT_CAP",
          "LOWEST_COST_WITH_BID_CAP",
          "COST_CAP",
          "LOWEST_COST_WITH_MIN_ROAS",
        ])
        .optional()
        .describe("新しい入札戦略"),
      start_time: z
        .string()
        .optional()
        .describe("新しい開始日時（ISO 8601形式）"),
      stop_time: z
        .string()
        .optional()
        .describe("新しい終了日時（ISO 8601形式）"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.name !== undefined) {
          body.name = params.name;
        }
        if (params.status !== undefined) {
          body.status = params.status;
        }
        if (params.daily_budget !== undefined) {
          body.daily_budget = params.daily_budget;
        }
        if (params.lifetime_budget !== undefined) {
          body.lifetime_budget = params.lifetime_budget;
        }
        if (params.bid_strategy !== undefined) {
          body.bid_strategy = params.bid_strategy;
        }
        if (params.start_time !== undefined) {
          body.start_time = params.start_time;
        }
        if (params.stop_time !== undefined) {
          body.stop_time = params.stop_time;
        }

        const result = await metaPost<{ success: boolean }>(
          params.campaignId,
          body
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
