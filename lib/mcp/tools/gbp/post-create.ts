/**
 * GBP 投稿作成ツール
 * 指定ロケーションに新しいローカル投稿を作成する（レガシー My Business API v4）
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { gbpPost } from "@/lib/platforms/gbp/client";
import { GBP_LEGACY_BASE } from "@/lib/platforms/gbp/client";
import { PlatformError } from "@/lib/platforms/errors";
import { getGbpAccountId } from "@/lib/platforms/gbp/auth";
import type { GbpPost } from "@/lib/platforms/gbp/types";

export function registerGbpPostCreate(server: McpServer): void {
  server.tool(
    "gbp_post_create",
    "Google Business Profile の特定ロケーションに新しいローカル投稿を作成します。標準投稿、イベント投稿、オファー投稿に対応しています。",
    {
      locationId: z
        .string()
        .describe("ロケーション ID（数値のみ、例: '123456789'）"),
      accountId: z
        .string()
        .optional()
        .describe("GBP アカウント ID。省略時は環境変数 GBP_ACCOUNT_ID を使用"),
      summary: z
        .string()
        .min(1)
        .max(1500)
        .describe("投稿本文（最大1500文字）"),
      topicType: z
        .enum(["STANDARD", "EVENT", "OFFER", "ALERT"])
        .optional()
        .describe("投稿タイプ。STANDARD=標準、EVENT=イベント、OFFER=オファー、ALERT=アラート。デフォルトは STANDARD"),
      actionType: z
        .enum(["ACTION_TYPE_UNSPECIFIED", "BOOK", "ORDER", "SHOP", "LEARN_MORE", "SIGN_UP", "CALL"])
        .optional()
        .describe("行動喚起ボタンの種類"),
      actionUrl: z
        .string()
        .optional()
        .describe("行動喚起ボタンのリンク先 URL"),
      mediaSourceUrl: z
        .string()
        .optional()
        .describe("添付画像の URL"),
      mediaFormat: z
        .enum(["PHOTO", "VIDEO"])
        .optional()
        .describe("メディアの種類（PHOTO または VIDEO）。デフォルトは PHOTO"),
      eventTitle: z
        .string()
        .optional()
        .describe("イベントタイトル（topicType が EVENT の場合に使用）"),
      eventStartDate: z
        .object({
          year: z.number().int(),
          month: z.number().int().min(1).max(12),
          day: z.number().int().min(1).max(31),
        })
        .optional()
        .describe("イベント開始日（topicType が EVENT の場合に必須）"),
      eventEndDate: z
        .object({
          year: z.number().int(),
          month: z.number().int().min(1).max(12),
          day: z.number().int().min(1).max(31),
        })
        .optional()
        .describe("イベント終了日（topicType が EVENT の場合に必須）"),
      eventStartTime: z
        .object({
          hours: z.number().int().min(0).max(23),
          minutes: z.number().int().min(0).max(59),
        })
        .optional()
        .describe("イベント開始時間"),
      eventEndTime: z
        .object({
          hours: z.number().int().min(0).max(23),
          minutes: z.number().int().min(0).max(59),
        })
        .optional()
        .describe("イベント終了時間"),
      couponCode: z
        .string()
        .optional()
        .describe("クーポンコード（topicType が OFFER の場合に使用）"),
      redeemOnlineUrl: z
        .string()
        .optional()
        .describe("オンライン利用 URL（topicType が OFFER の場合に使用）"),
      termsConditions: z
        .string()
        .optional()
        .describe("利用条件（topicType が OFFER の場合に使用）"),
      languageCode: z
        .string()
        .optional()
        .describe("投稿の言語コード（例: 'ja'）"),
    },
    async (params) => {
      try {
        const accountId = params.accountId ?? getGbpAccountId();

        const body: Record<string, unknown> = {
          summary: params.summary,
          topicType: params.topicType ?? "STANDARD",
        };

        if (params.languageCode) {
          body.languageCode = params.languageCode;
        }

        // 行動喚起ボタン
        if (params.actionType) {
          body.callToAction = {
            actionType: params.actionType,
            url: params.actionUrl,
          };
        }

        // メディア
        if (params.mediaSourceUrl) {
          body.media = [
            {
              mediaFormat: params.mediaFormat ?? "PHOTO",
              sourceUrl: params.mediaSourceUrl,
            },
          ];
        }

        // イベント情報
        if (params.eventTitle && params.eventStartDate && params.eventEndDate) {
          const schedule: Record<string, unknown> = {
            startDate: params.eventStartDate,
            endDate: params.eventEndDate,
          };
          if (params.eventStartTime) {
            schedule.startTime = params.eventStartTime;
          }
          if (params.eventEndTime) {
            schedule.endTime = params.eventEndTime;
          }
          body.event = {
            title: params.eventTitle,
            schedule,
          };
        }

        // オファー情報
        if (params.couponCode || params.redeemOnlineUrl || params.termsConditions) {
          const offer: Record<string, unknown> = {};
          if (params.couponCode) offer.couponCode = params.couponCode;
          if (params.redeemOnlineUrl) offer.redeemOnlineUrl = params.redeemOnlineUrl;
          if (params.termsConditions) offer.termsConditions = params.termsConditions;
          body.offer = offer;
        }

        const url = `${GBP_LEGACY_BASE}/accounts/${accountId}/locations/${params.locationId}/localPosts`;

        const result = await gbpPost<GbpPost>(url, body);

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
