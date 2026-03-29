/**
 * X Ads ラインアイテム一覧取得ツール
 * 指定アカウントのラインアイテム（広告セット）一覧を返す
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsGet } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsLineItem } from "@/lib/platforms/x-ads/types";

export function registerXAdsLineitemList(server: McpServer): void {
  server.tool(
    "x_ads_lineitem_list",
    "X (Twitter) Ads のラインアイテム（広告セット）一覧を取得します。キャンペーン ID でフィルタも可能です。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      campaignIds: z
        .string()
        .optional()
        .describe("キャンペーン ID でフィルタ（カンマ区切り）"),
      count: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe("取得件数（1〜1000、デフォルト: 200）"),
      cursor: z
        .string()
        .optional()
        .describe("ページネーション用カーソル"),
      withDeleted: z
        .boolean()
        .optional()
        .describe("削除済みも含めるか（デフォルト: false）"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const queryParts: string[] = [];
        if (params.campaignIds !== undefined) {
          queryParts.push(
            `campaign_ids=${encodeURIComponent(params.campaignIds)}`
          );
        }
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
        const result = await xAdsGet<XAdsLineItem[]>(
          `/accounts/${accountId}/line_items${query}`
        );

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
