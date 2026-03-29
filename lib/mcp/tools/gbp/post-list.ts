/**
 * GBP 投稿一覧取得ツール
 * 指定ロケーションのローカル投稿一覧を取得する（レガシー My Business API v4）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpGet } from "@/lib/platforms/gbp/client";
import { GBP_LEGACY_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";
import type { PostListResponse } from "@/lib/platforms/gbp/types";

export function registerGbpPostList(server: McpServer): void {
  server.tool(
    "gbp_post_list",
    "Google Business Profile の特定ロケーションのローカル投稿一覧を取得します。投稿のタイプ（標準、イベント、オファー、アラート）も含まれます。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（数値のみ、例: '123456789'）"),
      accountId: z
        .string()
        .optional()
        .describe("GBP アカウント ID。省略時は環境変数 GBP_ACCOUNT_ID を使用"),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("1ページあたりの取得件数（1〜100）。デフォルトは100"),
      pageToken: z
        .string()
        .optional()
        .describe("次ページのトークン。前回レスポンスの nextPageToken を指定"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getGbpAccountId();

        const queryParams = new URLSearchParams();
        if (params.pageSize !== undefined) {
          queryParams.set("pageSize", String(params.pageSize));
        }
        if (params.pageToken) {
          queryParams.set("pageToken", params.pageToken);
        }

        const queryString = queryParams.toString();
        const url = `${GBP_LEGACY_BASE}/accounts/${accountId}/locations/${params.locationId}/localPosts${queryString ? `?${queryString}` : ""}`;

        const result = await gbpGet<PostListResponse>(url);

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
