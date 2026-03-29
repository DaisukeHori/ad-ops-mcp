/**
 * PlatformError + config 単体テスト
 * UT-COM-001 〜 UT-COM-010
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PlatformError } from "@/lib/platforms/errors";
import { getEnv, getEnvOptional, getAuthMode } from "@/lib/config";

describe("PlatformError", () => {
  // UT-COM-001: PlatformError の基本プロパティ
  it("UT-COM-001: 基本プロパティが正しく設定される", () => {
    const error = new PlatformError("google_ads", 401, "Token expired");
    expect(error.platform).toBe("google_ads");
    expect(error.status).toBe(401);
    expect(error.platformMessage).toBe("Token expired");
    expect(error.name).toBe("PlatformError");
    expect(error.message).toBe("google_ads API Error (401): Token expired");
  });

  // UT-COM-002: 401 エラーメッセージ
  it("UT-COM-002: 401エラーで日本語メッセージを返す", () => {
    const error = new PlatformError("google_ads", 401, "Unauthorized");
    expect(error.toUserMessage()).toBe(
      "Google Ads の API トークンが無効です。環境変数を再確認してください。"
    );
  });

  // UT-COM-003: 403 エラーメッセージ
  it("UT-COM-003: 403エラーで権限不足メッセージを返す", () => {
    const error = new PlatformError("meta", 403, "Forbidden");
    expect(error.toUserMessage()).toBe(
      "Meta (Facebook/Instagram) の API 権限が不足しています。必要なスコープが付与されているか確認してください。"
    );
  });

  // UT-COM-004: 429 エラーメッセージ
  it("UT-COM-004: 429エラーでレート制限メッセージを返す", () => {
    const error = new PlatformError("gbp", 429, "Rate limited");
    expect(error.toUserMessage()).toBe(
      "Google Business Profile の API レート制限に達しました。しばらく待ってから再試行してください。"
    );
  });

  // UT-COM-005: 500 エラーメッセージ
  it("UT-COM-005: 500エラーでサーバーエラーメッセージを返す", () => {
    const error = new PlatformError("x", 500, "Internal error");
    expect(error.toUserMessage()).toBe(
      "X (Twitter) 側でエラーが発生しました。しばらく待ってから再試行してください。"
    );
  });

  // UT-COM-006: その他のエラーメッセージ
  it("UT-COM-006: その他のステータスコードでプラットフォームメッセージを返す", () => {
    const error = new PlatformError("meta", 400, "Bad request");
    expect(error.toUserMessage()).toBe(
      "Meta (Facebook/Instagram) API エラー: Bad request"
    );
  });
});

describe("config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // UT-COM-007: getEnv で環境変数を正常取得
  it("UT-COM-007: getEnvで環境変数を正常取得できる", () => {
    process.env.TEST_VAR = "test-value";
    expect(getEnv("TEST_VAR")).toBe("test-value");
  });

  // UT-COM-008: getEnv で未設定の環境変数はエラー
  it("UT-COM-008: getEnvで未設定の環境変数はエラーを投げる", () => {
    delete process.env.UNDEFINED_VAR;
    expect(() => getEnv("UNDEFINED_VAR")).toThrow("環境変数 UNDEFINED_VAR が設定されていません");
  });

  // UT-COM-009: getEnvOptional で未設定は undefined
  it("UT-COM-009: getEnvOptionalで未設定の環境変数はundefinedを返す", () => {
    delete process.env.OPTIONAL_VAR;
    expect(getEnvOptional("OPTIONAL_VAR")).toBeUndefined();
  });

  // UT-COM-010: getAuthMode のデフォルト値
  it("UT-COM-010: getAuthModeのデフォルト値はenv_tokens", () => {
    delete process.env.AUTH_MODE;
    expect(getAuthMode()).toBe("env_tokens");
  });
});
