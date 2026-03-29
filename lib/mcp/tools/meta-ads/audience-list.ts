/**
 * Meta Ads カスタムオーディエンス一覧取得ツール
 * GET /{account_id}/customaudiences
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaAudience, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsAudienceList(server: McpServer): void {
  server.tool(
    "meta_ads_audience_list",
    "Meta広告アカウントのカスタムオーディエンス一覧を取得します。リターゲティングや類似オーディエンスの確認に使用します。",
    {
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,description,subtype,approximate_count_lower_bound"
        ),
      limit: z
        .number()
        .min(1)
        .max(500)
        .optional()
        .describe("取得件数の上限（1〜500）。デフォルト: 25"),
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
            "id,name,description,subtype,approximate_count_lower_bound,approximate_count_upper_bound,time_created,time_updated,delivery_status,operation_status";
        }
        if (params.limit !== undefined) {
          queryParams.limit = String(params.limit);
        }
        if (params.after) {
          queryParams.after = params.after;
        }

        const result = await metaGet<MetaListResponse<MetaAudience>>(
          `${accountId}/customaudiences`,
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
