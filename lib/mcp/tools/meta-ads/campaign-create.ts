/**
 * Meta Ads キャンペーン作成ツール
 * POST /{account_id}/campaigns
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsCampaignCreate(server: McpServer): void {
  server.tool(
    "meta_ads_campaign_create",
    "Meta広告キャンペーンを新規作成します。キャンペーン名、目的、ステータスなどを指定します。",
    {
      name: z.string().describe("キャンペーン名"),
      objective: z
        .enum([
          "OUTCOME_AWARENESS",
          "OUTCOME_ENGAGEMENT",
          "OUTCOME_LEADS",
          "OUTCOME_SALES",
          "OUTCOME_TRAFFIC",
          "OUTCOME_APP_PROMOTION",
        ])
        .describe("キャンペーン目的"),
      status: z
        .enum(["ACTIVE", "PAUSED"])
        .optional()
        .describe("初期ステータス。デフォルト: PAUSED"),
      special_ad_categories: z
        .array(z.string())
        .optional()
        .describe(
          "特別広告カテゴリ。例: ['EMPLOYMENT'], ['HOUSING'], ['CREDIT']。該当なしの場合は空配列 []"
        ),
      daily_budget: z
        .string()
        .optional()
        .describe("日予算（セント単位の文字列）。例: '5000' = 50ドル"),
      lifetime_budget: z
        .string()
        .optional()
        .describe("通算予算（セント単位の文字列）"),
      bid_strategy: z
        .enum([
          "LOWEST_COST_WITHOUT_CAP",
          "LOWEST_COST_WITH_BID_CAP",
          "COST_CAP",
          "LOWEST_COST_WITH_MIN_ROAS",
        ])
        .optional()
        .describe("入札戦略"),
      buying_type: z
        .enum(["AUCTION", "RESERVED"])
        .optional()
        .describe("購入タイプ。デフォルト: AUCTION"),
      start_time: z
        .string()
        .optional()
        .describe("開始日時（ISO 8601形式）。例: 2026-04-01T00:00:00+0900"),
      stop_time: z
        .string()
        .optional()
        .describe("終了日時（ISO 8601形式）"),
    },
    async (params) => {
      try {
        const accountId = getMetaAccountId();
        const body: Record<string, unknown> = {
          name: params.name,
          objective: params.objective,
          status: params.status ?? "PAUSED",
          special_ad_categories: params.special_ad_categories ?? [],
        };
        if (params.daily_budget !== undefined) {
          body.daily_budget = params.daily_budget;
        }
        if (params.lifetime_budget !== undefined) {
          body.lifetime_budget = params.lifetime_budget;
        }
        if (params.bid_strategy !== undefined) {
          body.bid_strategy = params.bid_strategy;
        }
        if (params.buying_type !== undefined) {
          body.buying_type = params.buying_type;
        }
        if (params.start_time !== undefined) {
          body.start_time = params.start_time;
        }
        if (params.stop_time !== undefined) {
          body.stop_time = params.stop_time;
        }

        const result = await metaPost<{ id: string }>(
          `${accountId}/campaigns`,
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
