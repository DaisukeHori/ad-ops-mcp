/**
 * 環境変数管理
 * 全プラットフォームの認証情報・設定値を一元管理する
 */

/**
 * 環境変数を取得する。未設定の場合はエラーを投げる。
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません。.env ファイルまたは Vercel Environment Variables を確認してください。`);
  }
  return value;
}

/**
 * 環境変数を取得する。未設定の場合は undefined を返す。
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key] || undefined;
}

/**
 * AUTH_MODE を取得する
 */
export type AuthMode = "env_tokens" | "api_key";

export function getAuthMode(): AuthMode {
  const mode = process.env.AUTH_MODE || "env_tokens";
  if (mode !== "env_tokens" && mode !== "api_key") {
    throw new Error(`無効な AUTH_MODE: ${mode}。"env_tokens" または "api_key" を指定してください。`);
  }
  return mode;
}
