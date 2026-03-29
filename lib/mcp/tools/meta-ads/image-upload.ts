/**
 * Meta Ads 画像アップロードツール
 * POST /{account_id}/adimages
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { metaPost } from "@/lib/platforms/meta-ads/client";
import { getMetaAccountId } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaImageUploadResult } from "@/lib/platforms/meta-ads/types";

export function registerMetaAdsImageUpload(server: McpServer): void {
  server.tool(
    "meta_ads_image_upload",
    "Meta広告用の画像をアップロードします。URLからの画像アップロードに対応しています。アップロード後に返されるimage_hashをクリエイティブ作成時に使用します。",
    {
      image_url: z
        .string()
        .optional()
        .describe("アップロードする画像のURL。image_url か image_bytes のどちらかを指定"),
      image_bytes: z
        .string()
        .optional()
        .describe("Base64エンコードされた画像データ"),
      name: z
        .string()
        .optional()
        .describe("画像の名前（管理用）"),
    },
    async (params) => {
      try {
        if (!params.image_url && !params.image_bytes) {
          return {
            content: [
              {
                type: "text" as const,
                text: "image_url または image_bytes のどちらかを指定してください。",
              },
            ],
            isError: true,
          };
        }

        const accountId = getMetaAccountId();
        const body: Record<string, unknown> = {};
        if (params.image_url !== undefined) {
          body.url = params.image_url;
        }
        if (params.image_bytes !== undefined) {
          body.bytes = params.image_bytes;
        }
        if (params.name !== undefined) {
          body.name = params.name;
        }

        const result = await metaPost<MetaImageUploadResult>(
          `${accountId}/adimages`,
          body
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
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
