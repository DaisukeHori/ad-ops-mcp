/**
 * GBP ロケーション更新ツール
 * 指定ロケーションの情報を更新する（Business Information API v1）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpPatch } from "@/lib/platforms/gbp/client";
import { GBP_BUSINESS_INFO_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { GbpLocation } from "@/lib/platforms/gbp/types";

export function registerGbpLocationUpdate(server: McpServer): void {
  server.tool(
    "gbp_location_update",
    "Google Business Profile の特定ロケーション（店舗・拠点）の情報を更新します。タイトル、住所、電話番号、営業時間、ウェブサイトURL、説明文などを変更できます。updateMask で更新対象フィールドを指定してください。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（例: 'locations/123456789'）。'locations/' プレフィックスは自動付与されます"),
      updateMask: z
        .string()
        .describe("更新対象フィールドのカンマ区切りリスト（例: 'title,websiteUri,regularHours'）。指定されたフィールドのみ更新されます"),
      title: z
        .string()
        .optional()
        .describe("ロケーション名（店舗名）"),
      websiteUri: z
        .string()
        .optional()
        .describe("ウェブサイト URL"),
      primaryPhone: z
        .string()
        .optional()
        .describe("主要電話番号"),
      description: z
        .string()
        .optional()
        .describe("ビジネスの説明文"),
      addressLines: z
        .array(z.string())
        .optional()
        .describe("住所の行（例: ['東京都渋谷区...']）"),
      regionCode: z
        .string()
        .optional()
        .describe("地域コード（例: 'JP'）"),
      postalCode: z
        .string()
        .optional()
        .describe("郵便番号"),
      administrativeArea: z
        .string()
        .optional()
        .describe("都道府県"),
      locality: z
        .string()
        .optional()
        .describe("市区町村"),
      languageCode: z
        .string()
        .optional()
        .describe("住所の言語コード（例: 'ja'）"),
      regularHours: z
        .object({
          periods: z.array(
            z.object({
              openDay: z.string().describe("開店曜日（MONDAY, TUESDAY, ...）"),
              openTime: z.string().describe("開店時間（HH:MM形式、例: '09:00'）"),
              closeDay: z.string().describe("閉店曜日"),
              closeTime: z.string().describe("閉店時間（HH:MM形式、例: '18:00'）"),
            })
          ),
        })
        .optional()
        .describe("営業時間情報"),
    },
    async (params) => {
      try {
        const locationName = params.locationId.startsWith("locations/")
          ? params.locationId
          : `locations/${params.locationId}`;

        // リクエストボディを構築
        const body: Record<string, unknown> = {};

        if (params.title !== undefined) {
          body.title = params.title;
        }
        if (params.websiteUri !== undefined) {
          body.websiteUri = params.websiteUri;
        }
        if (params.primaryPhone !== undefined) {
          body.phoneNumbers = { primaryPhone: params.primaryPhone };
        }
        if (params.description !== undefined) {
          body.profile = { description: params.description };
        }
        if (
          params.addressLines !== undefined ||
          params.regionCode !== undefined ||
          params.postalCode !== undefined ||
          params.administrativeArea !== undefined ||
          params.locality !== undefined ||
          params.languageCode !== undefined
        ) {
          const address: Record<string, unknown> = {};
          if (params.addressLines) address.addressLines = params.addressLines;
          if (params.regionCode) address.regionCode = params.regionCode;
          if (params.postalCode) address.postalCode = params.postalCode;
          if (params.administrativeArea) address.administrativeArea = params.administrativeArea;
          if (params.locality) address.locality = params.locality;
          if (params.languageCode) address.languageCode = params.languageCode;
          body.storefrontAddress = address;
        }
        if (params.regularHours !== undefined) {
          body.regularHours = params.regularHours;
        }

        const url = `${GBP_BUSINESS_INFO_BASE}/${locationName}?updateMask=${encodeURIComponent(params.updateMask)}`;

        const result = await gbpPatch<GbpLocation>(url, body);

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
