/**
 * X Ads キャンペーン作成ツール
 * 新しい広告キャンペーンを作成する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsPost } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsCampaign } from "@/lib/platforms/x-ads/types";

export function registerXAdsCampaignCreate(server: McpServer): void {
  server.tool(
    "x_ads_campaign_create",
    "X (Twitter) Ads のキャンペーンを新規作成します。ファンディングインストルメント ID、キャンペーン名、日次予算（マイクロ単位: 1円 = 1,000,000）を指定してください。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      name: z.string().describe("キャンペーン名"),
      fundingInstrumentId: z
        .string()
        .describe("ファンディングインストルメント ID（支払い手段）"),
      dailyBudgetAmountLocalMicro: z
        .number()
        .describe(
          "日次予算（マイクロ単位）。1円 = 1,000,000 micros。例: 10,000円 → 10000000000"
        ),
      totalBudgetAmountLocalMicro: z
        .number()
        .optional()
        .describe(
          "総予算（マイクロ単位）。省略時は無制限。1円 = 1,000,000 micros"
        ),
      startTime: z
        .string()
        .optional()
        .describe(
          "開始日時（ISO 8601 形式、例: 2026-04-01T00:00:00Z）。省略時は即時開始"
        ),
      endTime: z
        .string()
        .optional()
        .describe("終了日時（ISO 8601 形式）。省略時は無期限"),
      entityStatus: z
        .enum(["ACTIVE", "PAUSED", "DRAFT"])
        .optional()
        .describe("キャンペーンステータス（デフォルト: PAUSED）"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const body: Record<string, unknown> = {
          name: params.name,
          funding_instrument_id: params.fundingInstrumentId,
          daily_budget_amount_local_micro: params.dailyBudgetAmountLocalMicro,
        };

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

        const result = await xAdsPost<XAdsCampaign>(
          `/accounts/${accountId}/campaigns`,
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
