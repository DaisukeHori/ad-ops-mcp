/**
 * X Ads アナリティクス取得ツール
 * キャンペーン・ラインアイテム等のパフォーマンスデータを取得する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsGet } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsAnalyticsData } from "@/lib/platforms/x-ads/types";

export function registerXAdsAnalytics(server: McpServer): void {
  server.tool(
    "x_ads_analytics",
    "X (Twitter) Ads のアナリティクス（パフォーマンスデータ）を取得します。キャンペーンまたはラインアイテムのインプレッション、エンゲージメント、クリック、コスト等の指標を取得できます。金額はマイクロ単位（1円 = 1,000,000）で返されます。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      entityType: z
        .enum(["CAMPAIGN", "LINE_ITEM", "PROMOTED_TWEET", "ORGANIC_TWEET"])
        .describe(
          "集計対象のエンティティ種別（CAMPAIGN, LINE_ITEM, PROMOTED_TWEET, ORGANIC_TWEET）"
        ),
      entityIds: z
        .string()
        .describe(
          "集計対象のエンティティ ID（カンマ区切り、最大20件）"
        ),
      startTime: z
        .string()
        .describe("集計開始日時（ISO 8601 形式、例: 2026-03-01T00:00:00Z）"),
      endTime: z
        .string()
        .describe("集計終了日時（ISO 8601 形式、例: 2026-03-31T23:59:59Z）"),
      granularity: z
        .enum(["HOUR", "DAY", "TOTAL"])
        .optional()
        .describe("集計粒度（HOUR, DAY, TOTAL）。デフォルト: DAY"),
      metricGroups: z
        .array(
          z.enum([
            "BILLING",
            "ENGAGEMENT",
            "LIFE_TIME_VALUE_MOBILE_CONVERSION",
            "MEDIA",
            "MOBILE_CONVERSION",
            "VIDEO",
            "WEB_CONVERSION",
          ])
        )
        .optional()
        .describe(
          "取得するメトリクスグループ（複数選択可）。デフォルト: [ENGAGEMENT]"
        ),
      placement: z
        .enum([
          "ALL_ON_TWITTER",
          "PUBLISHER_NETWORK",
        ])
        .optional()
        .describe("配信面でフィルタ。省略時は全配信面"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const granularity = params.granularity ?? "DAY";
        const metricGroups = params.metricGroups ?? ["ENGAGEMENT"];

        const queryParts: string[] = [
          `entity=${encodeURIComponent(params.entityType)}`,
          `entity_ids=${encodeURIComponent(params.entityIds)}`,
          `start_time=${encodeURIComponent(params.startTime)}`,
          `end_time=${encodeURIComponent(params.endTime)}`,
          `granularity=${encodeURIComponent(granularity)}`,
          `metric_groups=${encodeURIComponent(metricGroups.join(","))}`,
        ];

        if (params.placement !== undefined) {
          queryParts.push(`placement=${encodeURIComponent(params.placement)}`);
        }

        const query = `?${queryParts.join("&")}`;
        const result = await xAdsGet<XAdsAnalyticsData[]>(
          `/stats/accounts/${accountId}${query}`
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
