/**
 * Google Ads 広告作成ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mutateGoogleAds } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsAdCreate(server: McpServer): void {
  server.tool(
    "google_ads_ad_create",
    "Google Ads にレスポンシブ検索広告を作成します。見出し（最大15個）と説明文（最大4個）、最終URLを指定します。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      adGroupResourceName: z
        .string()
        .describe("広告グループのリソース名（例: customers/123/adGroups/456）"),
      headlines: z
        .array(
          z.object({
            text: z.string().max(30).describe("見出しテキスト（最大30文字）"),
            pinnedField: z
              .enum(["HEADLINE_1", "HEADLINE_2", "HEADLINE_3"])
              .optional()
              .describe("固定表示位置"),
          })
        )
        .min(3)
        .max(15)
        .describe("見出しリスト（3〜15個）"),
      descriptions: z
        .array(
          z.object({
            text: z.string().max(90).describe("説明文テキスト（最大90文字）"),
            pinnedField: z
              .enum(["DESCRIPTION_1", "DESCRIPTION_2"])
              .optional()
              .describe("固定表示位置"),
          })
        )
        .min(2)
        .max(4)
        .describe("説明文リスト（2〜4個）"),
      finalUrls: z
        .array(z.string().url())
        .min(1)
        .describe("最終URL（ランディングページURL）"),
      path1: z
        .string()
        .max(15)
        .optional()
        .describe("表示URLのパス1（最大15文字）"),
      path2: z
        .string()
        .max(15)
        .optional()
        .describe("表示URLのパス2（最大15文字）"),
      status: z
        .enum(["ENABLED", "PAUSED"])
        .optional()
        .describe("広告ステータス（デフォルト: ENABLED）"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");

        const responsiveSearchAd: Record<string, unknown> = {
          headlines: params.headlines.map((h) => ({
            text: h.text,
            ...(h.pinnedField ? { pinnedField: h.pinnedField } : {}),
          })),
          descriptions: params.descriptions.map((d) => ({
            text: d.text,
            ...(d.pinnedField ? { pinnedField: d.pinnedField } : {}),
          })),
        };

        if (params.path1) {
          responsiveSearchAd.path1 = params.path1;
        }
        if (params.path2) {
          responsiveSearchAd.path2 = params.path2;
        }

        const adGroupAdData: Record<string, unknown> = {
          adGroup: params.adGroupResourceName,
          status: params.status ?? "ENABLED",
          ad: {
            responsiveSearchAd,
            finalUrls: params.finalUrls,
          },
        };

        const result = await mutateGoogleAds(customerId, "adGroupAds", [
          { create: adGroupAdData },
        ]);

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
