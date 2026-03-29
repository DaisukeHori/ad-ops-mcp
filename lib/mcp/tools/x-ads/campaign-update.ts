/**
 * X Ads キャンペーン更新ツール
 * 既存キャンペーンの設定を変更する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsPut } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsCampaign } from "@/lib/platforms/x-ads/types";

export function registerXAdsCampaignUpdate(server: McpServer): void {
  server.tool(
    "x_ads_campaign_update",
    "X (Twitter) Ads のキャンペーンを更新します。キャンペーン ID を指定し、変更したいフィールドのみ設定してください。金額はマイクロ単位（1円 = 1,000,000）です。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      campaignId: z.string().describe("更新対象のキャンペーン ID"),
      name: z.string().optional().describe("キャンペーン名"),
      dailyBudgetAmountLocalMicro: z
        .number()
        .optional()
        .describe("日次予算（マイクロ単位）。1円 = 1,000,000 micros"),
      totalBudgetAmountLocalMicro: z
        .number()
        .optional()
        .describe("総予算（マイクロ単位）。1円 = 1,000,000 micros"),
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
        .describe("キャンペーンステータス"),
      fundingInstrumentId: z
        .string()
        .optional()
        .describe("ファンディングインストルメント ID"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const body: Record<string, unknown> = {};
        if (params.name !== undefined) {
          body.name = params.name;
        }
        if (params.dailyBudgetAmountLocalMicro !== undefined) {
          body.daily_budget_amount_local_micro =
            params.dailyBudgetAmountLocalMicro;
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
        if (params.fundingInstrumentId !== undefined) {
          body.funding_instrument_id = params.fundingInstrumentId;
        }

        const result = await xAdsPut<XAdsCampaign>(
          `/accounts/${accountId}/campaigns/${params.campaignId}`,
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
