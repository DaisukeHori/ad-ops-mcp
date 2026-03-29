/**
 * GBP メディアアップロードツール
 * 指定ロケーションにメディア（写真・動画）を追加する（レガシー My Business API v4）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpPost } from "@/lib/platforms/gbp/client";
import { GBP_LEGACY_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";
import type { GbpMedia } from "@/lib/platforms/gbp/types";

export function registerGbpMediaUpload(server: McpServer): void {
  server.tool(
    "gbp_media_upload",
    "Google Business Profile の特定ロケーションにメディア（写真・動画）を追加します。URL を指定して写真や動画をアップロードできます。カテゴリ（カバー、プロフィール、外観、内装、商品など）を指定可能です。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（数値のみ、例: '123456789'）"),
      accountId: z
        .string()
        .optional()
        .describe("GBP アカウント ID。省略時は環境変数 GBP_ACCOUNT_ID を使用"),
      sourceUrl: z
        .string()
        .describe("メディアファイルの URL。公開アクセス可能な URL を指定してください"),
      mediaFormat: z
        .enum(["PHOTO", "VIDEO"])
        .describe("メディアの種類。PHOTO=写真、VIDEO=動画"),
      category: z
        .enum([
          "COVER",
          "PROFILE",
          "LOGO",
          "EXTERIOR",
          "INTERIOR",
          "PRODUCT",
          "AT_WORK",
          "FOOD_AND_DRINK",
          "MENU",
          "COMMON_AREA",
          "ROOMS",
          "TEAMS",
          "ADDITIONAL",
        ])
        .optional()
        .describe(
          "メディアカテゴリ。COVER=カバー写真、PROFILE=プロフィール写真、LOGO=ロゴ、EXTERIOR=外観、INTERIOR=内装、PRODUCT=商品、AT_WORK=業務中、FOOD_AND_DRINK=飲食、MENU=メニュー、COMMON_AREA=共有スペース、ROOMS=客室、TEAMS=チーム、ADDITIONAL=その他"
        ),
      description: z
        .string()
        .max(1000)
        .optional()
        .describe("メディアの説明文（最大1000文字）"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getGbpAccountId();

        const body: Record<string, unknown> = {
          mediaFormat: params.mediaFormat,
          sourceUrl: params.sourceUrl,
        };

        if (params.category) {
          body.locationAssociation = {
            category: params.category,
          };
        }

        if (params.description) {
          body.description = params.description;
        }

        const url = `${GBP_LEGACY_BASE}/accounts/${accountId}/locations/${params.locationId}/media`;

        const result = await gbpPost<GbpMedia>(url, body);

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
