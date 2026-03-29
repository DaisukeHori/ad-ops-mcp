/**
 * Meta Ads 広告更新ツール
 * POST /{ad_id}
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { PlatformError } from "@/lib/platforms/errors";

export function registerMetaAdsAdUpdate(server: McpServer): void {
  server.tool(
    "meta_ads_ad_update",
    "既存のMeta広告を更新します。名前、ステータス、クリエイティブなどを変更できます。",
    {
      adId: z.string().describe("更新対象の広告ID"),
      name: z.string().optional().describe("新しい広告名"),
      status: z
        .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
        .optional()
        .describe("新しいステータス"),
      creative_id: z
        .string()
        .optional()
        .describe("新しいクリエイティブID"),
      tracking_specs: z
        .string()
        .optional()
        .describe("新しいトラッキング設定（JSON文字列）"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.name !== undefined) {
          body.name = params.name;
        }
        if (params.status !== undefined) {
          body.status = params.status;
        }
        if (params.creative_id !== undefined) {
          body.creative = { creative_id: params.creative_id };
        }
        if (params.tracking_specs !== undefined) {
          body.tracking_specs = JSON.parse(params.tracking_specs);
        }

        const result = await metaPost<{ success: boolean }>(
          params.adId,
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
