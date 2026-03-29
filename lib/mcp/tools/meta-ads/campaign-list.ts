/**
 * Meta Ads キャンペーン一覧取得ツール
 * GET /{account_id}/campaigns
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaCampaign, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsCampaignList(server: McpServer): void {
  server.tool(
    "meta_ads_campaign_list",
    "Meta広告アカウントのキャンペーン一覧を取得します。ステータスやフィールドを指定してフィルタリングできます。",
    {
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,status,objective,daily_budget"
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
        .describe("フィルタするキャンペーンステータス"),
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
            "id,name,status,objective,buying_type,daily_budget,lifetime_budget,budget_remaining,created_time,updated_time";
        }
        if (params.limit !== undefined) {
          queryParams.limit = String(params.limit);
        }
        if (params.status) {
          queryParams.filtering = JSON.stringify([
            { field: "effective_status", operator: "IN", value: [params.status] },
          ]);
        }
        if (params.after) {
          queryParams.after = params.after;
        }

        const result = await metaGet<MetaListResponse<MetaCampaign>>(
          `${accountId}/campaigns`,
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
