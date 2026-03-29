/**
 * GBP レビュー返信ツール
 * 指定レビューにオーナー返信を作成・更新する（レガシー My Business API v4）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpPut } from "@/lib/platforms/gbp/client";
import { GBP_LEGACY_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";
import type { ReviewReply } from "@/lib/platforms/gbp/types";

export function registerGbpReviewReply(server: McpServer): void {
  server.tool(
    "gbp_review_reply",
    "Google Business Profile のレビューにオーナー返信を投稿・更新します。既に返信がある場合は上書きされます。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（数値のみ、例: '123456789'）"),
      reviewId: z
        .string()
        .describe("レビュー ID"),
      comment: z
        .string()
        .min(1)
        .describe("返信コメント本文"),
      accountId: z
        .string()
        .optional()
        .describe("GBP アカウント ID。省略時は環境変数 GBP_ACCOUNT_ID を使用"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getGbpAccountId();

        const url = `${GBP_LEGACY_BASE}/accounts/${accountId}/locations/${params.locationId}/reviews/${params.reviewId}/reply`;

        const body: Record<string, unknown> = {
          comment: params.comment,
        };

        const result = await gbpPut<ReviewReply>(url, body);

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
