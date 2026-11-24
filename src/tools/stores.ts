import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString, pageNumber, pageSize, sortDirection } from "../validation.js";

// --- Advertiser ---

export const searchAdvertisersSchema = z.object({
  data_type: z.number().int().min(0).max(3).describe("Platform: 0=All, 1=TikTok, 2=Facebook, 3=Meta Library"),
  time: z.number().describe("Time range: 3=All, 4=Yesterday, 0=7d, 1=30d, 2=90d"),
  sort: z.number().describe("Sort: 0=Ad count, 1=Plays, 2=Likes, 4=Days, 6=Cost USD, 7=Start date, 8=End date, 10=Monthly visits, 13=Est orders, 14=Ad count"),
  sort_type: sortDirection.describe('"desc" or "asc"'),
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  ad_type: z.number().optional().describe("Ad type filter"),
  keyword: z.string().optional().describe("Search keyword (shop name or URL)"),
  search_type: z.number().optional().describe("Search type: 1=Keyword, 5=Shop name, 4=Shop URL"),
  start_time_start: z.number().finite().nonnegative().optional().describe("Ad start date range start (unix timestamp)"),
  start_time_end: z.number().finite().nonnegative().optional().describe("Ad start date range end"),
  end_time_start: z.number().finite().nonnegative().optional().describe("Ad end date range start"),
  end_time_end: z.number().finite().nonnegative().optional().describe("Ad end date range end"),
  goods_source_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  goods_source_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  cpm_min: z.number().finite().nonnegative().optional().describe("Minimum CPM"),
  cpm_max: z.number().finite().nonnegative().optional().describe("Maximum CPM"),
  cpa_min: z.number().finite().nonnegative().optional().describe("Minimum CPA"),
  cpa_max: z.number().finite().nonnegative().optional().describe("Maximum CPA"),
  ad_state: z.number().optional().describe("Ad state: 1=Active, 0=Stopped"),
  shop_type: z.array(z.string()).optional().describe('E-commerce platform filter'),
  region: z.array(z.string()).optional().describe('Country/region codes'),
  ad_language: z.array(z.string()).optional().describe("Ad language filter"),
  product_category_id: z.array(z.string()).optional().describe("Product category IDs"),
  product_count_min: z.number().finite().nonnegative().optional().describe("Minimum product count"),
  product_count_max: z.number().finite().nonnegative().optional().describe("Maximum product count"),
  page_count_min: z.number().finite().nonnegative().optional().describe("Minimum page count"),
  page_count_max: z.number().finite().nonnegative().optional().describe("Maximum page count"),
  website_monthly_visits_min: z.number().finite().nonnegative().optional().describe("Minimum monthly website visits"),
  website_monthly_visits_max: z.number().finite().nonnegative().optional().describe("Maximum monthly website visits"),
  reach_min: z.number().finite().nonnegative().optional().describe("Minimum Meta Library reach"),
  reach_max: z.number().finite().nonnegative().optional().describe("Maximum Meta Library reach"),
  facebook_library_ad_platform: z.array(z.string()).optional().describe('Platform filter: "FACEBOOK","INSTAGRAM" etc.'),
});

export async function searchAdvertisers(params: z.infer<typeof searchAdvertisersSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/top-advertiser/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getAdvertiserDetailSchema = z.object({
  id: nonEmptyString.describe("Advertiser unique identifier ID"),
});

export async function getAdvertiserDetail(params: z.infer<typeof getAdvertiserDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/top-advertiser/detail", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Store Search ---

export const searchStoresSchema = z.object({
  data_type: z.number().int().min(0).max(3).describe("Platform: 0=All, 1=TikTok, 2=Facebook, 3=Meta Library"),
  time: z.number().describe("Time range: 3=All, 4=Yesterday, 0=7d, 1=30d, 2=90d"),
  sort: z.number().describe("Sort field"),
  sort_type: sortDirection.describe('"desc" or "asc"'),
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  keyword: z.string().optional().describe("Search keyword"),
  search_type: z.number().optional().describe("Search type"),
  start_time_start: z.number().finite().nonnegative().optional().describe("Ad start date range start"),
  start_time_end: z.number().finite().nonnegative().optional().describe("Ad start date range end"),
  end_time_start: z.number().finite().nonnegative().optional().describe("Ad end date range start"),
  end_time_end: z.number().finite().nonnegative().optional().describe("Ad end date range end"),
  goods_source_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  goods_source_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  cpm_min: z.number().finite().nonnegative().optional().describe("Minimum CPM"),
  cpm_max: z.number().finite().nonnegative().optional().describe("Maximum CPM"),
  cpa_min: z.number().finite().nonnegative().optional().describe("Minimum CPA"),
  cpa_max: z.number().finite().nonnegative().optional().describe("Maximum CPA"),
  ad_state: z.number().optional().describe("Ad state: 1=Active, 0=Stopped"),
  shop_type: z.array(z.string()).optional().describe("E-commerce platform filter"),
  store_countries: z.array(z.string()).optional().describe("Store country filter"),
  store_languages: z.array(z.string()).optional().describe("Store language filter"),
  product_category_id: z.array(z.string()).optional().describe("Product category IDs"),
  product_count_min: z.number().finite().nonnegative().optional().describe("Minimum product count"),
  product_count_max: z.number().finite().nonnegative().optional().describe("Maximum product count"),
  page_count_min: z.number().finite().nonnegative().optional().describe("Minimum page count"),
  page_count_max: z.number().finite().nonnegative().optional().describe("Maximum page count"),
  website_monthly_visits_min: z.number().finite().nonnegative().optional().describe("Minimum monthly visits"),
  website_monthly_visits_max: z.number().finite().nonnegative().optional().describe("Maximum monthly visits"),
  reach_min: z.number().finite().nonnegative().optional().describe("Minimum Meta reach"),
  reach_max: z.number().finite().nonnegative().optional().describe("Maximum Meta reach"),
  facebook_library_ad_platform: z.array(z.string()).optional().describe("Meta ad platform filter"),
});

export async function searchStores(params: z.infer<typeof searchStoresSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/store/list", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Store Detail ---

export const getStoreDetailSchema = z.object({
  id: nonEmptyString.describe("Store ID (13-char string, e.g. c2d5b2547218a)"),
});

export async function getStoreDetail(params: z.infer<typeof getStoreDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/detail", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Store Analysis Tools ---

export const getStoreCompetitionSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
});

export async function getStoreCompetition(params: z.infer<typeof getStoreCompetitionSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/detail/competition/products", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreDataAnalysisSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  start_time: z.number().finite().nonnegative().optional().describe("Start time (unix timestamp)"),
  end_time: z.number().finite().nonnegative().optional().describe("End time (unix timestamp)"),
});

export async function getStoreDataAnalysis(params: z.infer<typeof getStoreDataAnalysisSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/allPlatform/dataAnalysis", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStorePlayCostSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  type: z.number().optional().describe("Data type"),
  time_start: z.number().finite().nonnegative().optional().describe("Start time (unix timestamp)"),
  time_end: z.number().finite().nonnegative().optional().describe("End time (unix timestamp)"),
  current_page: pageNumber.optional().describe("Page number"),
  page_size: pageSize.optional().describe("Results per page"),
});

