/**
 * Google Ads キーワード追加ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsKeywordAdd(server: McpServer): void {
  server.tool(
    "google_ads_keyword_add",
    "Google Ads の広告グループにキーワードを追加します。マッチタイプと入札単価を指定できます。金額はマイクロ単位（1円 = 1,000,000）で指定してください。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupResourceName: z
        .string()
        .describe("広告グループのリソース名（例: customers/123/adGroups/456）"),
      keywords: z
        .array(
          z.object({
            text: z.string().describe("キーワードテキスト"),
            matchType: z
              .enum(["EXACT", "PHRASE", "BROAD"])
              .describe("マッチタイプ（EXACT=完全一致, PHRASE=フレーズ一致, BROAD=部分一致）"),
            cpcBidMicros: z
              .number()
              .int()
              .optional()
              .describe("個別CPC入札単価（マイクロ単位: 1円 = 1,000,000）"),
          })
        )
        .min(1)
        .max(5000)
        .describe("追加するキーワードリスト"),
      status: z
        .enum(["ENABLED", "PAUSED"])
        .optional()
        .describe("キーワードステータス（デフォルト: ENABLED）"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const status = params.status ?? "ENABLED";

        const operations = params.keywords.map((kw) => {
          const criterionData: Record<string, unknown> = {
            adGroup: params.adGroupResourceName,
            status,
            keyword: {
              text: kw.text,
              matchType: kw.matchType,
            },
          };

          if (kw.cpcBidMicros !== undefined) {
            criterionData.cpcBidMicros = String(kw.cpcBidMicros);
          }

          return { create: criterionData };
        });

        const result = await mutateGoogleAds(
          customerId,
          "adGroupCriteria",
          operations
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
