/**
 * テスト用 MCP クライアントヘルパー
 * callTool() と chainTools() を提供する
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "@/lib/mcp/server";

/**
 * テスト用 MCP サーバーを作成する
 */
export function createTestServer(): McpServer {
  const server = new McpServer({ name: "ad-ops-mcp-test", version: "1.0.0" });
  registerAllTools(server);
  return server;
}

/**
 * ツールの実行結果
 */
export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * ツールを直接呼び出す
 */
export async function callTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const server = createTestServer();

  // サーバーの内部ツールハンドラーを取得して実行
  // McpServer の tool() で登録されたハンドラーを直接呼び出す
  const registeredTools = (server as unknown as {
    _registeredTools: Record<string, {
      inputSchema: { parse: (args: unknown) => unknown };
      handler: (args: Record<string, unknown>) => Promise<ToolResult>;
    }>;
  })._registeredTools;

  const toolEntry = registeredTools?.[toolName];

  if (!toolEntry) {
    throw new Error(`ツール "${toolName}" が見つかりません。`);
  }

  // zod スキーマでバリデーション（MCP サーバーと同じ挙動を再現）
  if (toolEntry.inputSchema && typeof toolEntry.inputSchema.parse === "function") {
    try {
      toolEntry.inputSchema.parse(args);
    } catch (validationError) {
      return {
        content: [{ type: "text" as const, text: String(validationError) }],
        isError: true,
      };
    }
  }

  return toolEntry.handler(args);
}

/**
 * ツールチェーン定義
 */
export interface ChainStep {
  tool: string;
  args: Record<string, unknown> | ((prevResult: ToolResult) => Record<string, unknown>);
}

/**
 * 複数ツールを連鎖実行する
 * 前のツールの出力を次のツールの入力に渡すことができる
 */
export async function chainTools(steps: ChainStep[]): Promise<ToolResult[]> {
  const results: ToolResult[] = [];

  for (const step of steps) {
    const args =
      typeof step.args === "function"
        ? step.args(results[results.length - 1])
        : step.args;

    const result = await callTool(step.tool, args);
    results.push(result);
  }

  return results;
}

/**
 * ToolResult からテキストを抽出する
 */
export function extractText(result: ToolResult): string {
  return result.content.map((c) => c.text).join("\n");
}

/**
 * ToolResult から JSON パース済みオブジェクトを取得する
 */
export function extractJson<T = unknown>(result: ToolResult): T {
  const text = extractText(result);
  return JSON.parse(text) as T;
}

/**
 * リソース名から ID を抽出する
 * 例: "customers/123/campaigns/456" → "456"
 */
export function extractResourceId(resourceName: string): string {
  const parts = resourceName.split("/");
  return parts[parts.length - 1];
}
