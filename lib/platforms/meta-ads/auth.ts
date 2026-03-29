/**
 * Meta Ads 認証管理
 * Long-lived Access Token を環境変数から取得する
 */

import { getEnv } from "@/lib/config";

/**
 * Meta Ads のアクセストークンを取得する。
 * 環境変数 META_ADS_ACCESS_TOKEN が未設定の場合はエラーを投げる。
 */
export function getMetaAccessToken(): string {
  return getEnv("META_ADS_ACCESS_TOKEN");
}

/**
 * Meta Ads の広告アカウント ID を取得する。
 * act_ プレフィックスが付いていない場合は自動で付与する。
 * 環境変数 META_ADS_ACCOUNT_ID が未設定の場合はエラーを投げる。
 */
export function getMetaAccountId(): string {
  const rawId = getEnv("META_ADS_ACCOUNT_ID");
  if (rawId.startsWith("act_")) {
    return rawId;
  }
  return `act_${rawId}`;
}
