/**
 * Meta Ads 型定義
 * Graph API のレスポンス型を定義する
 */

/** Meta API のページネーション用カーソル */
export interface MetaPaging {
  cursors?: {
    before?: string;
    after?: string;
  };
  next?: string;
  previous?: string;
}

/** Meta API のリストレスポンス共通形式 */
export interface MetaListResponse<T> {
  data: T[];
  paging?: MetaPaging;
}

/** Meta API のエラーレスポンス */
export interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

/** キャンペーン */
export interface MetaCampaign {
  id: string;
  name: string;
  status: MetaCampaignStatus;
  objective: string;
  buying_type?: string;
  bid_strategy?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  special_ad_categories?: string[];
  created_time?: string;
  updated_time?: string;
  start_time?: string;
  stop_time?: string;
}

export type MetaCampaignStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export type MetaCampaignObjective =
  | "OUTCOME_AWARENESS"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS"
  | "OUTCOME_SALES"
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_APP_PROMOTION";

/** 広告セット */
export interface MetaAdSet {
  id: string;
  name: string;
  status: MetaAdSetStatus;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  bid_amount?: string;
  bid_strategy?: string;
  billing_event: MetaBillingEvent;
  optimization_goal: MetaOptimizationGoal;
  targeting?: MetaTargeting;
  start_time?: string;
  end_time?: string;
  created_time?: string;
  updated_time?: string;
}

export type MetaAdSetStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

export type MetaBillingEvent = "IMPRESSIONS" | "LINK_CLICKS" | "APP_INSTALLS" | "PAGE_LIKES" | "POST_ENGAGEMENT" | "VIDEO_VIEWS" | "THRUPLAY";

export type MetaOptimizationGoal =
  | "IMPRESSIONS"
  | "REACH"
  | "LINK_CLICKS"
  | "LANDING_PAGE_VIEWS"
  | "CONVERSIONS"
  | "LEAD_GENERATION"
  | "APP_INSTALLS"
  | "VIDEO_VIEWS"
  | "THRUPLAY"
  | "POST_ENGAGEMENT"
  | "PAGE_LIKES"
  | "VALUE";

/** ターゲティング設定 */
export interface MetaTargeting {
  age_min?: number;
  age_max?: number;
  genders?: number[];
  geo_locations?: {
    countries?: string[];
    regions?: Array<{ key: string }>;
    cities?: Array<{ key: string; radius?: number; distance_unit?: string }>;
  };
  interests?: Array<{ id: string; name: string }>;
  behaviors?: Array<{ id: string; name: string }>;
  custom_audiences?: Array<{ id: string }>;
  excluded_custom_audiences?: Array<{ id: string }>;
  publisher_platforms?: string[];
  facebook_positions?: string[];
  instagram_positions?: string[];
  device_platforms?: string[];
}

/** 広告 */
export interface MetaAd {
  id: string;
  name: string;
  status: MetaAdStatus;
  adset_id: string;
  campaign_id?: string;
  creative?: { id: string };
  created_time?: string;
  updated_time?: string;
  tracking_specs?: Array<Record<string, string[]>>;
}

export type MetaAdStatus = "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";

/** 広告レビュー情報 */
export interface MetaAdReview {
  id: string;
  name: string;
  status: MetaAdStatus;
  review_feedback?: Record<string, string>;
  effective_status?: string;
}

/** 広告クリエイティブ */
export interface MetaCreative {
  id: string;
  name?: string;
  title?: string;
  body?: string;
  image_hash?: string;
  image_url?: string;
  video_id?: string;
  link_url?: string;
  call_to_action_type?: string;
  object_story_spec?: MetaObjectStorySpec;
  asset_feed_spec?: Record<string, unknown>;
  created_time?: string;
}

/** ObjectStorySpec */
export interface MetaObjectStorySpec {
  page_id: string;
  link_data?: {
    message?: string;
    link: string;
    caption?: string;
    description?: string;
    image_hash?: string;
    call_to_action?: {
      type: string;
      value?: { link?: string };
    };
  };
  video_data?: {
    video_id: string;
    title?: string;
    message?: string;
    image_hash?: string;
    call_to_action?: {
      type: string;
      value?: { link?: string };
    };
  };
  photo_data?: {
    image_hash: string;
    message?: string;
    caption?: string;
  };
}

/** インサイト */
export interface MetaInsight {
  date_start: string;
  date_stop: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  spend?: string;
  frequency?: string;
  actions?: MetaAction[];
  conversions?: MetaAction[];
  cost_per_action_type?: MetaAction[];
  video_views?: string;
  video_avg_time_watched_actions?: MetaAction[];
}

/** アクション型 */
export interface MetaAction {
  action_type: string;
  value: string;
}

/** 画像アップロード結果 */
export interface MetaImageUploadResult {
  images: Record<string, { hash: string; url: string }>;
}

/** カスタムオーディエンス */
export interface MetaAudience {
  id: string;
  name: string;
  description?: string;
  subtype: string;
  approximate_count_lower_bound?: number;
  approximate_count_upper_bound?: number;
  time_created?: string;
  time_updated?: string;
  delivery_status?: {
    status: string;
  };
  operation_status?: {
    status: string;
  };
}

/** 時間範囲パラメータ */
export interface MetaTimeRange {
  since: string;
  until: string;
}

/** インサイトの日付プリセット */
export type MetaDatePreset =
  | "today"
  | "yesterday"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "maximum"
  | "last_3d"
  | "last_7d"
  | "last_14d"
  | "last_28d"
  | "last_30d"
  | "last_90d"
  | "last_week_mon_sun"
  | "last_week_sun_sat"
  | "last_quarter"
  | "last_year"
  | "this_week_mon_today"
  | "this_week_sun_today"
  | "this_year";
