/**
 * Meta Ads Graph API クライアント
 * GET / POST リクエストを統一的に処理する
 */

import { getMetaAccessToken } from "@/lib/platforms/meta-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";
import type { MetaErrorResponse } from "@/lib/platforms/meta-ads/types";

const BASE_URL = "https://graph.facebook.com/v25.0";

/**
 * Meta API エラーレスポンスかどうかを判定する
 */
function isMetaErrorResponse(body: unknown): body is MetaErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as MetaErrorResponse).error === "object" &&
    (body as MetaErrorResponse).error !== null &&
    "message" in (body as MetaErrorResponse).error
  );
}

/**
 * Graph API に GET リクエストを送信する。
 * access_token はクエリパラメータとして自動付与される。
 */
export async function metaGet<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const token = getMetaAccessToken();
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", token);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    if (isMetaErrorResponse(body)) {
      throw new PlatformError(
        "meta",
        response.status,
        body.error.message
      );
    }
    throw new PlatformError(
      "meta",
      response.status,
      `HTTP ${response.status}: リクエストに失敗しました`
    );
  }

  return body as T;
}

/**
 * Graph API に POST リクエストを送信する。
 * access_token はリクエストボディに自動付与される。
 */
export async function metaPost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const token = getMetaAccessToken();
  const url = `${BASE_URL}/${endpoint}`;

  const requestBody = {
    ...body,
    access_token: token,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseBody: unknown = await response.json();

  if (!response.ok) {
    if (isMetaErrorResponse(responseBody)) {
      throw new PlatformError(
        "meta",
        response.status,
        responseBody.error.message
      );
    }
    throw new PlatformError(
      "meta",
      response.status,
      `HTTP ${response.status}: リクエストに失敗しました`
    );
  }

  return responseBody as T;
}
