/**
 * Google Ads アカウント一覧取得ツール
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listAccessibleCustomers } from "@/lib/platforms/google-ads/client";
import { PlatformError } from "@/lib/platforms/errors";

export function registerGoogleAdsAccountList(server: McpServer): void {
  server.tool(
    "google_ads_account_list",
    "Google Ads でアクセス可能なアカウント（顧客ID）の一覧を取得します。MCC（マネージャーアカウント）配下のアカウントを確認する際に使用します。",
    {
      _dummy: z
        .string()
        .optional()
        .describe("このツールにパラメータは不要です（内部用）"),
    },
    async () => {
      try {
        const resourceNames = await listAccessibleCustomers();

        const accounts = resourceNames.map((rn) => {
          const customerId = rn.replace("customers/", "");
          return { resourceName: rn, customerId };
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { totalCount: accounts.length, accounts },
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