export async function getStorePlayCost(params: z.infer<typeof getStorePlayCostSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/play-cost/detail", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreRegionAnalysisSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
});

export async function getStoreRegionAnalysis(params: z.infer<typeof getStoreRegionAnalysisSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/storeRegionAnalysis", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreAdCopyAnalysisSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  current_page: pageNumber.optional().describe("Page number"),
  page_size: pageSize.optional().describe("Results per page"),
  sort_key: z.string().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
});

export async function getStoreAdCopyAnalysis(params: z.infer<typeof getStoreAdCopyAnalysisSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/tiktok/ad-copy-analysis", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreAdScheduleSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  type: z.number().optional().describe("Data type"),
  time_start: z.number().finite().nonnegative().optional().describe("Start time (unix timestamp)"),
  time_end: z.number().finite().nonnegative().optional().describe("End time (unix timestamp)"),
});

export async function getStoreAdSchedule(params: z.infer<typeof getStoreAdScheduleSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/detail/ad-schedule", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreProductAnalysisSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  start_time: z.number().finite().nonnegative().optional().describe("Start time (unix timestamp)"),
  end_time: z.number().finite().nonnegative().optional().describe("End time (unix timestamp)"),
});

export async function getStoreProductAnalysis(params: z.infer<typeof getStoreProductAnalysisSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/product-analysis", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreRankDataSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
});

export async function getStoreRankData(params: z.infer<typeof getStoreRankDataSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/store/rank-data", params);
  return JSON.stringify(result.data, null, 2);
}

// --- Store Meta Ad Library Analysis ---

export const getStoreAdTrendSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  start_time: z.number().finite().nonnegative().describe("Start time (unix timestamp)"),
  end_time: z.number().finite().nonnegative().describe("End time (unix timestamp)"),
});

export async function getStoreAdTrend(params: z.infer<typeof getStoreAdTrendSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/pp-stores/analysis/ad-trend", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreDeliveryAnalysisSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
});

export async function getStoreDeliveryAnalysis(params: z.infer<typeof getStoreDeliveryAnalysisSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/pp-stores/analysis/delivery", params);
  return JSON.stringify(result.data, null, 2);
}

const storeAdContentPaginationSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  page_size: pageSize.optional().describe("Results per page"),
  current_page: pageNumber.optional().describe("Page number"),
});

export const getStoreLongestRunAdsSchema = storeAdContentPaginationSchema;

export async function getStoreLongestRunAds(params: z.infer<typeof getStoreLongestRunAdsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/pp-stores/ad-content/longest-run", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreMostUsedAdsSchema = storeAdContentPaginationSchema;

export async function getStoreMostUsedAds(params: z.infer<typeof getStoreMostUsedAdsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/pp-stores/ad-content/most-used", params);
  return JSON.stringify(result.data, null, 2);
}

export const getStoreFbPagesSchema = z.object({
  id: nonEmptyString.describe("Store ID"),
  page_size: pageSize.optional().describe("Results per page"),
  current_page: pageNumber.optional().describe("Page number"),
});

export async function getStoreFbPages(params: z.infer<typeof getStoreFbPagesSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/pp-stores/fb-page", params);
  return JSON.stringify(result.data, null, 2);
}
