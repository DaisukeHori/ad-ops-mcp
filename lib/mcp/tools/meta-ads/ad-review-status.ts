/**
 * Meta Ads 広告レビューステータス取得ツール
 * GET /{account_id}/ads?fields=review_feedback
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaGet } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaAdReview, MetaListResponse } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsAdReviewStatus(server: McpServer): void {
  server.tool(
    "meta_ads_ad_review_status",
    "Meta広告のレビュー（審査）ステータスとフィードバックを取得します。不承認理由の確認に使用します。",
    {
      adId: z
        .string()
        .optional()
        .describe("特定の広告IDを指定してレビュー情報を取得（省略時はアカウント内全広告）"),
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
        if (params.adId) {
          const result = await metaGet<MetaAdReview>(params.adId, {
            fields: "id,name,status,review_feedback,effective_status",
          });
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        }

        const accountId = getMetaAccountId();
        const queryParams: Record<string, string> = {
          fields: "id,name,status,review_feedback,effective_status",
        };
        if (params.limit !== undefined) {
          queryParams.limit = String(params.limit);
        }
        if (params.after) {
          queryParams.after = params.after;
        }

        const result = await metaGet<MetaListResponse<MetaAdReview>>(
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
