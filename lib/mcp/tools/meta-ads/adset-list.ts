/**
 * Meta Ads 広告セット一覧取得ツール
 * GET /{account_id}/adsets
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaAdSet, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsAdsetList(server: McpServer): void {
  server.tool(
    "meta_ads_adset_list",
    "Meta広告アカウントの広告セット一覧を取得します。ステータスやフィールドでフィルタリングできます。",
    {
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,status,campaign_id,daily_budget"
        ),
      limit: z
        .number()
        .min(1)
        .max(500)
        .optional()
        .describe("取得件数の上限（1〜500）。デフォルト: 25"),
      status: z
        .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
        .optional()
        .describe("フィルタする広告セットステータス"),
      campaign_id: z
        .string()
        .optional()
        .describe("特定キャンペーンに属する広告セットのみ取得する場合のキャンペーンID"),
      after: z
        .string()
        .optional()
        .describe("ページネーション用カーソル（次ページ）"),
    },
    async (params) => {
      try {
        const accountId = getMetaAccountId();
        const queryParams: Record<string, string> = {};
        if (params.fields) {
          queryParams.fields = params.fields;
        } else {
          queryParams.fields =
            "id,name,status,campaign_id,daily_budget,lifetime_budget,budget_remaining,billing_event,optimization_goal,bid_amount,start_time,end_time,created_time,updated_time";
        }
        if (params.limit !== undefined) {
          queryParams.limit = String(params.limit);
        }
        if (params.after) {
          queryParams.after = params.after;
        }

        const filters: Array<{ field: string; operator: string; value: string[] }> = [];
        if (params.status) {
          filters.push({
            field: "effective_status",
            operator: "IN",
            value: [params.status],
          });
        }
        if (params.campaign_id) {
          filters.push({
            field: "campaign.id",
            operator: "EQUAL",
            value: [params.campaign_id],
          });
        }
        if (filters.length > 0) {
          queryParams.filtering = JSON.stringify(filters);
        }

        const result = await metaGet<MetaListResponse<MetaAdSet>>(
          `${accountId}/adsets`,
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
