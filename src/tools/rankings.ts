import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { pageNumber, pageSize, platform, sortDirection } from "../validation.js";

// --- Product Rankings ---

export const getProductRankingSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  sort_key: z.string().describe('Sort field: "count_growth", "growth_rate", "video_count"'),
  sort_type: z.enum(["asc", "desc", "default"]).describe('"asc", "desc", or "default"'),
  time: z.number().describe("Time filter"),
  type: z.number().describe("Type: 1=Day, 2=Week, 3=Month, 0=Default"),
  plat_type: platform.optional().describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  region: z.string().optional().describe("Country/region"),
  shop_type: z.string().optional().describe("E-commerce system"),
  count_growth_min: z.number().finite().optional().describe("Minimum growth count"),
  count_growth_max: z.number().finite().optional().describe("Maximum growth count"),
  growth_rate_min: z.number().finite().optional().describe("Minimum growth rate"),
  growth_rate_max: z.number().finite().optional().describe("Maximum growth rate"),
});

export async function getProductRanking(params: z.infer<typeof getProductRankingSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/ad-product/list", params);
  return JSON.stringify(result.data, null, 2);
}

// --- New Product Rankings ---

export const getNewProductRankingSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  found_time: z.number().describe("Discovery time: 1=3d, 2=7d, 3=1m, 4=3m, 5=6m, 6=All, 0=Default"),
  sort_key: z.string().describe('"count_growth", "growth_rate", "video_count"'),
  sort_type: z.enum(["asc", "desc", "default"]).describe('"asc", "desc", or "default"'),
  type: z.number().describe("Type: 1=24h, 2=3d, 3=7d, 0=Default"),
  plat_type: platform.optional().describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  region: z.string().optional().describe("Country/region"),
  shop_type: z.string().optional().describe("E-commerce system"),
  count_growth_min: z.number().finite().optional().describe("Minimum growth count"),
  count_growth_max: z.number().finite().optional().describe("Maximum growth count"),
  growth_rate_min: z.number().finite().optional().describe("Minimum growth rate"),
  growth_rate_max: z.number().finite().optional().describe("Maximum growth rate"),
});

export async function getNewProductRanking(params: z.infer<typeof getNewProductRankingSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/ad-product-new/list", params);
  return JSON.stringify(result.data, null, 2);
}

// --- App Rankings ---

export const getAppRankingSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  sort_key: z.string().describe("Sort field"),
  sort_type: sortDirection.describe('"asc" or "desc"'),
  time: z.number().describe("Time filter"),
  type: z.number().describe("Type: 1=Day, 2=Week, 3=Month, 0=Default"),
  plat_type: platform.optional().describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  region: z.string().optional().describe("Country/region"),
  app_category: z.string().optional().describe("App category"),
  app_system: z.string().optional().describe('"ios" or "android"'),
  app_type: z.string().optional().describe('"game" or "app"'),
  count_growth_min: z.number().finite().optional().describe("Minimum growth"),
  count_growth_max: z.number().finite().optional().describe("Maximum growth"),
  growth_rate_min: z.number().finite().optional().describe("Minimum growth rate"),
  growth_rate_max: z.number().finite().optional().describe("Maximum growth rate"),
  video_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  video_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  app_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum downloads"),
  app_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum downloads"),
  latest_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum latest downloads"),
  latest_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum latest downloads"),
  last_month_revenue_min: z.number().finite().nonnegative().optional().describe("Minimum monthly revenue"),
  last_month_revenue_max: z.number().finite().nonnegative().optional().describe("Maximum monthly revenue"),
});

export async function getAppRanking(params: z.infer<typeof getAppRankingSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/app/list", params);
  return JSON.stringify(result.data, null, 2);
}

// --- New App Rankings ---

export const getNewAppRankingSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  found_time: z.number().describe("Discovery time filter"),
  sort_key: z.string().describe("Sort field"),
  sort_type: sortDirection.describe('"asc" or "desc"'),
  type: z.number().describe("Type: 1=24h, 2=3d, 3=7d, 0=Default"),
  create_time_type: z.number().describe("Create time type"),
  plat_type: platform.optional().describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  region: z.string().optional().describe("Country/region"),
  app_category: z.string().optional().describe("App category"),
  app_system: z.string().optional().describe('"ios" or "android"'),
  app_type: z.string().optional().describe('"game" or "app"'),
  count_growth_min: z.number().finite().optional().describe("Minimum growth"),
  count_growth_max: z.number().finite().optional().describe("Maximum growth"),
  growth_rate_min: z.number().finite().optional().describe("Minimum growth rate"),
  growth_rate_max: z.number().finite().optional().describe("Maximum growth rate"),
});

export async function getNewAppRanking(params: z.infer<typeof getNewAppRankingSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/app-new/list", params);
  return JSON.stringify(result.data, null, 2);
}

// --- App Developer Rankings ---

export const getAppDevRankingSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  sort_key: z.string().describe("Sort field"),
  sort_type: sortDirection.describe('"asc" or "desc"'),
  time: z.number().describe("Time filter"),
  type: z.number().describe("Type: 1=Day, 2=Week, 3=Month, 0=Default"),
  plat_type: platform.optional().describe("Platform"),
  region: z.string().optional().describe("Country/region"),
  app_category: z.string().optional().describe("App category"),
  app_system: z.string().optional().describe('"ios" or "android"'),
  app_type: z.string().optional().describe('"game" or "app"'),
  app_count_min: z.number().finite().nonnegative().optional().describe("Minimum app count"),
  app_count_max: z.number().finite().nonnegative().optional().describe("Maximum app count"),
  app_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum downloads"),
  app_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum downloads"),
  count_growth_min: z.number().finite().optional().describe("Minimum growth"),
  count_growth_max: z.number().finite().optional().describe("Maximum growth"),
  growth_rate_min: z.number().finite().optional().describe("Minimum growth rate"),
  growth_rate_max: z.number().finite().optional().describe("Maximum growth rate"),
  install_count_min: z.number().finite().nonnegative().optional().describe("Minimum installs"),
  install_count_max: z.number().finite().nonnegative().optional().describe("Maximum installs"),
  last_month_revenue_min: z.number().finite().nonnegative().optional().describe("Minimum monthly revenue"),
  last_month_revenue_max: z.number().finite().nonnegative().optional().describe("Maximum monthly revenue"),
});

export async function getAppDevRanking(params: z.infer<typeof getAppDevRankingSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/rank/app-dev/list", params);
  return JSON.stringify(result.data, null, 2);
}
