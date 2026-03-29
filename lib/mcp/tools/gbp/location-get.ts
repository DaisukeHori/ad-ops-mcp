/**
 * GBP ロケーション詳細取得ツール
 * 指定ロケーションの詳細情報を取得する（Business Information API v1）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpGet } from "@/lib/platforms/gbp/client";
import { GBP_BUSINESS_INFO_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import type { GbpLocation } from "@/lib/platforms/gbp/types";

export function registerGbpLocationGet(server: McpServer): void {
  server.tool(
    "gbp_location_get",
    "Google Business Profile の特定ロケーション（店舗・拠点）の詳細情報を取得します。住所、電話番号、営業時間、カテゴリなどの情報を含みます。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（例: 'locations/123456789'）。'locations/' プレフィックスは自動付与されます"),
      readMask: z
        .string()
        .optional()
        .describe("取得するフィールドのカンマ区切りリスト（例: 'title,storefrontAddress,regularHours'）"),
    },
    async (params) => {
      try {
        const locationName = params.locationId.startsWith("locations/")
          ? params.locationId
          : `locations/${params.locationId}`;

        const queryParams = new URLSearchParams();
        if (params.readMask) {
          queryParams.set("readMask", params.readMask);
        }

        const queryString = queryParams.toString();
        const url = `${GBP_BUSINESS_INFO_BASE}/${locationName}${queryString ? `?${queryString}` : ""}`;

        const result = await gbpGet<GbpLocation>(url);

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
