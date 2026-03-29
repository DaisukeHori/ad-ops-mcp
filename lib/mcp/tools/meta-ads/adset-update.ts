/**
 * Meta Ads 広告セット更新ツール
 * POST /{adset_id}
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsAdsetUpdate(server: McpServer): void {
  server.tool(
    "meta_ads_adset_update",
    "既存のMeta広告セットを更新します。名前、ステータス、予算、ターゲティングなどを変更できます。",
    {
      adsetId: z.string().describe("更新対象の広告セットID"),
      name: z.string().optional().describe("新しい広告セット名"),
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
      bid_amount: z
        .string()
        .optional()
        .describe("新しい入札額（セント単位の文字列）"),
      targeting: z
        .string()
        .optional()
        .describe("新しいターゲティング設定（JSON文字列）"),
      optimization_goal: z
        .enum([
          "IMPRESSIONS",
          "REACH",
          "LINK_CLICKS",
          "LANDING_PAGE_VIEWS",
          "CONVERSIONS",
          "LEAD_GENERATION",
          "APP_INSTALLS",
          "VIDEO_VIEWS",
          "THRUPLAY",
          "POST_ENGAGEMENT",
          "PAGE_LIKES",
          "VALUE",
        ])
        .optional()
        .describe("新しい最適化目標"),
      start_time: z
        .string()
        .optional()
        .describe("新しい開始日時（ISO 8601形式）"),
      end_time: z
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
        if (params.bid_amount !== undefined) {
          body.bid_amount = params.bid_amount;
        }
        if (params.targeting !== undefined) {
          body.targeting = JSON.parse(params.targeting);
        }
        if (params.optimization_goal !== undefined) {
          body.optimization_goal = params.optimization_goal;
        }
        if (params.start_time !== undefined) {
          body.start_time = params.start_time;
        }
        if (params.end_time !== undefined) {
          body.end_time = params.end_time;
        }

        const result = await metaPost<{ success: boolean }>(
          params.adsetId,
          body
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        if (error instanceof SyntaxError) {
          return {
            content: [
              {
                type: "text" as const,
                text: "targeting パラメータのJSON形式が不正です。正しいJSON文字列を指定してください。",
              },
            ],
            isError: true,
          };
        }
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
