/**
 * Google Business Profile API の型定義
 */

/** 住所情報 */
export interface PostalAddress {
  regionCode: string;
  languageCode: string;
  postalCode: string;
  administrativeArea: string;
  locality: string;
  addressLines: string[];
}

/** 緯度経度 */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/** 営業時間の期間 */
export interface TimePeriod {
  openDay: string;
  openTime: string;
  closeDay: string;
  closeTime: string;
}

/** 営業時間 */
export interface BusinessHours {
  periods: TimePeriod[];
}

/** 電話番号 */
export interface PhoneNumbers {
  primaryPhone: string;
  additionalPhones?: string[];
}

/** カテゴリ */
export interface Category {
  displayName: string;
  categoryId?: string;
}

/** カテゴリ情報 */
export interface Categories {
  primaryCategory: Category;
  additionalCategories?: Category[];
}

/** GBP ロケーション情報（Business Information API v1） */
export interface GbpLocation {
  name: string;
  languageCode?: string;
  storeCode?: string;
  title: string;
  phoneNumbers?: PhoneNumbers;
  categories?: Categories;
  storefrontAddress?: PostalAddress;
  websiteUri?: string;
  regularHours?: BusinessHours;
  latlng?: LatLng;
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
  profile?: {
    description?: string;
  };
  openInfo?: {
    status?: string;
    canReopen?: boolean;
  };
}

/** ロケーション一覧レスポンス */
export interface LocationListResponse {
  locations: GbpLocation[];
  nextPageToken?: string;
  totalSize?: number;
}

/** レビュー投稿者 */
export interface Reviewer {
  profilePhotoUrl?: string;
  displayName: string;
  isAnonymous?: boolean;
}

/** レビューの返信 */
export interface ReviewReply {
  comment: string;
  updateTime?: string;
}

/** GBP レビュー */
export interface GbpReview {
  name: string;
  reviewId: string;
  reviewer: Reviewer;
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: ReviewReply;
}

/** レビュー一覧レスポンス */
export interface ReviewListResponse {
  reviews: GbpReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

/** レビュー返信リクエスト */
export interface ReviewReplyRequest {
  comment: string;
}

/** ローカル投稿のメディア */
export interface LocalPostMedia {
  mediaFormat: "PHOTO" | "VIDEO";
  sourceUrl: string;
}

/** 行動喚起（CTA） */
export interface CallToAction {
  actionType:
    | "ACTION_TYPE_UNSPECIFIED"
    | "BOOK"
    | "ORDER"
    | "SHOP"
    | "LEARN_MORE"
    | "SIGN_UP"
    | "CALL";
  url?: string;
}

/** イベント情報 */
export interface LocalPostEvent {
  title: string;
  schedule: {
    startDate: DateValue;
    startTime?: TimeOfDay;
    endDate: DateValue;
    endTime?: TimeOfDay;
  };
}

/** 日付 */
export interface DateValue {
  year: number;
  month: number;
  day: number;
}

/** 時刻 */
export interface TimeOfDay {
  hours: number;
  minutes: number;
  seconds?: number;
  nanos?: number;
}

/** オファー情報 */
export interface LocalPostOffer {
  couponCode?: string;
  redeemOnlineUrl?: string;
  termsConditions?: string;
}

/** GBP ローカル投稿 */
export interface GbpPost {
  name: string;
  languageCode?: string;
  summary: string;
  callToAction?: CallToAction;
  media?: LocalPostMedia[];
  state?: "LOCAL_POST_STATE_UNSPECIFIED" | "REJECTED" | "LIVE" | "PROCESSING";
  event?: LocalPostEvent;
  offer?: LocalPostOffer;
  topicType?: "LOCAL_POST_TOPIC_TYPE_UNSPECIFIED" | "STANDARD" | "EVENT" | "OFFER" | "ALERT";
  createTime?: string;
  updateTime?: string;
  searchUrl?: string;
}

/** 投稿一覧レスポンス */
export interface PostListResponse {
  localPosts: GbpPost[];
  nextPageToken?: string;
}

/** 日別メトリクスの値 */
export interface DailyMetricValue {
  date: DateValue;
  value?: string;
}

/** メトリクスのタイムシリーズ */
export interface DailyMetricTimeSeries {
  dailyMetric: string;
  dailySubEntityType?: {
    dayOfWeek?: string;
    timeOfDay?: TimeOfDay;
  };
  timeSeries?: {
    datedValues: DailyMetricValue[];
  };
}

/** パフォーマンスレスポンス */
export interface MultiDailyMetricsTimeSeriesResponse {
  multiDailyMetricTimeSeries: DailyMetricTimeSeries[];
}

/** メディアアイテム */
export interface GbpMedia {
  name: string;
  mediaFormat: "PHOTO" | "VIDEO";
  sourceUrl: string;
  locationAssociation?: {
    category?: "COVER" | "PROFILE" | "LOGO" | "EXTERIOR" | "INTERIOR" | "PRODUCT" | "AT_WORK" | "FOOD_AND_DRINK" | "MENU" | "COMMON_AREA" | "ROOMS" | "TEAMS" | "ADDITIONAL";
  };
  sizeBytes?: string;
  createTime?: string;
  dimensions?: {
    widthPixels: number;
    heightPixels: number;
  };
  thumbnailUrl?: string;
  googleUrl?: string;
}

/** メディア一覧レスポンス */
export interface MediaListResponse {
  mediaItems: GbpMedia[];
  nextPageToken?: string;
  totalMediaItemCount?: number;
}
