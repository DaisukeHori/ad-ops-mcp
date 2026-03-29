/**
 * Google Ads API 型定義
 * REST API v23 のレスポンス構造に対応する TypeScript インターフェース
 */

// ── キャンペーン ──

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED";
export type AdvertisingChannelType = "SEARCH" | "DISPLAY" | "SHOPPING" | "VIDEO" | "MULTI_CHANNEL" | "PERFORMANCE_MAX" | "LOCAL" | "SMART" | "DEMAND_GEN";
export type BiddingStrategyType =
  | "MANUAL_CPC"
  | "MANUAL_CPM"
  | "TARGET_CPA"
  | "TARGET_ROAS"
  | "MAXIMIZE_CONVERSIONS"
  | "MAXIMIZE_CONVERSION_VALUE"
  | "TARGET_SPEND"
  | "TARGET_IMPRESSION_SHARE";

export interface Campaign {
  resourceName: string;
  id: string;
  name: string;
  status: CampaignStatus;
  advertisingChannelType: AdvertisingChannelType;
  biddingStrategyType: BiddingStrategyType;
  campaignBudget: string;
  startDate: string;
  endDate: string;
  networkSettings?: NetworkSettings;
  manualCpc?: ManualCpc;
  targetCpa?: TargetCpa;
  targetRoas?: TargetRoas;
  maximizeConversions?: MaximizeConversions;
  maximizeConversionValue?: MaximizeConversionValue;
}

export interface NetworkSettings {
  targetGoogleSearch: boolean;
  targetSearchNetwork: boolean;
  targetContentNetwork: boolean;
  targetPartnerSearchNetwork: boolean;
}

export interface ManualCpc {
  enhancedCpcEnabled: boolean;
}

export interface TargetCpa {
  targetCpaMicros: string;
}

export interface TargetRoas {
  targetRoas: number;
}

export interface MaximizeConversions {
  targetCpaMicros: string;
}

export interface MaximizeConversionValue {
  targetRoas: number;
}

// ── 広告グループ ──

export type AdGroupStatus = "ENABLED" | "PAUSED" | "REMOVED";
export type AdGroupType = "SEARCH_STANDARD" | "DISPLAY_STANDARD" | "SHOPPING_PRODUCT_ADS" | "VIDEO_TRUE_VIEW_IN_STREAM" | "VIDEO_BUMPER" | "SMART_CAMPAIGN_ADS";

export interface AdGroup {
  resourceName: string;
  id: string;
  name: string;
  status: AdGroupStatus;
  type: AdGroupType;
  campaign: string;
  cpcBidMicros: string;
  cpmBidMicros: string;
}

// ── 広告 ──

export type AdStatus = "ENABLED" | "PAUSED" | "REMOVED";
export type AdType = "RESPONSIVE_SEARCH_AD" | "EXPANDED_TEXT_AD" | "RESPONSIVE_DISPLAY_AD" | "IMAGE_AD" | "VIDEO_AD" | "APP_AD";

export interface Ad {
  resourceName: string;
  id: string;
  type: AdType;
  responsiveSearchAd?: ResponsiveSearchAd;
  finalUrls: string[];
  finalMobileUrls: string[];
}

export interface AdGroupAd {
  resourceName: string;
  ad: Ad;
  status: AdStatus;
  adGroup: string;
  policySummary?: PolicySummary;
}

export interface ResponsiveSearchAd {
  headlines: AdTextAsset[];
  descriptions: AdTextAsset[];
  path1: string;
  path2: string;
}

export interface AdTextAsset {
  text: string;
  pinnedField?: "HEADLINE_1" | "HEADLINE_2" | "HEADLINE_3" | "DESCRIPTION_1" | "DESCRIPTION_2";
}

// ── ポリシー ──

export type PolicyApprovalStatus = "APPROVED" | "APPROVED_LIMITED" | "AREA_OF_INTEREST_ONLY" | "DISAPPROVED" | "UNKNOWN";
export type PolicyReviewStatus = "REVIEW_IN_PROGRESS" | "REVIEWED" | "UNDER_APPEAL" | "ELIGIBLE_MAY_SERVE";

export interface PolicySummary {
  policyTopicEntries: PolicyTopicEntry[];
  reviewStatus: PolicyReviewStatus;
  approvalStatus: PolicyApprovalStatus;
}

export interface PolicyTopicEntry {
  topic: string;
  type: "PROHIBITED" | "LIMITED" | "FULLY_LIMITED" | "DESCRIPTIVE" | "BROADENING" | "AREA_OF_INTEREST_ONLY";
}

// ── キーワード ──

export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD";
export type CriterionStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface AdGroupCriterion {
  resourceName: string;
  criterionId: string;
  adGroup: string;
  status: CriterionStatus;
  keyword: KeywordInfo;
  cpcBidMicros: string;
  qualityInfo?: QualityInfo;
}

export interface KeywordInfo {
  text: string;
  matchType: KeywordMatchType;
}

export interface QualityInfo {
  qualityScore: number;
  creativQualityScore: string;
  postClickQualityScore: string;
  searchPredictedCtr: string;
}

// ── 予算 ──

export type BudgetDeliveryMethod = "STANDARD" | "ACCELERATED";
export type BudgetPeriod = "DAILY" | "CUSTOM_PERIOD";

export interface CampaignBudget {
  resourceName: string;
  id: string;
  name: string;
  amountMicros: string;
  deliveryMethod: BudgetDeliveryMethod;
  period: BudgetPeriod;
  totalAmountMicros: string;
  status: "ENABLED" | "REMOVED";
  explicitlyShared: boolean;
}

// ── メトリクス ──

export interface Metrics {
  impressions: string;
  clicks: string;
  costMicros: string;
  conversions: number;
  conversionsValue: number;
  ctr: number;
  averageCpc: string;
  averageCpm: string;
  allConversions: number;
  allConversionsValue: number;
  interactionRate: number;
  interactions: string;
  viewThroughConversions: string;
}

// ── アカウント ──

export interface CustomerClient {
  resourceName: string;
  clientCustomer: string;
  level: string;
  hidden: boolean;
  id: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
  testAccount: boolean;
}

export interface AccessibleCustomer {
  resourceNames: string[];
}

// ── セグメント ──

export interface Segments {
  date: string;
  device: string;
  adNetworkType: string;
}

// ── searchStream レスポンス ──

export interface SearchStreamResponse {
  results: GoogleAdsRow[];
  fieldMask: string;
  requestId: string;
}

export interface GoogleAdsRow {
  campaign?: Campaign;
  adGroup?: AdGroup;
  adGroupAd?: AdGroupAd;
  adGroupCriterion?: AdGroupCriterion;
  campaignBudget?: CampaignBudget;
  customerClient?: CustomerClient;
  metrics?: Metrics;
  segments?: Segments;
}

// ── mutate レスポンス ──

export interface MutateResponse {
  results: MutateResult[];
  partialFailureError?: PartialFailureError;
}

export interface MutateResult {
  resourceName: string;
}

export interface PartialFailureError {
  code: number;
  message: string;
  details: unknown[];
}

// ── mutate オペレーション ──

export interface MutateOperation {
  create?: Record<string, unknown>;
  update?: Record<string, unknown>;
  remove?: string;
  updateMask?: string;
}
