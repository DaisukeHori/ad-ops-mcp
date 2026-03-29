/**
 * GAQL (Google Ads Query Language) クエリビルダー
 * 各リソースタイプに対応するクエリを生成する
 */

// ── キャンペーン一覧クエリ ──

export interface CampaignListOptions {
  /** キャンペーンステータスでフィルタ（例: "ENABLED", "PAUSED"） */
  status?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildCampaignListQuery(options?: CampaignListOptions): string {
  const fields = [
    "campaign.id",
    "campaign.name",
    "campaign.status",
    "campaign.advertising_channel_type",
    "campaign.bidding_strategy_type",
    "campaign.campaign_budget",
    "campaign.start_date",
    "campaign.end_date",
    "campaign.network_settings.target_google_search",
    "campaign.network_settings.target_search_network",
    "campaign.network_settings.target_content_network",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.conversions",
    "metrics.ctr",
    "metrics.average_cpc",
  ];

  let query = `SELECT ${fields.join(", ")} FROM campaign`;

  const conditions: string[] = [];
  if (options?.status) {
    conditions.push(`campaign.status = '${options.status}'`);
  }
  // REMOVED は通常除外する
  if (!options?.status) {
    conditions.push(`campaign.status != 'REMOVED'`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY campaign.name ASC";

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── キャンペーン詳細クエリ ──

export function buildCampaignGetQuery(campaignId: string): string {
  const fields = [
    "campaign.id",
    "campaign.name",
    "campaign.status",
    "campaign.advertising_channel_type",
    "campaign.bidding_strategy_type",
    "campaign.campaign_budget",
    "campaign.start_date",
    "campaign.end_date",
    "campaign.network_settings.target_google_search",
    "campaign.network_settings.target_search_network",
    "campaign.network_settings.target_content_network",
    "campaign.network_settings.target_partner_search_network",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.conversions",
    "metrics.conversions_value",
    "metrics.ctr",
    "metrics.average_cpc",
    "metrics.average_cpm",
    "metrics.all_conversions",
    "metrics.interaction_rate",
    "metrics.interactions",
  ];

  return `SELECT ${fields.join(", ")} FROM campaign WHERE campaign.id = ${campaignId}`;
}

// ── 広告グループ一覧クエリ ──

export interface AdGroupListOptions {
  /** キャンペーンIDでフィルタ */
  campaignId?: string;
  /** ステータスでフィルタ */
  status?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildAdGroupListQuery(options?: AdGroupListOptions): string {
  const fields = [
    "ad_group.id",
    "ad_group.name",
    "ad_group.status",
    "ad_group.type",
    "ad_group.campaign",
    "ad_group.cpc_bid_micros",
    "campaign.id",
    "campaign.name",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.conversions",
    "metrics.ctr",
    "metrics.average_cpc",
  ];

  let query = `SELECT ${fields.join(", ")} FROM ad_group`;

  const conditions: string[] = [];
  if (options?.campaignId) {
    conditions.push(`campaign.id = ${options.campaignId}`);
  }
  if (options?.status) {
    conditions.push(`ad_group.status = '${options.status}'`);
  }
  if (!options?.status) {
    conditions.push(`ad_group.status != 'REMOVED'`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY ad_group.name ASC";

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── 広告一覧クエリ ──

export interface AdListOptions {
  /** 広告グループIDでフィルタ */
  adGroupId?: string;
  /** ステータスでフィルタ */
  status?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildAdListQuery(options?: AdListOptions): string {
  const fields = [
    "ad_group_ad.ad.id",
    "ad_group_ad.ad.type",
    "ad_group_ad.ad.responsive_search_ad.headlines",
    "ad_group_ad.ad.responsive_search_ad.descriptions",
    "ad_group_ad.ad.responsive_search_ad.path1",
    "ad_group_ad.ad.responsive_search_ad.path2",
    "ad_group_ad.ad.final_urls",
    "ad_group_ad.status",
    "ad_group_ad.ad_group",
    "ad_group.id",
    "ad_group.name",
    "campaign.id",
    "campaign.name",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.ctr",
    "metrics.average_cpc",
  ];

  let query = `SELECT ${fields.join(", ")} FROM ad_group_ad`;

  const conditions: string[] = [];
  if (options?.adGroupId) {
    conditions.push(`ad_group.id = ${options.adGroupId}`);
  }
  if (options?.status) {
    conditions.push(`ad_group_ad.status = '${options.status}'`);
  }
  if (!options?.status) {
    conditions.push(`ad_group_ad.status != 'REMOVED'`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY ad_group_ad.ad.id ASC";

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── 広告ポリシーステータスクエリ ──

export interface AdPolicyStatusOptions {
  /** 広告グループIDでフィルタ */
  adGroupId?: string;
  /** キャンペーンIDでフィルタ */
  campaignId?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildAdPolicyStatusQuery(options?: AdPolicyStatusOptions): string {
  const fields = [
    "ad_group_ad.ad.id",
    "ad_group_ad.ad.type",
    "ad_group_ad.ad.final_urls",
    "ad_group_ad.status",
    "ad_group_ad.policy_summary.approval_status",
    "ad_group_ad.policy_summary.review_status",
    "ad_group_ad.policy_summary.policy_topic_entries",
    "ad_group.id",
    "ad_group.name",
    "campaign.id",
    "campaign.name",
  ];

  let query = `SELECT ${fields.join(", ")} FROM ad_group_ad`;

  const conditions: string[] = [];
  if (options?.adGroupId) {
    conditions.push(`ad_group.id = ${options.adGroupId}`);
  }
  if (options?.campaignId) {
    conditions.push(`campaign.id = ${options.campaignId}`);
  }
  conditions.push(`ad_group_ad.status != 'REMOVED'`);

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── キーワード一覧クエリ ──

export interface KeywordListOptions {
  /** 広告グループIDでフィルタ */
  adGroupId?: string;
  /** キャンペーンIDでフィルタ */
  campaignId?: string;
  /** ステータスでフィルタ */
  status?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildKeywordListQuery(options?: KeywordListOptions): string {
  const fields = [
    "ad_group_criterion.criterion_id",
    "ad_group_criterion.keyword.text",
    "ad_group_criterion.keyword.match_type",
    "ad_group_criterion.status",
    "ad_group_criterion.cpc_bid_micros",
    "ad_group_criterion.quality_info.quality_score",
    "ad_group.id",
    "ad_group.name",
    "campaign.id",
    "campaign.name",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.conversions",
    "metrics.ctr",
    "metrics.average_cpc",
  ];

  let query = `SELECT ${fields.join(", ")} FROM ad_group_criterion`;

  const conditions: string[] = [];
  conditions.push(`ad_group_criterion.type = 'KEYWORD'`);
  if (options?.adGroupId) {
    conditions.push(`ad_group.id = ${options.adGroupId}`);
  }
  if (options?.campaignId) {
    conditions.push(`campaign.id = ${options.campaignId}`);
  }
  if (options?.status) {
    conditions.push(`ad_group_criterion.status = '${options.status}'`);
  }
  if (!options?.status) {
    conditions.push(`ad_group_criterion.status != 'REMOVED'`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY ad_group_criterion.keyword.text ASC";

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── 予算一覧クエリ ──

export interface BudgetListOptions {
  /** 結果の上限数 */
  limit?: number;
}

export function buildBudgetListQuery(options?: BudgetListOptions): string {
  const fields = [
    "campaign_budget.id",
    "campaign_budget.name",
    "campaign_budget.amount_micros",
    "campaign_budget.delivery_method",
    "campaign_budget.period",
    "campaign_budget.total_amount_micros",
    "campaign_budget.status",
    "campaign_budget.explicitly_shared",
  ];

  let query = `SELECT ${fields.join(", ")} FROM campaign_budget`;
  query += ` WHERE campaign_budget.status != 'REMOVED'`;
  query += " ORDER BY campaign_budget.name ASC";

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── キャンペーンレポートクエリ ──

export interface CampaignReportOptions {
  /** 開始日 (YYYY-MM-DD) */
  startDate: string;
  /** 終了日 (YYYY-MM-DD) */
  endDate: string;
  /** キャンペーンIDでフィルタ */
  campaignId?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildCampaignReportQuery(options: CampaignReportOptions): string {
  const fields = [
    "campaign.id",
    "campaign.name",
    "campaign.status",
    "segments.date",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.conversions",
    "metrics.conversions_value",
    "metrics.ctr",
    "metrics.average_cpc",
    "metrics.average_cpm",
    "metrics.all_conversions",
    "metrics.interactions",
    "metrics.interaction_rate",
  ];

  let query = `SELECT ${fields.join(", ")} FROM campaign`;

  const conditions: string[] = [];
  conditions.push(`segments.date BETWEEN '${options.startDate}' AND '${options.endDate}'`);

  if (options.campaignId) {
    conditions.push(`campaign.id = ${options.campaignId}`);
  }
  conditions.push(`campaign.status != 'REMOVED'`);

  query += ` WHERE ${conditions.join(" AND ")}`;
  query += " ORDER BY segments.date DESC";

  if (options.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}

// ── キーワードレポートクエリ ──

export interface KeywordReportOptions {
  /** 開始日 (YYYY-MM-DD) */
  startDate: string;
  /** 終了日 (YYYY-MM-DD) */
  endDate: string;
  /** 広告グループIDでフィルタ */
  adGroupId?: string;
  /** キャンペーンIDでフィルタ */
  campaignId?: string;
  /** 結果の上限数 */
  limit?: number;
}

export function buildKeywordReportQuery(options: KeywordReportOptions): string {
  const fields = [
    "ad_group_criterion.criterion_id",
    "ad_group_criterion.keyword.text",
    "ad_group_criterion.keyword.match_type",
    "ad_group_criterion.status",
    "ad_group.id",
    "ad_group.name",
    "campaign.id",
    "campaign.name",
    "segments.date",
    "metrics.impressions",
    "metrics.clicks",
    "metrics.cost_micros",
    "metrics.conversions",
    "metrics.conversions_value",
    "metrics.ctr",
    "metrics.average_cpc",
    "metrics.all_conversions",
  ];

  let query = `SELECT ${fields.join(", ")} FROM ad_group_criterion`;

  const conditions: string[] = [];
  conditions.push(`ad_group_criterion.type = 'KEYWORD'`);
  conditions.push(`segments.date BETWEEN '${options.startDate}' AND '${options.endDate}'`);

  if (options.adGroupId) {
    conditions.push(`ad_group.id = ${options.adGroupId}`);
  }
  if (options.campaignId) {
    conditions.push(`campaign.id = ${options.campaignId}`);
  }
  conditions.push(`ad_group_criterion.status != 'REMOVED'`);

  query += ` WHERE ${conditions.join(" AND ")}`;
  query += " ORDER BY segments.date DESC, metrics.impressions DESC";

  if (options.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  return query;
}
