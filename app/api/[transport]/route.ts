/**
 * MCP エンドポイント
 *
 * /api/mcp  → Streamable HTTP (メイン)
 * /api/sse  → SSE (後方互換)
 *
 * AUTH_MODE による認証分岐:
 *  - "env_tokens" (デフォルト):
 *      各プラットフォームのトークンは全て環境変数から取得
 *      MCPサーバー自体への認証はなし
 *
 *  - "api_key":
 *      APIキー渡し方（優先順）:
 *        1. Authorization: Bearer <MCP_API_KEY>
 *        2. URL クエリ ?key=<MCP_API_KEY>
 *      各プラットフォームのトークンは環境変数から取得
 */

import { createMcpHandler } from "mcp-handler";
import { registerAllTools } from "@/lib/mcp/server";
import { getAuthMode } from "@/lib/config";

// Vercel Function として明示的に Node.js ランタイムで動作させる
// （エッジランタイムでは mcp-handler が想定通りに動作しないため）
export const runtime = "nodejs";

// レスポンスをキャッシュさせない（MCP は常に動的レスポンス）
export const dynamic = "force-dynamic";

// Next.js 15 推奨の関数タイムアウト指定（vercel.json とあわせて 60 秒）
export const maxDuration = 60;

const mcpHandler = createMcpHandler(
  (server) => {
    registerAllTools(server);
  },
  {},
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
  }
);

/**
 * Bearer Token を Authorization ヘッダーから抽出する
 */
function extractBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || undefined;
}

/**
 * URL クエリパラメータからトークンを抽出する
 * Claude.ai Web 等、カスタムヘッダーを設定できないクライアント向け
 */
function extractQueryToken(request: Request, param: string): string | undefined {
  try {
    const url = new URL(request.url);
    return url.searchParams.get(param) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * api_key モード: MCP_API_KEY で認証
 * 一致しなければ 401 を返す
 */
function verifyApiKey(apiKey: string | undefined): Response | null {
  const expectedKey = process.env.MCP_API_KEY;

  if (!expectedKey) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message:
            "サーバー設定エラー: AUTH_MODE=api_key ですが MCP_API_KEY が設定されていません。",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message:
            "認証エラー: 有効な API キーを Authorization: Bearer <MCP_API_KEY> または ?key=<MCP_API_KEY> で指定してください。",
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return null; // 認証OK
}

/**
 * 軽量ヘルスチェックレスポンスを生成する
 *
 * mcp-doctor や UptimeRobot などの監視ツールが MCP プロトコルを話さずに
 * サーバーの生存確認を行えるよう、GET /api/health と GET /api/mcp (非MCP時)
 * に対して 200 OK を返す。
 */
function buildHealthResponse(): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "ad-ops-mcp",
      transports: ["streamable-http", "sse"],
      endpoints: {
        mcp: "/api/mcp",
        sse: "/api/sse",
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * メインハンドラー
 */
async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // ── ヘルスチェック ──
  // /api/health は常時 200 を返す。
  // GET /api/mcp も、MCP クライアント以外からの生存監視用途として 200 を返す。
  if (url.pathname.endsWith("/api/health")) {
    return buildHealthResponse();
  }
  if (request.method === "GET" && url.pathname.endsWith("/api/mcp")) {
    return buildHealthResponse();
  }

  const mode = getAuthMode();
  const bearerToken = extractBearerToken(request);

  if (mode === "api_key") {
    // ── api_key モード ──
    const apiKey = bearerToken || extractQueryToken(request, "key");
    const errorResponse = verifyApiKey(apiKey);
    if (errorResponse) return errorResponse;
    return mcpHandler(request);
  }

  // ── env_tokens モード（デフォルト） ──
  // 全トークンは環境変数から取得されるため、そのまま実行
  return mcpHandler(request);
}

export { handler as GET, handler as POST };
