/**
 * GAQL クエリビルダーの単体テスト
 * UT-COM-009 〜 UT-COM-010
 */

import { describe, it, expect } from "vitest";
import { buildCampaignListQuery } from "@/lib/platforms/google-ads/gaql";

describe("GAQL Query Builder", () => {
  it("UT-COM-009: buildCampaignListQuery() がデフォルトで有効な GAQL を生成する", () => {
    const query = buildCampaignListQuery();

    // SELECT 句にキャンペーンフィールドが含まれる
    expect(query).toContain("SELECT");
    expect(query).toContain("campaign.id");
    expect(query).toContain("campaign.name");
    expect(query).toContain("campaign.status");
    expect(query).toContain("metrics.impressions");
    expect(query).toContain("metrics.clicks");
    expect(query).toContain("metrics.cost_micros");

    // FROM campaign が含まれる
    expect(query).toContain("FROM campaign");

    // REMOVED を除外するデフォルト WHERE が含まれる
    expect(query).toContain("WHERE");
    expect(query).toContain("campaign.status != 'REMOVED'");

    // ORDER BY が含まれる
    expect(query).toContain("ORDER BY campaign.name ASC");

    // LIMIT はデフォルトでは含まれない
    expect(query).not.toContain("LIMIT");
  });

  it("UT-COM-010: buildCampaignListQuery({ status, limit }) で WHERE と LIMIT が生成される", () => {
    const query = buildCampaignListQuery({ status: "ENABLED", limit: 10 });

    // WHERE にステータスフィルタが含まれる
    expect(query).toContain("WHERE");
    expect(query).toContain("campaign.status = 'ENABLED'");

    // REMOVED 除外は status 指定時には含まれない
    expect(query).not.toContain("campaign.status != 'REMOVED'");

    // LIMIT が含まれる
    expect(query).toContain("LIMIT 10");

    // ORDER BY が含まれる
    expect(query).toContain("ORDER BY campaign.name ASC");
  });
});
