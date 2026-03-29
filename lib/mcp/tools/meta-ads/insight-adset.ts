/**
 * Meta Ads 広告セットインサイト取得ツール
 * GET /{adset_id}/insights
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaInsight, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsInsightAdset(server: McpServer): void {
  server.tool(
    "meta_ads_insight_adset",
    "Meta広告セットのパフォーマンスインサイト（レポート）を取得します。インプレッション、クリック、コスト等の指標を確認できます。",
    {
      adsetId: z.string().describe("広告セットID"),
      fields: z
        .string()
        .optional()
        .describe(
          "取得する指標フィールド（カンマ区切り）。例: impressions,reach,clicks,spend,cpc,cpm,ctr"
        ),
      date_preset: z
        .enum([
          "today",
          "yesterday",
          "this_month",
          "last_month",
          "this_quarter",
          "maximum",
          "last_3d",
          "last_7d",
          "last_14d",
          "last_28d",
          "last_30d",
          "last_90d",
          "last_week_mon_sun",
          "last_week_sun_sat",
          "last_quarter",
          "last_year",
          "this_week_mon_today",
          "this_week_sun_today",
          "this_year",
        ])
        .optional()
        .describe(
          "日付プリセット。time_range と同時には指定できません。例: last_7d, last_30d"
        ),
      time_range_since: z
        .string()
        .optional()
        .describe("集計開始日（YYYY-MM-DD形式）。time_range_until と組み合わせて使用"),
      time_range_until: z
        .string()
        .optional()
        .describe("集計終了日（YYYY-MM-DD形式）。time_range_since と組み合わせて使用"),
      breakdowns: z
        .string()
        .optional()
        .describe(
          "ブレイクダウン（カンマ区切り）。例: age,gender,country,publisher_platform"
        ),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.fields) {
          queryParams.fields = params.fields;
        } else {
          queryParams.fields =
            "impressions,reach,clicks,spend,cpc,cpm,ctr,frequency,actions,conversions,cost_per_action_type";
        }
        if (params.date_preset) {
          queryParams.date_preset = params.date_preset;
        }
        if (params.time_range_since && params.time_range_until) {
          queryParams.time_range = JSON.stringify({
            since: params.time_range_since,
            until: params.time_range_until,
          });
        }
        if (params.breakdowns) {
          queryParams.breakdowns = params.breakdowns;
        }

        const result = await metaGet<MetaListResponse<MetaInsight>>(
          `${params.adsetId}/insights`,
          queryParams
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
