/**
 * GBP レビュー一覧取得ツール
 * 指定ロケーションのレビュー一覧を取得する（レガシー My Business API v4）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpGet } from "@/lib/platforms/gbp/client";
import { GBP_LEGACY_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";
import type { ReviewListResponse } from "@/lib/platforms/gbp/types";

export function registerGbpReviewList(server: McpServer): void {
  server.tool(
    "gbp_review_list",
    "Google Business Profile の特定ロケーションに寄せられたレビュー一覧を取得します。平均評価、総レビュー数も含まれます。",
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
        .max(50)
        .optional()
        .describe("1ページあたりの取得件数（1〜50）。デフォルトは50"),
      pageToken: z
        .string()
        .optional()
        .describe("次ページのトークン。前回レスポンスの nextPageToken を指定"),
      orderBy: z
        .string()
        .optional()
        .describe("ソート順（例: 'updateTime desc'）"),
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
        if (params.orderBy) {
          queryParams.set("orderBy", params.orderBy);
        }

        const queryString = queryParams.toString();
        const url = `${GBP_LEGACY_BASE}/accounts/${accountId}/locations/${params.locationId}/reviews${queryString ? `?${queryString}` : ""}`;

        const result = await gbpGet<ReviewListResponse>(url);

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
