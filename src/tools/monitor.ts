import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { httpUrl, nonEmptyString, pageNumber, pageSize, sortDirection } from "../validation.js";

// --- Search & Create ---

export const searchFbAdvertisersSchema = z.object({
  name: nonEmptyString.describe("Advertiser name to search"),
});

export async function searchFbAdvertisers(params: z.infer<typeof searchFbAdvertisersSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/search-fb-ads-advertiser", params);
  return JSON.stringify(result.data, null, 2);
}

export const createMonitorTaskSchema = z.object({
  facebook_page_id_list: z.array(nonEmptyString).min(1).max(50).optional().describe("Facebook page IDs from search_fb_advertisers. Supply exactly one input list; max 50 targets."),
  facebook_page_url_list: z.array(httpUrl).min(1).max(50).optional().describe("Facebook page URLs. Supply exactly one input list; max 50 targets."),
  facebook_public_page_number_list: z.array(nonEmptyString).min(1).max(50).optional().describe("Facebook public page numbers. Supply exactly one input list; max 50 targets."),
  facebook_shop_url_list: z.array(httpUrl).min(1).max(50).optional().describe("Store, website or landing-page URLs for Facebook ad monitoring. Max 50 targets."),
  advertiser_id: nonEmptyString.optional().describe("Deprecated single-page alias, converted to facebook_page_id_list. Do not combine with an input list."),
});

export async function createMonitorTask(params: z.infer<typeof createMonitorTaskSchema>): Promise<string> {
  const { advertiser_id, ...lists } = params;
  if (Object.values(params).filter(value => value !== undefined).length !== 1) {
    throw new Error("Provide exactly one Facebook target list (or the legacy advertiser_id)");
  }
  const payload = advertiser_id ? { facebook_page_id_list: [advertiser_id] } : lists;
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/create-monitor-task", payload);
  return JSON.stringify(result.data, null, 2);
}

// --- Task Management ---

export const listMonitorTasksSchema = z.object({
  keyword: z.string().optional().describe("Search keyword"),
  monitor_task_type: z.union([z.literal(1), z.literal(2)]).optional().describe("Task type: 1=Facebook advertiser, 2=Store/website"),
  country: z.string().optional().describe("Country filter"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function listMonitorTasks(params: z.infer<typeof listMonitorTasksSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorTaskDetailSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
});

export async function getMonitorTaskDetail(params: z.infer<typeof getMonitorTaskDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/monitor-task-details", params);
  return JSON.stringify(result.data, null, 2);
}

export const cancelMonitorTaskSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID to cancel"),
});

export async function cancelMonitorTask(params: z.infer<typeof cancelMonitorTaskSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/cancel", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorBoardSchema = z.object({});

export async function getMonitorBoard(params: z.infer<typeof getMonitorBoardSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/board", params);
  return JSON.stringify(result.data, null, 2);
}

export const setMonitorTaskGroupSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  group_id: nonEmptyString.optional().describe("Group ID to assign (omit to unset)"),
});

export async function setMonitorTaskGroup(params: z.infer<typeof setMonitorTaskGroupSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/set-group", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Task Overview & Analytics ---

export const getMonitorRealtimeOverviewSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
});

export async function getMonitorRealtimeOverview(params: z.infer<typeof getMonitorRealtimeOverviewSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/real-time-overview", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorDailyOverviewSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  date: z.number().int().nonnegative().describe("Query date as a Unix timestamp in seconds"),
});

export async function getMonitorDailyOverview(params: z.infer<typeof getMonitorDailyOverviewSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-daily-overview", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorLandingPagesOverviewSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function getMonitorLandingPagesOverview(params: z.infer<typeof getMonitorLandingPagesOverviewSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/landing-pages-overview", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorLatestProductsSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  limit: pageSize.optional().describe("Number of results"),
});

