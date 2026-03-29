/**
 * MCP サーバー初期化
 * 全ツールを一括登録する（62 tools）
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ── Google Ads（20 tools）──
// Phase 3 で追加

// ── Meta Ads（20 tools）──
// Phase 4 で追加

// ── GBP（10 tools）──
// Phase 5 で追加

// ── X Ads（12 tools）──
// Phase 6 で追加

export function registerAllTools(server: McpServer): void {
  // Google Ads（20 tools）

  // Meta Ads（20 tools）

  // GBP（10 tools）

  // X Ads（12 tools）

  void server; // 一時的: ツール登録前の未使用警告を抑制
}
