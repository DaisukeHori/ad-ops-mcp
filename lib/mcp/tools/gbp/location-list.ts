/**
 * GBP ロケーション一覧取得ツール
 * 指定アカウントに紐づくロケーション（店舗・拠点）の一覧を取得する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpGet } from "@/lib/platforms/gbp/client";
import { GBP_ACCOUNT_MANAGEMENT_BASE, GBP_BUSINESS_INFO_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";
import type { LocationListResponse } from "@/lib/platforms/gbp/types";

export function registerGbpLocationList(server: McpServer): void {
  server.tool(
    "gbp_location_list",
    "Google Business Profile のロケーション（店舗・拠点）一覧を取得します。アカウントに紐づく全ロケーションをページネーション付きで返します。",
    {
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
        .describe("1ページあたりの取得件数（1〜100）。デフォルトは20"),
      pageToken: z
        .string()
        .optional()
        .describe("次ページのトークン。前回レスポンスの nextPageToken を指定"),
      readMask: z
        .string()
        .optional()
        .describe("取得するフィールドのカンマ区切りリスト（例: 'title,name,storefrontAddress'）"),
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
        if (params.readMask) {
          queryParams.set("readMask", params.readMask);
        }

        const queryString = queryParams.toString();
        const url = `${GBP_BUSINESS_INFO_BASE}/accounts/${accountId}/locations${queryString ? `?${queryString}` : ""}`;

        const result = await gbpGet<LocationListResponse>(url);

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
