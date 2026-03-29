/**
 * X (Twitter) Ads API クライアント
 * OAuth 1.0a 認証を用いて X Ads API v12 にリクエストを送信する
 */

import { generateOAuthHeader } from "@/lib/platforms/x-ads/auth";
import { PlatformError } from "@/lib/platforms/errors";

/** X Ads API v12 のベース URL */
const BASE_URL = "https://ads-api.x.com/12";

/**
 * X Ads API のレスポンス共通ラッパー
 */
interface XAdsApiResponse<T> {
  data: T;
  data_type: string;
  total_count?: number;
  next_cursor?: string;
  request: {
    params: Record<string, unknown>;
  };
}

/**
 * X Ads API エラーレスポンスの型
 */
interface XAdsErrorResponse {
  errors: Array<{
    code: string;
    message: string;
    parameter?: string;
  }>;
  request: {
    params: Record<string, unknown>;
  };
}

/**
 * レスポンスのエラーチェックを行い、エラーの場合は PlatformError を投げる。
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorBody = (await response.json()) as XAdsErrorResponse;
      if (errorBody.errors && errorBody.errors.length > 0) {
        errorMessage = errorBody.errors
          .map((e) => `[${e.code}] ${e.message}`)
          .join("; ");
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new PlatformError("x", response.status, errorMessage);
  }

  const json = (await response.json()) as T;
  return json;
}

/**
 * X Ads API に GET リクエストを送信する。
 *
 * @param endpoint - ベース URL からの相対パス（例: "/accounts"）
 * @returns API レスポンスデータ
 */
export async function xAdsGet<T>(endpoint: string): Promise<XAdsApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  // クエリパラメータを抽出して署名に含める
  const urlObj = new URL(url);
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // 署名生成にはクエリパラメータなしのベース URL を使用
  const baseUrlForSigning = `${urlObj.origin}${urlObj.pathname}`;
  const oauthHeader = generateOAuthHeader("GET", baseUrlForSigning, queryParams);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  return handleResponse<XAdsApiResponse<T>>(response);
}

/**
 * X Ads API に POST リクエストを送信する。
 *
 * @param endpoint - ベース URL からの相対パス
 * @param body - リクエストボディ（JSON）
 * @returns API レスポンスデータ
 */
export async function xAdsPost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<XAdsApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  // POST の場合、ボディのパラメータも署名に含める（フォームエンコード時）
  // JSON ボディの場合はクエリパラメータのみ
  const urlObj = new URL(url);
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const baseUrlForSigning = `${urlObj.origin}${urlObj.pathname}`;
  const oauthHeader = generateOAuthHeader("POST", baseUrlForSigning, queryParams);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<XAdsApiResponse<T>>(response);
}

/**
 * X Ads API に PUT リクエストを送信する。
 *
 * @param endpoint - ベース URL からの相対パス
 * @param body - リクエストボディ（JSON）
 * @returns API レスポンスデータ
 */
export async function xAdsPut<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<XAdsApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const urlObj = new URL(url);
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const baseUrlForSigning = `${urlObj.origin}${urlObj.pathname}`;
  const oauthHeader = generateOAuthHeader("PUT", baseUrlForSigning, queryParams);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<XAdsApiResponse<T>>(response);
}

/**
 * X Ads API に DELETE リクエストを送信する。
 *
 * @param endpoint - ベース URL からの相対パス
 * @returns API レスポンスデータ
 */
export async function xAdsDelete<T>(endpoint: string): Promise<XAdsApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const urlObj = new URL(url);
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const baseUrlForSigning = `${urlObj.origin}${urlObj.pathname}`;
  const oauthHeader = generateOAuthHeader("DELETE", baseUrlForSigning, queryParams);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  return handleResponse<XAdsApiResponse<T>>(response);
}
