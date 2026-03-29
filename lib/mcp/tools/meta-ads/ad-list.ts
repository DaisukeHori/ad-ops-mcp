/**
 * Meta Ads 広告一覧取得ツール
 * GET /{account_id}/ads
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaAd, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsAdList(server: McpServer): void {
  server.tool(
    "meta_ads_ad_list",
    "Meta広告アカウントの広告一覧を取得します。ステータスやフィールドでフィルタリングできます。",
    {
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,status,adset_id,creative"
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
        .describe("フィルタする広告ステータス"),
      adset_id: z
        .string()
        .optional()
        .describe("特定の広告セットに属する広告のみ取得する場合の広告セットID"),
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
            "id,name,status,adset_id,campaign_id,creative,created_time,updated_time";
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
        if (params.adset_id) {
          filters.push({
            field: "adset.id",
            operator: "EQUAL",
            value: [params.adset_id],
          });
        }
        if (filters.length > 0) {
          queryParams.filtering = JSON.stringify(filters);
        }

        const result = await metaGet<MetaListResponse<MetaAd>>(
          `${accountId}/ads`,
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
