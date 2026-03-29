import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Ops MCP Server",
  description:
    "Google Ads / Meta Ads / GBP / X Ads 統合広告運用 MCP サーバー — 62 Tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
