/**
 * Google Ads キャンペーンレポート取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchGoogleAds } from "@/lib/platforms/google-ads/client";
import { buildCampaignReportQuery } from "@/lib/platforms/google-ads/gaql";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv } from "@/lib/config";

export function registerGoogleAdsReportCampaign(server: McpServer): void {
  server.tool(
    "google_ads_report_campaign",
    "Google Ads のキャンペーンレポートを日別で取得します。表示回数、クリック数、費用（マイクロ単位: 1円 = 1,000,000）、コンバージョン数などのメトリクスを含みます。",
    {
      customerId: z
        .string()
        .optional()
        .describe("Google Ads 顧客ID（省略時は環境変数 GOOGLE_ADS_CUSTOMER_ID を使用）"),
      startDate: z
        .string()
        .describe("レポート開始日（YYYY-MM-DD形式）"),
      endDate: z
        .string()
        .describe("レポート終了日（YYYY-MM-DD形式）"),
      campaignId: z
        .string()
        .optional()
        .describe("特定キャンペーンIDでフィルタ"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50000)
        .optional()
        .describe("取得する最大件数"),
    },
    async (params) => {
      try {
        const customerId = params.customerId ?? getEnv("GOOGLE_ADS_CUSTOMER_ID");
        const query = buildCampaignReportQuery({
          startDate: params.startDate,
          endDate: params.endDate,
          campaignId: params.campaignId,
          limit: params.limit,
        });
        const rows = await searchGoogleAds(customerId, query);

        const reportRows = rows.map((row) => ({
          campaign: row.campaign,
          segments: row.segments,
          metrics: row.metrics,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalRows: reportRows.length, reportRows },
                null,
                2
              ),
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
