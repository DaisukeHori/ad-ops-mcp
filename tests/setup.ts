/**
 * Vitest グローバルセットアップ
 * msw サーバーの起動・停止を管理する
 */

import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { oauthHandlers } from "./mocks/handlers/oauth";
import { googleAdsHandlers } from "./mocks/handlers/google-ads";
import { metaAdsHandlers } from "./mocks/handlers/meta-ads";
import { gbpHandlers } from "./mocks/handlers/gbp";
import { xAdsHandlers } from "./mocks/handlers/x-ads";

export const mswServer = setupServer(
  ...oauthHandlers,
  ...googleAdsHandlers,
  ...metaAdsHandlers,
  ...gbpHandlers,
  ...xAdsHandlers
);

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
