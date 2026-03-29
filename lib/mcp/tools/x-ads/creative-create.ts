/**
 * X Ads プロモツイート作成ツール
 * 既存のツイートをプロモツイートとしてラインアイテムに紐づける
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsPost } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsPromotedTweet } from "@/lib/platforms/x-ads/types";

export function registerXAdsCreativeCreate(server: McpServer): void {
  server.tool(
    "x_ads_creative_create",
    "X (Twitter) Ads のプロモツイート（クリエイティブ）を作成します。既存のツイートをラインアイテムに紐づけて広告として配信します。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      lineItemId: z
        .string()
        .describe("紐づけるラインアイテム ID"),
      tweetId: z
        .string()
        .describe("プロモーションするツイートの ID"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const body: Record<string, unknown> = {
          line_item_id: params.lineItemId,
          tweet_id: params.tweetId,
        };

        const result = await xAdsPost<XAdsPromotedTweet>(
          `/accounts/${accountId}/promoted_tweets`,
          body
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
