/**
 * GBP 投稿削除ツール
 * 指定ロケーションのローカル投稿を削除する（レガシー My Business API v4）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpDelete } from "@/lib/platforms/gbp/client";
import { GBP_LEGACY_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";

export function registerGbpPostDelete(server: McpServer): void {
  server.tool(
    "gbp_post_delete",
    "Google Business Profile の特定ロケーションのローカル投稿を削除します。削除は取り消せないため注意してください。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（数値のみ、例: '123456789'）"),
      postId: z
        .string()
        .describe("投稿 ID"),
      accountId: z
        .string()
        .optional()
        .describe("GBP アカウント ID。省略時は環境変数 GBP_ACCOUNT_ID を使用"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getGbpAccountId();

        const url = `${GBP_LEGACY_BASE}/accounts/${accountId}/locations/${params.locationId}/localPosts/${params.postId}`;

        await gbpDelete(url);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `投稿 ${params.postId} を削除しました。`,
                },
                null,
                2
              ),
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
