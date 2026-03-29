/**
 * X Ads ラインアイテム更新ツール
 * 既存ラインアイテムの設定を変更する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsPut } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsLineItem } from "@/lib/platforms/x-ads/types";

export function registerXAdsLineitemUpdate(server: McpServer): void {
  server.tool(
    "x_ads_lineitem_update",
    "X (Twitter) Ads のラインアイテム（広告セット）を更新します。ラインアイテム ID を指定し、変更したいフィールドのみ設定してください。金額はマイクロ単位（1円 = 1,000,000）です。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      lineItemId: z.string().describe("更新対象のラインアイテム ID"),
      name: z.string().optional().describe("ラインアイテム名"),
      bidAmountLocalMicro: z
        .number()
        .optional()
        .describe("入札額（マイクロ単位）。1円 = 1,000,000 micros"),
      bidStrategy: z
        .enum(["AUTO", "MAX", "TARGET"])
        .optional()
        .describe("入札戦略"),
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
        .describe("ステータス"),
      automaticallySelectBid: z
        .boolean()
        .optional()
        .describe("自動入札を有効にするか"),
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
        .optional()
        .describe("配信面（複数選択可）"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const body: Record<string, unknown> = {};
        if (params.name !== undefined) {
          body.name = params.name;
        }
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
        if (params.placements !== undefined) {
          body.placements = params.placements;
        }

        const result = await xAdsPut<XAdsLineItem>(
          `/accounts/${accountId}/line_items/${params.lineItemId}`,
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
