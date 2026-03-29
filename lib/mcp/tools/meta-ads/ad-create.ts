/**
 * Meta Ads 広告作成ツール
 * POST /{account_id}/ads
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsAdCreate(server: McpServer): void {
  server.tool(
    "meta_ads_ad_create",
    "Meta広告を新規作成します。広告セットIDとクリエイティブIDを指定して広告を作成します。",
    {
      name: z.string().describe("広告名"),
      adset_id: z.string().describe("所属する広告セットのID"),
      creative_id: z.string().describe("使用するクリエイティブのID"),
      status: z
        .enum(["ACTIVE", "PAUSED"])
        .optional()
        .describe("初期ステータス。デフォルト: PAUSED"),
      tracking_specs: z
        .string()
        .optional()
        .describe(
          "トラッキング設定（JSON文字列）。例: [{\"action.type\":[\"offsite_conversion\"],\"fb_pixel\":[\"123456\"]}]"
        ),
    },
    async (params) => {
      try {
        const accountId = getMetaAccountId();
        const body: Record<string, unknown> = {
          name: params.name,
          adset_id: params.adset_id,
          creative: { creative_id: params.creative_id },
          status: params.status ?? "PAUSED",
        };
        if (params.tracking_specs !== undefined) {
          body.tracking_specs = JSON.parse(params.tracking_specs);
        }

        const result = await metaPost<{ id: string }>(
          `${accountId}/ads`,
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
                text: "tracking_specs パラメータのJSON形式が不正です。正しいJSON文字列を指定してください。",
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
