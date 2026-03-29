/**
 * MCP サーバー初期化
 * 全ツールを一括登録する（62 tools）
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ── Google Ads（20 tools）──
import { registerGoogleAdsCampaignList } from "@/lib/mcp/tools/google-ads/campaign-list";
import { registerGoogleAdsCampaignGet } from "@/lib/mcp/tools/google-ads/campaign-get";
import { registerGoogleAdsCampaignCreate } from "@/lib/mcp/tools/google-ads/campaign-create";
import { registerGoogleAdsCampaignUpdate } from "@/lib/mcp/tools/google-ads/campaign-update";
import { registerGoogleAdsAdGroupList } from "@/lib/mcp/tools/google-ads/adgroup-list";
import { registerGoogleAdsAdGroupCreate } from "@/lib/mcp/tools/google-ads/adgroup-create";
import { registerGoogleAdsAdGroupUpdate } from "@/lib/mcp/tools/google-ads/adgroup-update";
import { registerGoogleAdsAdList } from "@/lib/mcp/tools/google-ads/ad-list";
import { registerGoogleAdsAdCreate } from "@/lib/mcp/tools/google-ads/ad-create";
import { registerGoogleAdsAdUpdate } from "@/lib/mcp/tools/google-ads/ad-update";
import { registerGoogleAdsAdPolicyStatus } from "@/lib/mcp/tools/google-ads/ad-policy-status";
import { registerGoogleAdsKeywordList } from "@/lib/mcp/tools/google-ads/keyword-list";
import { registerGoogleAdsKeywordAdd } from "@/lib/mcp/tools/google-ads/keyword-add";
import { registerGoogleAdsKeywordRemove } from "@/lib/mcp/tools/google-ads/keyword-remove";
import { registerGoogleAdsBudgetList } from "@/lib/mcp/tools/google-ads/budget-list";
import { registerGoogleAdsBudgetCreate } from "@/lib/mcp/tools/google-ads/budget-create";
import { registerGoogleAdsBudgetUpdate } from "@/lib/mcp/tools/google-ads/budget-update";
import { registerGoogleAdsReportCampaign } from "@/lib/mcp/tools/google-ads/report-campaign";
import { registerGoogleAdsReportKeyword } from "@/lib/mcp/tools/google-ads/report-keyword";
import { registerGoogleAdsAccountList } from "@/lib/mcp/tools/google-ads/account-list";

// ── Meta Ads（20 tools）──
import { registerMetaAdsCampaignList } from "@/lib/mcp/tools/meta-ads/campaign-list";
import { registerMetaAdsCampaignGet } from "@/lib/mcp/tools/meta-ads/campaign-get";
import { registerMetaAdsCampaignCreate } from "@/lib/mcp/tools/meta-ads/campaign-create";
import { registerMetaAdsCampaignUpdate } from "@/lib/mcp/tools/meta-ads/campaign-update";
import { registerMetaAdsAdsetList } from "@/lib/mcp/tools/meta-ads/adset-list";
import { registerMetaAdsAdsetGet } from "@/lib/mcp/tools/meta-ads/adset-get";
import { registerMetaAdsAdsetCreate } from "@/lib/mcp/tools/meta-ads/adset-create";
import { registerMetaAdsAdsetUpdate } from "@/lib/mcp/tools/meta-ads/adset-update";
import { registerMetaAdsAdList } from "@/lib/mcp/tools/meta-ads/ad-list";
import { registerMetaAdsAdGet } from "@/lib/mcp/tools/meta-ads/ad-get";
import { registerMetaAdsAdCreate } from "@/lib/mcp/tools/meta-ads/ad-create";
import { registerMetaAdsAdUpdate } from "@/lib/mcp/tools/meta-ads/ad-update";
import { registerMetaAdsAdReviewStatus } from "@/lib/mcp/tools/meta-ads/ad-review-status";
import { registerMetaAdsCreativeCreate } from "@/lib/mcp/tools/meta-ads/creative-create";
import { registerMetaAdsCreativeList } from "@/lib/mcp/tools/meta-ads/creative-list";
import { registerMetaAdsImageUpload } from "@/lib/mcp/tools/meta-ads/image-upload";
import { registerMetaAdsInsightCampaign } from "@/lib/mcp/tools/meta-ads/insight-campaign";
import { registerMetaAdsInsightAdset } from "@/lib/mcp/tools/meta-ads/insight-adset";
import { registerMetaAdsInsightAd } from "@/lib/mcp/tools/meta-ads/insight-ad";
import { registerMetaAdsAudienceList } from "@/lib/mcp/tools/meta-ads/audience-list";

// ── GBP（10 tools）──
import { registerGbpLocationList } from "@/lib/mcp/tools/gbp/location-list";
import { registerGbpLocationGet } from "@/lib/mcp/tools/gbp/location-get";
import { registerGbpLocationUpdate } from "@/lib/mcp/tools/gbp/location-update";
import { registerGbpReviewList } from "@/lib/mcp/tools/gbp/review-list";
import { registerGbpReviewReply } from "@/lib/mcp/tools/gbp/review-reply";
import { registerGbpPostList } from "@/lib/mcp/tools/gbp/post-list";
import { registerGbpPostCreate } from "@/lib/mcp/tools/gbp/post-create";
import { registerGbpPostDelete } from "@/lib/mcp/tools/gbp/post-delete";
import { registerGbpInsightGet } from "@/lib/mcp/tools/gbp/insight-get";
import { registerGbpMediaUpload } from "@/lib/mcp/tools/gbp/media-upload";

// ── X Ads（12 tools）──
import { registerXAdsAccountList } from "@/lib/mcp/tools/x-ads/account-list";
import { registerXAdsCampaignList } from "@/lib/mcp/tools/x-ads/campaign-list";
import { registerXAdsCampaignCreate } from "@/lib/mcp/tools/x-ads/campaign-create";
import { registerXAdsCampaignUpdate } from "@/lib/mcp/tools/x-ads/campaign-update";
import { registerXAdsLineitemList } from "@/lib/mcp/tools/x-ads/lineitem-list";
import { registerXAdsLineitemCreate } from "@/lib/mcp/tools/x-ads/lineitem-create";
import { registerXAdsLineitemUpdate } from "@/lib/mcp/tools/x-ads/lineitem-update";
import { registerXAdsCreativeList } from "@/lib/mcp/tools/x-ads/creative-list";
import { registerXAdsCreativeCreate } from "@/lib/mcp/tools/x-ads/creative-create";
import { registerXAdsTargetingList } from "@/lib/mcp/tools/x-ads/targeting-list";
import { registerXAdsTargetingCreate } from "@/lib/mcp/tools/x-ads/targeting-create";
import { registerXAdsAnalytics } from "@/lib/mcp/tools/x-ads/analytics";

export function registerAllTools(server: McpServer): void {
  // Google Ads（20 tools）
  registerGoogleAdsCampaignList(server);
  registerGoogleAdsCampaignGet(server);
  registerGoogleAdsCampaignCreate(server);
  registerGoogleAdsCampaignUpdate(server);
  registerGoogleAdsAdGroupList(server);
  registerGoogleAdsAdGroupCreate(server);
  registerGoogleAdsAdGroupUpdate(server);
  registerGoogleAdsAdList(server);
  registerGoogleAdsAdCreate(server);
  registerGoogleAdsAdUpdate(server);
  registerGoogleAdsAdPolicyStatus(server);
  registerGoogleAdsKeywordList(server);
  registerGoogleAdsKeywordAdd(server);
  registerGoogleAdsKeywordRemove(server);
  registerGoogleAdsBudgetList(server);
  registerGoogleAdsBudgetCreate(server);
  registerGoogleAdsBudgetUpdate(server);
  registerGoogleAdsReportCampaign(server);
  registerGoogleAdsReportKeyword(server);
  registerGoogleAdsAccountList(server);

  // Meta Ads（20 tools）
  registerMetaAdsCampaignList(server);
  registerMetaAdsCampaignGet(server);
  registerMetaAdsCampaignCreate(server);
  registerMetaAdsCampaignUpdate(server);
  registerMetaAdsAdsetList(server);
  registerMetaAdsAdsetGet(server);
  registerMetaAdsAdsetCreate(server);
  registerMetaAdsAdsetUpdate(server);
  registerMetaAdsAdList(server);
  registerMetaAdsAdGet(server);
  registerMetaAdsAdCreate(server);
  registerMetaAdsAdUpdate(server);
  registerMetaAdsAdReviewStatus(server);
  registerMetaAdsCreativeCreate(server);
  registerMetaAdsCreativeList(server);
  registerMetaAdsImageUpload(server);
  registerMetaAdsInsightCampaign(server);
  registerMetaAdsInsightAdset(server);
  registerMetaAdsInsightAd(server);
  registerMetaAdsAudienceList(server);

  // GBP（10 tools）
  registerGbpLocationList(server);
  registerGbpLocationGet(server);
  registerGbpLocationUpdate(server);
  registerGbpReviewList(server);
  registerGbpReviewReply(server);
  registerGbpPostList(server);
  registerGbpPostCreate(server);
  registerGbpPostDelete(server);
  registerGbpInsightGet(server);
  registerGbpMediaUpload(server);

  // X Ads（12 tools）
  registerXAdsAccountList(server);
  registerXAdsCampaignList(server);
  registerXAdsCampaignCreate(server);
  registerXAdsCampaignUpdate(server);
  registerXAdsLineitemList(server);
  registerXAdsLineitemCreate(server);
  registerXAdsLineitemUpdate(server);
  registerXAdsCreativeList(server);
  registerXAdsCreativeCreate(server);
  registerXAdsTargetingList(server);
  registerXAdsTargetingCreate(server);
  registerXAdsAnalytics(server);
}
