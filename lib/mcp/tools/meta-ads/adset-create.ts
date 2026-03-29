/**
 * Meta Ads 広告セット作成ツール
 * POST /{account_id}/adsets
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsAdsetCreate(server: McpServer): void {
  server.tool(
    "meta_ads_adset_create",
    "Meta広告セットを新規作成します。ターゲティング、予算、最適化目標などを設定します。",
    {
      name: z.string().describe("広告セット名"),
      campaign_id: z.string().describe("所属するキャンペーンのID"),
      status: z
        .enum(["ACTIVE", "PAUSED"])
        .optional()
        .describe("初期ステータス。デフォルト: PAUSED"),
      daily_budget: z
        .string()
        .optional()
        .describe("日予算（セント単位の文字列）。daily_budget か lifetime_budget のどちらかを指定"),
      lifetime_budget: z
        .string()
        .optional()
        .describe("通算予算（セント単位の文字列）。lifetime_budget を使う場合は end_time が必須"),
      billing_event: z
        .enum([
          "IMPRESSIONS",
          "LINK_CLICKS",
          "APP_INSTALLS",
          "PAGE_LIKES",
          "POST_ENGAGEMENT",
          "VIDEO_VIEWS",
          "THRUPLAY",
        ])
        .describe("課金イベント。例: IMPRESSIONS"),
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
        .describe("最適化目標。例: LINK_CLICKS"),
      bid_amount: z
        .string()
        .optional()
        .describe("入札額（セント単位の文字列）。入札戦略によっては必須"),
      targeting: z
        .string()
        .describe(
          "ターゲティング設定（JSON文字列）。例: {\"geo_locations\":{\"countries\":[\"JP\"]},\"age_min\":25,\"age_max\":55}"
        ),
      start_time: z
        .string()
        .optional()
        .describe("開始日時（ISO 8601形式）"),
      end_time: z
        .string()
        .optional()
        .describe("終了日時（ISO 8601形式）。lifetime_budget を使う場合は必須"),
    },
    async (params) => {
      try {
        const accountId = getMetaAccountId();
        const body: Record<string, unknown> = {
          name: params.name,
          campaign_id: params.campaign_id,
          status: params.status ?? "PAUSED",
          billing_event: params.billing_event,
          optimization_goal: params.optimization_goal,
          targeting: JSON.parse(params.targeting),
        };
        if (params.daily_budget !== undefined) {
          body.daily_budget = params.daily_budget;
        }
        if (params.lifetime_budget !== undefined) {
          body.lifetime_budget = params.lifetime_budget;
        }
        if (params.bid_amount !== undefined) {
          body.bid_amount = params.bid_amount;
        }
        if (params.start_time !== undefined) {
          body.start_time = params.start_time;
        }
        if (params.end_time !== undefined) {
          body.end_time = params.end_time;
        }

        const result = await metaPost<{ id: string }>(
          `${accountId}/adsets`,
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
