/**
 * GBP インサイト取得ツール
 * 指定ロケーションのパフォーマンスメトリクスを取得する（Business Profile Performance API v1）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpGet } from "@/lib/platforms/gbp/client";
import { GBP_PERFORMANCE_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { MultiDailyMetricsTimeSeriesResponse } from "@/lib/platforms/gbp/types";

export function registerGbpInsightGet(server: McpServer): void {
  server.tool(
    "gbp_insight_get",
    "Google Business Profile の特定ロケーションのパフォーマンスインサイト（検索数、表示数、アクション数など）を日別タイムシリーズで取得します。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（例: 'locations/123456789'）。'locations/' プレフィックスは自動付与されます"),
      dailyMetrics: z
        .array(
          z.enum([
            "DAILY_METRIC_UNKNOWN",
            "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
            "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
            "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
            "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
            "BUSINESS_CONVERSATIONS",
            "BUSINESS_DIRECTION_REQUESTS",
            "CALL_CLICKS",
            "WEBSITE_CLICKS",
            "BUSINESS_BOOKINGS",
            "BUSINESS_FOOD_ORDERS",
            "BUSINESS_FOOD_MENU_CLICKS",
          ])
        )
        .min(1)
        .describe(
          "取得するメトリクス一覧。例: ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'CALL_CLICKS', 'WEBSITE_CLICKS']"
        ),
      dailyRange: z
        .object({
          startDate: z.object({
            year: z.number().int(),
            month: z.number().int().min(1).max(12),
            day: z.number().int().min(1).max(31),
          }),
          endDate: z.object({
            year: z.number().int(),
            month: z.number().int().min(1).max(12),
            day: z.number().int().min(1).max(31),
          }),
        })
        .describe(
          "日付範囲。例: { startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 3, day: 28 } }"
        ),
    },
    async (params) => {
      try {
        const locationName = params.locationId.startsWith("locations/")
          ? params.locationId
          : `locations/${params.locationId}`;

        // クエリパラメータを構築
        const queryParams = new URLSearchParams();

        // dailyMetrics は複数回指定する
        for (const metric of params.dailyMetrics) {
          queryParams.append("dailyMetrics", metric);
        }

        // dailyRange のフォーマット
        const startDate = params.dailyRange.startDate;
        const endDate = params.dailyRange.endDate;
        queryParams.set(
          "dailyRange.startDate.year",
          String(startDate.year)
        );
        queryParams.set(
          "dailyRange.startDate.month",
          String(startDate.month)
        );
        queryParams.set(
          "dailyRange.startDate.day",
          String(startDate.day)
        );
        queryParams.set(
          "dailyRange.endDate.year",
          String(endDate.year)
        );
        queryParams.set(
          "dailyRange.endDate.month",
          String(endDate.month)
        );
        queryParams.set(
          "dailyRange.endDate.day",
          String(endDate.day)
        );

        const url = `${GBP_PERFORMANCE_BASE}/${locationName}:fetchMultiDailyMetricsTimeSeries?${queryParams.toString()}`;

        const result =
          await gbpGet<MultiDailyMetricsTimeSeriesResponse>(url);

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
          error instanceof PlatformError ? error.toUserMessage() : String(error);
        return {
          content: [{ type: "text" as const, text: message }],
          isError: true,
        };
      }
    }
  );
}
