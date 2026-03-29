/**
 * Meta Ads クリエイティブ作成ツール
 * POST /{account_id}/adcreatives
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsCreativeCreate(server: McpServer): void {
  server.tool(
    "meta_ads_creative_create",
    "Meta広告クリエイティブを新規作成します。リンク広告、画像広告、動画広告のクリエイティブを作成できます。",
    {
      name: z.string().describe("クリエイティブ名"),
      object_story_spec: z
        .string()
        .describe(
          "ObjectStorySpec（JSON文字列）。Facebookページでの広告表示を定義します。例: {\"page_id\":\"123\",\"link_data\":{\"message\":\"広告文\",\"link\":\"https://example.com\",\"image_hash\":\"abc123\"}}"
        ),
      url_tags: z
        .string()
        .optional()
        .describe("URLタグ（UTMパラメータなど）。例: utm_source=facebook&utm_medium=cpc"),
      call_to_action_type: z
        .enum([
          "LEARN_MORE",
          "SHOP_NOW",
          "SIGN_UP",
          "BOOK_TRAVEL",
          "CONTACT_US",
          "DOWNLOAD",
          "GET_OFFER",
          "GET_QUOTE",
          "SUBSCRIBE",
          "WATCH_MORE",
          "APPLY_NOW",
          "ORDER_NOW",
          "SEND_MESSAGE",
        ])
        .optional()
        .describe("CTA（Call-to-Action）ボタンの種類"),
    },
    async (params) => {
      try {
        const accountId = getMetaAccountId();
        const body: Record<string, unknown> = {
          name: params.name,
          object_story_spec: JSON.parse(params.object_story_spec),
        };
        if (params.url_tags !== undefined) {
          body.url_tags = params.url_tags;
        }
        if (params.call_to_action_type !== undefined) {
          body.call_to_action_type = params.call_to_action_type;
        }

        const result = await metaPost<{ id: string }>(
          `${accountId}/adcreatives`,
          body
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        if (error instanceof SyntaxError) {
          return {
            content: [
              {
                type: "text" as const,
                text: "object_story_spec パラメータのJSON形式が不正です。正しいJSON文字列を指定してください。",
              },
            ],
            isError: true,
          };
        }
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
