/**
 * Google Business Profile API クライアント
 * Business Information API v1、レガシー My Business API v4、Performance API v1 の3つのベースURLを使い分ける
 */

import { getGbpAccessToken } from "@/lib/platforms/gbp/auth";
import { PlatformError } from "@/lib/platforms/errors";

/** GBP API のベース URL 定数 */
export const GBP_BUSINESS_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
export const GBP_LEGACY_BASE = "https://mybusiness.googleapis.com/v4";
export const GBP_PERFORMANCE_BASE = "https://businessprofileperformance.googleapis.com/v1";
export const GBP_ACCOUNT_MANAGEMENT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";

/**
 * 認証ヘッダーを構築する
 */
async function getHeaders(): Promise<Record<string, string>> {
  const accessToken = await getGbpAccessToken();
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

/**
 * API レスポンスを処理し、エラー時は PlatformError をスローする
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new PlatformError("gbp", response.status, errorText);
  }
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

/**
 * GBP API に GET リクエストを送る
 */
export async function gbpGet<T>(url: string): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  return handleResponse<T>(response);
}

/**
 * GBP API に POST リクエストを送る
 */
export async function gbpPost<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * GBP API に PATCH リクエストを送る
 */
export async function gbpPatch<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * GBP API に PUT リクエストを送る
 */
export async function gbpPut<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

/**
 * GBP API に DELETE リクエストを送る
 */
export async function gbpDelete(url: string): Promise<void> {
  const headers = await getHeaders();
  const response = await fetch(url, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new PlatformError("gbp", response.status, errorText);
  }
}