export async function getMonitorLatestProducts(params: z.infer<typeof getMonitorLatestProductsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/latest-products", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Task Product & Landing Page Lists ---

export const getMonitorProductListSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  keyword: z.string().optional().describe("Search keyword"),
  first_ad_date_start: z.number().finite().nonnegative().optional().describe("First ad date start"),
  first_ad_date_end: z.number().finite().nonnegative().optional().describe("First ad date end"),
  recent_ad_date_start: z.number().finite().nonnegative().optional().describe("Recent ad date start"),
  recent_ad_date_end: z.number().finite().nonnegative().optional().describe("Recent ad date end"),
  min_active_ad_count: z.number().finite().nonnegative().optional().describe("Minimum active ad count"),
  max_active_ad_count: z.number().finite().nonnegative().optional().describe("Maximum active ad count"),
  min_ad_count: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  max_ad_count: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  min_ad_days: z.number().finite().nonnegative().optional().describe("Minimum ad days"),
  max_ad_days: z.number().finite().nonnegative().optional().describe("Maximum ad days"),
  min_price: z.number().finite().nonnegative().optional().describe("Minimum price"),
  max_price: z.number().finite().nonnegative().optional().describe("Maximum price"),
  min_material_count: z.number().finite().nonnegative().optional().describe("Minimum material count"),
  max_material_count: z.number().finite().nonnegative().optional().describe("Maximum material count"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function getMonitorProductList(params: z.infer<typeof getMonitorProductListSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/product-list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorLandingPageListSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  keyword: z.string().optional().describe("Search keyword"),
  first_ad_date_start: z.number().finite().nonnegative().optional().describe("First ad date start"),
  first_ad_date_end: z.number().finite().nonnegative().optional().describe("First ad date end"),
  recent_ad_date_start: z.number().finite().nonnegative().optional().describe("Recent ad date start"),
  recent_ad_date_end: z.number().finite().nonnegative().optional().describe("Recent ad date end"),
  min_active_ad_count: z.number().finite().nonnegative().optional().describe("Minimum active ad count"),
  max_active_ad_count: z.number().finite().nonnegative().optional().describe("Maximum active ad count"),
  min_ad_count: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  max_ad_count: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  min_ad_days: z.number().finite().nonnegative().optional().describe("Minimum ad days"),
  max_ad_days: z.number().finite().nonnegative().optional().describe("Maximum ad days"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function getMonitorLandingPageList(params: z.infer<typeof getMonitorLandingPageListSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/landing-page-list", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Task Ad Analytics ---

export const getMonitorAdCountStatsSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  date_start: z.number().finite().nonnegative().optional().describe("Date start"),
  date_end: z.number().finite().nonnegative().optional().describe("Date end"),
});

export async function getMonitorAdCountStats(params: z.infer<typeof getMonitorAdCountStatsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-count-statistics", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorDeepAnalysisSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  dimension: z.union([z.literal(1), z.literal(2)]).describe("Analysis dimension: 1=By day, 2=By time slot"),
});

export async function getMonitorDeepAnalysis(params: z.infer<typeof getMonitorDeepAnalysisSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-deep-analysis", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorMostUsedCopySchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function getMonitorMostUsedCopy(params: z.infer<typeof getMonitorMostUsedCopySchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-copy-most-used", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorLongestRunCopySchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function getMonitorLongestRunCopy(params: z.infer<typeof getMonitorLongestRunCopySchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-copy-longest-run", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Task Ad List & Detail ---

export const getMonitorAdListSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  keyword: z.string().optional().describe("Search keyword"),
  ad_started_at_start: z.number().finite().nonnegative().optional().describe("Ad start time start"),
  ad_started_at_end: z.number().finite().nonnegative().optional().describe("Ad start time end"),
  ad_ended_at_start: z.number().finite().nonnegative().optional().describe("Ad end time start"),
  ad_ended_at_end: z.number().finite().nonnegative().optional().describe("Ad end time end"),
  ad_forecast_list: z.array(z.number()).optional().describe("Ad forecast filter"),
  adset_count_start: z.number().finite().nonnegative().optional().describe("Minimum adset count"),
  adset_count_end: z.number().finite().nonnegative().optional().describe("Maximum adset count"),
  active_days_start: z.number().finite().nonnegative().optional().describe("Minimum active days"),
  active_days_end: z.number().finite().nonnegative().optional().describe("Maximum active days"),
  ad_audience_reach_start: z.number().finite().nonnegative().optional().describe("Minimum audience reach"),
  ad_audience_reach_end: z.number().finite().nonnegative().optional().describe("Maximum audience reach"),
  ad_cost_start: z.number().finite().nonnegative().optional().describe("Minimum ad cost"),
  ad_cost_end: z.number().finite().nonnegative().optional().describe("Maximum ad cost"),
  media_format_list: z.array(z.number()).optional().describe("Media format filter"),
  video_duration_start: z.number().finite().nonnegative().optional().describe("Minimum video duration"),
  video_duration_end: z.number().finite().nonnegative().optional().describe("Maximum video duration"),
  button_text_list: z.array(z.string()).optional().describe("CTA button text filter"),
  ad_platform_list: z.array(z.string()).optional().describe("Ad platform filter"),
  ad_status_list: z.array(z.number()).optional().describe("Ad status filter"),
  product_price_usd_start: z.number().finite().nonnegative().optional().describe("Minimum product price (USD)"),
  product_price_usd_end: z.number().finite().nonnegative().optional().describe("Maximum product price (USD)"),
  landing_page: z.string().optional().describe("Landing page URL filter"),
  ad_content: z.string().optional().describe("Ad content keyword"),
  related_product_id_list: z.array(z.string()).optional().describe("Related product IDs"),
  order_by: z.string().optional().describe("Sort field"),
  page: pageNumber.optional().describe("Page number"),
  per_page: pageSize.optional().describe("Results per page"),
});

export async function getMonitorAdList(params: z.infer<typeof getMonitorAdListSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-library-list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorAdDetailSchema = z.object({
  ad_id: nonEmptyString.describe("Ad ID"),
});

export async function getMonitorAdDetail(params: z.infer<typeof getMonitorAdDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-details", params);
  return JSON.stringify(result.data, null, 2);
}

export const getMonitorProductStatsSchema = z.object({
  task_id: nonEmptyString.describe("Monitor task ID"),
  date_start: z.number().finite().nonnegative().optional().describe("Date start"),
  date_end: z.number().finite().nonnegative().optional().describe("Date end"),
});

export async function getMonitorProductStats(params: z.infer<typeof getMonitorProductStatsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/ad-monitor-task/ad-products-statistics", params);
  return JSON.stringify(result.data, null, 2);
}
