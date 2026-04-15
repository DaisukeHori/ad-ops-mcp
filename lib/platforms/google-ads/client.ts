/**
 * Google Ads REST API クライアント
 * searchStream (GAQL クエリ) と mutate (リソース変更) の2つの主要操作を提供する
 */

import { getEnv, getEnvOptional } from "@/lib/config";
import { PlatformError } from "@/lib/platforms/errors";
import { getGoogleAdsAccessToken } from "@/lib/platforms/google-ads/auth";
import type {
  GoogleAdsRow,
  MutateOperation,
  MutateResponse,
} from "@/lib/platforms/google-ads/types";

/**
 * Google Ads API のメジャーバージョン
 *
 * 確認日: 2026-04-15（mcp-doctor によるチェンジログ変更検知対応）
 *
 * 現在の状況:
 * - v23 (2026-01-28 リリース) が最新メジャーバージョン
 * - 最新 minor リリースは v23.2 (2026-03-25)
 * - minor リリースは URL を変更しない（/v23/ で v23.2 の機能も利用可能）
 * - v23 で削除された CallAd / CallAdInfo および aggregate asset performance label
 *   metrics は当プロジェクトでは未使用のため影響なし
 * - v21 は今後サンセット予定だが、当プロジェクトは v23 を使用しているため非該当
 *
 * 参考: https://developers.google.com/google-ads/api/docs/release-notes
 */
const GOOGLE_ADS_API_VERSION = "v23";
const BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

/**
 * 共通ヘッダーを生成する
 */
async function getHeaders(): Promise<Record<string, string>> {
  const accessToken = await getGoogleAdsAccessToken();
  const developerToken = getEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
  const loginCustomerId = getEnvOptional("GOOGLE_ADS_LOGIN_CUSTOMER_ID");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };

  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId;
  }

  return headers;
}

/**
 * API エラーレスポンスをパースして PlatformError を生成する
 */
function handleApiError(status: number, responseBody: unknown): PlatformError {
  let message = `HTTP ${status}`;

  if (responseBody && typeof responseBody === "object") {
    const body = responseBody as Record<string, unknown>;
    if (body.error && typeof body.error === "object") {
      const error = body.error as Record<string, unknown>;
      message = String(error.message || message);
      if (Array.isArray(error.details)) {
        const details = error.details as Array<Record<string, unknown>>;
        const errorDetails = details
          .map((d) => {
            if (Array.isArray(d.errors)) {
              return (d.errors as Array<Record<string, unknown>>)
                .map((e) => {
                  const errorMessage = e.message ? String(e.message) : "";
                  const errorCode = e.errorCode
                    ? JSON.stringify(e.errorCode)
                    : "";
                  return `${errorMessage} (${errorCode})`;
                })
                .join("; ");
            }
            return "";
          })
          .filter(Boolean)
          .join("; ");
        if (errorDetails) {
          message = `${message} — 詳細: ${errorDetails}`;
        }
      }
    }
  }

  return new PlatformError("google_ads", status, message);
}

/**
 * GAQL クエリを実行して結果を取得する
 * POST /customers/{customerId}/googleAds:searchStream
 */
export async function searchGoogleAds(
  customerId: string,
  query: string
): Promise<GoogleAdsRow[]> {
  const cleanCustomerId = customerId.replace(/-/g, "");
  const url = `${BASE_URL}/customers/${cleanCustomerId}/googleAds:searchStream`;
  const headers = await getHeaders();

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }
    throw handleApiError(response.status, responseBody);
  }

  const data = (await response.json()) as Array<{
    results?: GoogleAdsRow[];
  }>;

  // searchStream はバッチの配列を返す
  const rows: GoogleAdsRow[] = [];
  for (const batch of data) {
    if (batch.results) {
      rows.push(...batch.results);
    }
  }

  return rows;
}

/**
 * リソースを変更する (作成・更新・削除)
 * POST /customers/{customerId}/{service}:mutate
 */
export async function mutateGoogleAds(
  customerId: string,
  service: string,
  operations: MutateOperation[]
): Promise<MutateResponse> {
  const cleanCustomerId = customerId.replace(/-/g, "");
  const url = `${BASE_URL}/customers/${cleanCustomerId}/${service}:mutate`;
  const headers = await getHeaders();

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ operations }),
  });

  if (!response.ok) {
    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }
    throw handleApiError(response.status, responseBody);
  }

  const data = (await response.json()) as MutateResponse;
  return data;
}

/**
 * アクセス可能なカスタマーIDの一覧を取得する
 * GET /customers:listAccessibleCustomers
 */
export async function listAccessibleCustomers(): Promise<string[]> {
  const url = `${BASE_URL}/customers:listAccessibleCustomers`;
  const headers = await getHeaders();

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }
    throw handleApiError(response.status, responseBody);
  }

  const data = (await response.json()) as { resourceNames: string[] };
  return data.resourceNames;
}
