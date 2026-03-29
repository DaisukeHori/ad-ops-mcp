/**
 * X (Twitter) Ads API 型定義
 * X Ads API v12 のレスポンス構造に対応する TypeScript インターフェース
 */

// ── エンティティステータス ──

export type XAdsEntityStatus = "ACTIVE" | "PAUSED" | "DRAFT";

// ── アカウント ──

export interface XAdsAccount {
  id: string;
  name: string;
  business_name: string;
  timezone: string;
  timezone_switch_at: string;
  country_code: string;
  currency: string;
  created_at: string;
  updated_at: string;
  approval_status: "ACCEPTED" | "PENDING" | "REJECTED" | "CANCELLED" | "UNDER_REVIEW";
  deleted: boolean;
  salt: string;
  industry_type: string;
}

// ── ファンディングインストルメント ──

export interface XAdsFundingInstrument {
  id: string;
  account_id: string;
  type: "CREDIT_CARD" | "INSERTION_ORDER" | "CREDIT_LINE";
  currency: string;
  description: string;
  funded_amount_local_micro: number;
  credit_limit_local_micro: number;
  credit_remaining_local_micro: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
  able_to_fund: boolean;
  entity_status: XAdsEntityStatus;
}

// ── キャンペーン ──

export interface XAdsCampaign {
  id: string;
  account_id: string;
  name: string;
  funding_instrument_id: string;
  start_time: string;
  end_time: string | null;
  entity_status: XAdsEntityStatus;
  currency: string;
  daily_budget_amount_local_micro: number;
  total_budget_amount_local_micro: number | null;
  reasons_not_servable: string[];
  servable: boolean;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

// ── ラインアイテム ──

export type XAdsObjective =
  | "APP_ENGAGEMENTS"
  | "APP_INSTALLS"
  | "AWARENESS"
  | "ENGAGEMENTS"
  | "FOLLOWERS"
  | "REACH"
  | "VIDEO_VIEWS"
  | "WEBSITE_CLICKS"
  | "WEBSITE_CONVERSIONS"
  | "PREROLL_VIEWS";

export type XAdsPlacement =
  | "ALL_ON_TWITTER"
  | "PUBLISHER_NETWORK"
  | "TAP_BANNER"
  | "TAP_FULL"
  | "TAP_FULL_LANDSCAPE"
  | "TAP_NATIVE"
  | "TWITTER_PROFILE"
  | "TWITTER_SEARCH"
  | "TWITTER_TIMELINE";

export type XAdsBidStrategy =
  | "AUTO"
  | "MAX"
  | "TARGET";

export interface XAdsLineItem {
  id: string;
  account_id: string;
  campaign_id: string;
  name: string;
  bid_amount_local_micro: number | null;
  bid_strategy: XAdsBidStrategy;
  placements: XAdsPlacement[];
  objective: XAdsObjective;
  entity_status: XAdsEntityStatus;
  optimization: string;
  product_type: string;
  currency: string;
  total_budget_amount_local_micro: number | null;
  start_time: string;
  end_time: string | null;
  target_cpa_local_micro: number | null;
  automatically_select_bid: boolean;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

// ── プロモツイート（クリエイティブ） ──

export interface XAdsPromotedTweet {
  id: string;
  account_id: string;
  line_item_id: string;
  tweet_id: string;
  entity_status: XAdsEntityStatus;
  approval_status: "ACCEPTED" | "PENDING" | "REJECTED";
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

// ── ターゲティング条件 ──

export type XAdsTargetingType =
  | "AGE"
  | "BEHAVIOR"
  | "BROAD_KEYWORD"
  | "CONVERSATION"
  | "DEVICE"
  | "EVENT"
  | "FOLLOWER_LOOK_ALIKES"
  | "GENDER"
  | "INTEREST"
  | "KEYWORD"
  | "LANGUAGE"
  | "LOCATION"
  | "NETWORK_OPERATOR"
  | "PHRASE_KEYWORD"
  | "PLATFORM"
  | "PLATFORM_VERSION"
  | "SIMILAR_TO_FOLLOWERS_OF_USER"
  | "TV_SHOW"
  | "UNORDERED_KEYWORD"
  | "WIFI_ONLY";

export interface XAdsTargetingCriterion {
  id: string;
  account_id: string;
  line_item_id: string;
  targeting_type: XAdsTargetingType;
  targeting_value: string;
  name: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

// ── アナリティクス ──

export type XAdsGranularity = "HOUR" | "DAY" | "TOTAL";

export type XAdsMetricGroup =
  | "BILLING"
  | "ENGAGEMENT"
  | "LIFE_TIME_VALUE_MOBILE_CONVERSION"
  | "MEDIA"
  | "MOBILE_CONVERSION"
  | "VIDEO"
  | "WEB_CONVERSION";

export interface XAdsAnalyticsData {
  id: string;
  id_data: XAdsAnalyticsMetrics[];
}

export interface XAdsAnalyticsMetrics {
  date: string;
  metrics: {
    impressions: number[] | null;
    engagements: number[] | null;
    clicks: number[] | null;
    retweets: number[] | null;
    replies: number[] | null;
    likes: number[] | null;
    follows: number[] | null;
    url_clicks: number[] | null;
    billed_charge_local_micro: number[] | null;
    billed_engagements: number[] | null;
    video_total_views: number[] | null;
    video_views_25: number[] | null;
    video_views_50: number[] | null;
    video_views_75: number[] | null;
    video_views_100: number[] | null;
    video_cta_clicks: number[] | null;
    video_content_starts: number[] | null;
    video_mrc_views: number[] | null;
    media_views: number[] | null;
    media_engagements: number[] | null;
    conversion_purchases: Record<string, number[]> | null;
    conversion_sign_ups: Record<string, number[]> | null;
    conversion_site_visits: Record<string, number[]> | null;
    conversion_custom: Record<string, number[]> | null;
    app_clicks: number[] | null;
    card_engagements: number[] | null;
    qualified_impressions: number[] | null;
  };
  segment?: Record<string, string>;
}

// ── API レスポンス共通 ──

export interface XAdsApiListResponse<T> {
  data: T[];
  data_type: string;
  total_count: number;
  next_cursor: string | null;
  request: {
    params: Record<string, unknown>;
  };
}

export interface XAdsApiSingleResponse<T> {
  data: T;
  data_type: string;
  request: {
    params: Record<string, unknown>;
  };
}

// ── アナリティクスレスポンス ──

export interface XAdsStatsResponse {
  data: XAdsAnalyticsData[];
  data_type: string;
  time_series_length: number;
  request: {
    params: Record<string, unknown>;
  };
}
