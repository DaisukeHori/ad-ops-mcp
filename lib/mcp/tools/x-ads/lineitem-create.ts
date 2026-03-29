/**
 * X Ads ラインアイテム作成ツール
 * キャンペーン配下に新しいラインアイテム（広告セット）を作成する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsPost } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsLineItem } from "@/lib/platforms/x-ads/types";

export function registerXAdsLineitemCreate(server: McpServer): void {
  server.tool(
    "x_ads_lineitem_create",
    "X (Twitter) Ads のラインアイテム（広告セット）を新規作成します。キャンペーン ID、目的、配信面を指定してください。入札額はマイクロ単位（1円 = 1,000,000）です。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      campaignId: z
        .string()
        .describe("所属するキャンペーン ID"),
      name: z.string().describe("ラインアイテム名"),
      objective: z
        .enum([
          "APP_ENGAGEMENTS",
          "APP_INSTALLS",
          "AWARENESS",
          "ENGAGEMENTS",
          "FOLLOWERS",
          "REACH",
          "VIDEO_VIEWS",
          "WEBSITE_CLICKS",
          "WEBSITE_CONVERSIONS",
          "PREROLL_VIEWS",
        ])
        .describe("広告目的"),
      placements: z
        .array(
          z.enum([
            "ALL_ON_TWITTER",
            "PUBLISHER_NETWORK",
            "TAP_BANNER",
            "TAP_FULL",
            "TAP_FULL_LANDSCAPE",
            "TAP_NATIVE",
            "TWITTER_PROFILE",
            "TWITTER_SEARCH",
            "TWITTER_TIMELINE",
          ])
        )
        .describe("配信面（複数選択可）"),
      bidAmountLocalMicro: z
        .number()
        .optional()
        .describe(
          "入札額（マイクロ単位）。1円 = 1,000,000 micros。自動入札の場合は省略"
        ),
      bidStrategy: z
        .enum(["AUTO", "MAX", "TARGET"])
        .optional()
        .describe("入札戦略（デフォルト: AUTO）"),
      totalBudgetAmountLocalMicro: z
        .number()
        .optional()
        .describe("総予算（マイクロ単位）"),
      startTime: z
        .string()
        .optional()
        .describe("開始日時（ISO 8601 形式）"),
      endTime: z
        .string()
        .optional()
        .describe("終了日時（ISO 8601 形式）"),
      entityStatus: z
        .enum(["ACTIVE", "PAUSED", "DRAFT"])
        .optional()
        .describe("ステータス（デフォルト: PAUSED）"),
      automaticallySelectBid: z
        .boolean()
        .optional()
        .describe("自動入札を有効にするか（デフォルト: false）"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const body: Record<string, unknown> = {
          campaign_id: params.campaignId,
          name: params.name,
          objective: params.objective,
          placements: params.placements,
        };

        if (params.bidAmountLocalMicro !== undefined) {
          body.bid_amount_local_micro = params.bidAmountLocalMicro;
        }
        if (params.bidStrategy !== undefined) {
          body.bid_strategy = params.bidStrategy;
        }
        if (params.totalBudgetAmountLocalMicro !== undefined) {
          body.total_budget_amount_local_micro =
            params.totalBudgetAmountLocalMicro;
        }
        if (params.startTime !== undefined) {
          body.start_time = params.startTime;
        }
        if (params.endTime !== undefined) {
          body.end_time = params.endTime;
        }
        if (params.entityStatus !== undefined) {
          body.entity_status = params.entityStatus;
        }
        if (params.automaticallySelectBid !== undefined) {
          body.automatically_select_bid = params.automaticallySelectBid;
        }

        const result = await xAdsPost<XAdsLineItem>(
          `/accounts/${accountId}/line_items`,
          body
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
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
