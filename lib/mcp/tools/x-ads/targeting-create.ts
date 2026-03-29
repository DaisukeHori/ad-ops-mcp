/**
 * X Ads ターゲティング条件作成ツール
 * ラインアイテムにターゲティング条件を追加する
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xAdsPost } from "@/lib/platforms/x-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";
import type { XAdsTargetingCriterion } from "@/lib/platforms/x-ads/types";

export function registerXAdsTargetingCreate(server: McpServer): void {
  server.tool(
    "x_ads_targeting_create",
    "X (Twitter) Ads のターゲティング条件を作成します。ラインアイテムに対して、年齢・性別・地域・興味関心・キーワード等のターゲティング条件を設定できます。",
    {
      accountId: z
        .string()
        .optional()
        .describe(
          "広告アカウント ID。省略時は環境変数 X_ADS_ACCOUNT_ID を使用"
        ),
      lineItemId: z
        .string()
        .describe("ターゲティングを設定するラインアイテム ID"),
      targetingType: z
        .enum([
          "AGE",
          "BEHAVIOR",
          "BROAD_KEYWORD",
          "CONVERSATION",
          "DEVICE",
          "EVENT",
          "FOLLOWER_LOOK_ALIKES",
          "GENDER",
          "INTEREST",
          "KEYWORD",
          "LANGUAGE",
          "LOCATION",
          "NETWORK_OPERATOR",
          "PHRASE_KEYWORD",
          "PLATFORM",
          "PLATFORM_VERSION",
          "SIMILAR_TO_FOLLOWERS_OF_USER",
          "TV_SHOW",
          "UNORDERED_KEYWORD",
          "WIFI_ONLY",
        ])
        .describe(
          "ターゲティング種別（AGE, GENDER, LOCATION, INTEREST, KEYWORD 等）"
        ),
      targetingValue: z
        .string()
        .describe(
          "ターゲティング値。種別に応じた値を指定（例: LOCATION の場合は地域コード、GENDER の場合は 1=男性/2=女性、AGE の場合は AGE_25_TO_34 等）"
        ),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getEnv("X_ADS_ACCOUNT_ID");

        const body: Record<string, unknown> = {
          line_item_id: params.lineItemId,
          targeting_type: params.targetingType,
          targeting_value: params.targetingValue,
        };

        const result = await xAdsPost<XAdsTargetingCriterion>(
          `/accounts/${accountId}/targeting_criteria`,
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
