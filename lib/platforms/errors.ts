/**
 * 共通エラーハンドリング
 * 全プラットフォームで統一的に使用する PlatformError クラス
 */

export type Platform = "google_ads" | "meta" | "gbp" | "x";

export class PlatformError extends Error {
  public readonly platform: Platform;
  public readonly status: number;
  public readonly platformMessage: string;

  constructor(platform: Platform, status: number, message: string) {
    super(`${platform} API Error (${status}): ${message}`);
    this.name = "PlatformError";
    this.platform = platform;
    this.status = status;
    this.platformMessage = message;
  }

  toUserMessage(): string {
    const platformNames: Record<Platform, string> = {
      google_ads: "Google Ads",
      meta: "Meta (Facebook/Instagram)",
      gbp: "Google Business Profile",
      x: "X (Twitter)",
    };
    const name = platformNames[this.platform];

    switch (this.status) {
      case 401:
        return `${name} の API トークンが無効です。環境変数を再確認してください。`;
      case 403:
        return `${name} の API 権限が不足しています。必要なスコープが付与されているか確認してください。`;
      case 429:
        return `${name} の API レート制限に達しました。しばらく待ってから再試行してください。`;
      default:
        if (this.status >= 500) {
          return `${name} 側でエラーが発生しました。しばらく待ってから再試行してください。`;
        }
        return `${name} API エラー: ${this.platformMessage}`;
    }
  }
}
