import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString, pageNumber, pageSize, platform, sortDirection } from "../validation.js";

export const searchProductsSchema = z.object({
  current_page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number, starting from 1"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20)
    .describe("Results per page, max 50"),
  plat_type: platform
    .optional()
    .describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  keyword: z.string().optional().describe("Search keyword for product title"),
  search_type: z
    .number()
    .optional()
    .describe(
      "Search type: 1=Product title, 2=Product description, 3=Advertiser URL, 4=Advertiser name, 5=Product keyword"
    ),
  category: z
    .string()
    .optional()
    .describe("Product category, multiple separated by commas"),
  region: z
    .string()
    .optional()
    .describe('Country/region, multiple separated by commas, e.g. "US,GB"'),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad play count"),
  digg_count_min: z.number().finite().nonnegative().optional().describe("Minimum like count"),
  digg_count_max: z.number().finite().nonnegative().optional().describe("Maximum like count"),
  video_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  video_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  price_min: z.number().finite().nonnegative().optional().describe("Minimum product price (USD)"),
  price_max: z.number().finite().nonnegative().optional().describe("Maximum product price (USD)"),
  create_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("Product creation time start (unix timestamp)"),
  create_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("Product creation time end (unix timestamp)"),
  tiktok_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("Ad start date / first found time start (unix timestamp)"),
  tiktok_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("Ad start date / first found time end (unix timestamp)"),
  latest_found_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("Ad end date / last found time start (unix timestamp)"),
  latest_found_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("Ad end date / last found time end (unix timestamp)"),
  platform: z
    .string()
    .optional()
    .describe(
      'E-commerce platform, comma-separated: "shopify,woocommerce,shoplazza,magento,wix,shopline,squarespace,shopyy"'
    ),
  currency: z
    .string()
    .optional()
    .describe('Currency filter, comma-separated, e.g. "USD,EUR"'),
  sort: z
    .string()
    .optional()
    .describe(
      "Sort field: 0=Start Date, 1=End Date, 2=Product Creation Date, 3=Price(USD), 4=Number of ads, 5=Impressions, 6=Likes, 7=Durations"
    ),
  sort_type: sortDirection.optional().describe('Sort order: "desc" or "asc"'),
  store_id: z
    .string()
    .optional()
    .describe("Store ID (13-char string) to filter products from a store"),
  time: z
    .number()
    .optional()
    .describe(
      "Time range shortcut: 1=yesterday, 7=last 7 days, 30=last 30 days, 90=last 90 days"
    ),
});

export async function searchProducts(
  params: z.infer<typeof searchProductsSchema>
): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ad-product/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getProductDetailSchema = z.object({
  id: nonEmptyString.describe("Product ID from search results"),
});

export async function getProductDetail(
  params: z.infer<typeof getProductDetailSchema>
): Promise<string> {
  const result = await callPipiAdsApi(
    "/v3/api/open/ad-product/detail",
    params
  );
  return JSON.stringify(result.data, null, 2);
}

// --- Ad Library Products (Meta/Facebook) ---

export const searchAdlibraryProductsSchema = z.object({
  page: pageNumber.optional().default(1).describe("Page number"),
  per_page: pageSize.optional().default(20).describe("Results per page, max 100"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('Sort direction: "asc" or "desc"'),
  ids: z.array(z.string()).optional().describe("Filter by product IDs"),
  category_id: z.array(z.string()).optional().describe("Filter by category IDs"),
  currency: z.array(z.string()).optional().describe('Currency filter, e.g. ["USD","EUR"]'),
  e_commerce_platform: z.array(z.string()).optional().describe('E-commerce platform filter, e.g. ["shopify"]'),
  price_usd_start: z.number().finite().nonnegative().optional().describe("Minimum price in USD"),
  price_usd_end: z.number().finite().nonnegative().optional().describe("Maximum price in USD"),
  creation_time_start: z.number().finite().nonnegative().optional().describe("Product creation time start (unix timestamp)"),
  creation_time_end: z.number().finite().nonnegative().optional().describe("Product creation time end (unix timestamp)"),
  ad_status: z.number().optional().describe("Ad status: 1=Active, 2=Stopped"),
  ad_forecast: z.array(z.number()).optional().describe("Ad forecast filter"),
  ad_started_at_start: z.number().finite().nonnegative().optional().describe("Ad start time start (unix timestamp)"),
  ad_started_at_end: z.number().finite().nonnegative().optional().describe("Ad start time end (unix timestamp)"),
  ad_ended_at_start: z.number().finite().nonnegative().optional().describe("Ad end time start (unix timestamp)"),
  ad_ended_at_end: z.number().finite().nonnegative().optional().describe("Ad end time end (unix timestamp)"),
  active_days_start: z.number().finite().nonnegative().optional().describe("Minimum active days"),
  active_days_end: z.number().finite().nonnegative().optional().describe("Maximum active days"),
});

export async function searchAdlibraryProducts(params: z.infer<typeof searchAdlibraryProductsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/ad-products/search", params);
  return JSON.stringify(result.data, null, 2);
}

export const getAdlibraryProductDetailSchema = z.object({
  id: nonEmptyString.describe("Ad library product ID"),
});

export async function getAdlibraryProductDetail(params: z.infer<typeof getAdlibraryProductDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ppspy/ad-products/detail", params);
  return JSON.stringify(result.data, null, 2);
}
