/**
 * X Ads アカウント一覧取得ツール
 * 認証済みユーザーがアクセス可能な広告アカウントの一覧を返す
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsGet } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { XAdsAccount } from "@/lib/platforms/x-ads/types";

export function registerXAdsAccountList(server: McpServer): void {
  server.tool(
    "x_ads_account_list",
    "X (Twitter) Ads のアカウント一覧を取得します。認証済みユーザーがアクセス可能な全広告アカウントの情報を返します。",
    {
      count: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe("取得件数（1〜1000、デフォルト: 200）"),
      cursor: z
        .string()
        .optional()
        .describe("ページネーション用カーソル。前回レスポンスの next_cursor を指定"),
      withDeleted: z
        .boolean()
        .optional()
        .describe("削除済みアカウントも含めるか（デフォルト: false）"),
    },
    async (params) => {
      try {
        const queryParts: string[] = [];
        if (params.count !== undefined) {
          queryParts.push(`count=${params.count}`);
        }
        if (params.cursor !== undefined) {
          queryParts.push(`cursor=${encodeURIComponent(params.cursor)}`);
        }
        if (params.withDeleted === true) {
          queryParts.push("with_deleted=true");
        }

        const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const result = await xAdsGet<XAdsAccount[]>(`/accounts${query}`);

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
