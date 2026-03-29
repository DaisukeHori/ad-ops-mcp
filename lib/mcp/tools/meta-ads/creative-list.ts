/**
 * Meta Ads クリエイティブ一覧取得ツール
 * GET /{account_id}/adcreatives
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaCreative, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsCreativeList(server: McpServer): void {
  server.tool(
    "meta_ads_creative_list",
    "Meta広告アカウントのクリエイティブ一覧を取得します。",
    {
      fields: z
        .string()
        .optional()
        .describe(
          "取得するフィールド（カンマ区切り）。例: id,name,title,body,image_url,object_story_spec"
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
            "id,name,title,body,image_hash,image_url,video_id,link_url,call_to_action_type,object_story_spec,created_time";
        }
        if (params.limit !== undefined) {
          queryParams.limit = String(params.limit);
        }
        if (params.after) {
          queryParams.after = params.after;
        }

        const result = await metaGet<MetaListResponse<MetaCreative>>(
          `${accountId}/adcreatives`,
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
