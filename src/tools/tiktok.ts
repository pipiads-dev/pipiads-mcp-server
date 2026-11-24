import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString, pageNumber, pageSize, sortDirection } from "../validation.js";

export const searchTiktokProductsSchema = z.object({
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
  sort: z
    .number()
    .int().min(1).max(8)
    .describe(
      "Sort field (required): 1=Last time, 2=First time, 3=Sold, 4=GMV, 5=Impressions, 6=Ad Spend, 7=Ads, 8=Influencers"
    ),
  sort_type: sortDirection
    .describe('Sort order (required): "asc" or "desc"'),
  time: z.union([z.literal(0), z.literal(1), z.literal(30), z.literal(90)])
    .describe(
      "Time range (required): 0=All, 1=Yesterday, 30=Last 30 days, 90=Last 90 days"
    ),
  keyword: z.string().optional().describe("Search keyword for product title"),
  search_type: z
    .string()
    .optional()
    .describe(
      "Search type: 1=Product name/description(default), 2=Store name, 3=Influencer name"
    ),
  categorize: z
    .string()
    .optional()
    .describe("Category filter, multiple separated by commas"),
  region: z
    .string()
    .optional()
    .describe('Country/region, comma-separated, e.g. "US,GB"'),
  delivery: z
    .string()
    .optional()
    .describe('Delivery method: "overseas"=Cross-border, "local"=Local'),
  is_managed: z
    .boolean()
    .optional()
    .describe("Filter fully managed products"),
  is_in_marketplace: z
    .boolean()
    .optional()
    .describe("Filter marketplace products"),
  sales_volume_min: z.number().finite().nonnegative().optional().describe("Minimum sales volume"),
  sales_volume_max: z.number().finite().nonnegative().optional().describe("Maximum sales volume"),
  gmv_min: z.number().finite().nonnegative().optional().describe("Minimum GMV"),
  gmv_max: z.number().finite().nonnegative().optional().describe("Maximum GMV"),
  price_usd_min: z.number().finite().nonnegative().optional().describe("Minimum price in USD"),
  price_usd_max: z.number().finite().nonnegative().optional().describe("Maximum price in USD"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad impressions"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad impressions"),
  commission_rate_min: z.number().finite().nonnegative()
    .optional()
    .describe("Minimum commission rate"),
  commission_rate_max: z.number().finite().nonnegative()
    .optional()
    .describe("Maximum commission rate"),
  person_count_min: z.number().finite().nonnegative()
    .optional()
    .describe("Minimum influencer count"),
  person_count_max: z.number().finite().nonnegative()
    .optional()
    .describe("Maximum influencer count"),
  video_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  video_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  sales_trend: z
    .number()
    .optional()
    .describe("Sales trend: 1=Increase, 0=Stable, -1=Decrease"),
  shop_id: z
    .string()
    .optional()
    .describe("Filter products from a specific shop"),
  found_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("First ad date start (unix timestamp)"),
  found_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("First ad date end (unix timestamp)"),
  last_found_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("Last ad date start (unix timestamp)"),
  last_found_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("Last ad date end (unix timestamp)"),
  cpm_min: z.number().finite().nonnegative().optional().describe("Minimum ad spend (CPM)"),
  cpm_max: z.number().finite().nonnegative().optional().describe("Maximum ad spend (CPM)"),
});

export async function searchTiktokProducts(
  params: z.infer<typeof searchTiktokProductsSchema>
): Promise<string> {
  const result = await callPipiAdsApi(
    "/v3/api/open/tiktok-shop/product/list",
    params
  );
  return JSON.stringify(result.data, null, 2);
}

export const getTiktokProductDetailSchema = z.object({
  id: nonEmptyString.describe("TikTok shop product ID"),
});

export async function getTiktokProductDetail(
  params: z.infer<typeof getTiktokProductDetailSchema>
): Promise<string> {
  const result = await callPipiAdsApi(
    "/v3/api/open/tiktok-shop/product/detail",
    params
  );
  return JSON.stringify(result.data, null, 2);
}

// --- TikTok Shop Stores ---

export const searchTiktokShopsSchema = z.object({
  current_page: pageNumber.optional().default(1).describe("Page number"),
  page_size: pageSize.max(50).optional().default(20).describe("Results per page"),
  sort: z.number().int().min(1).max(10).optional().describe("Sort field: 1=Last time, 2=First time, 3=Sold, 4=GMV, 5=Impressions, 6=Ad Spend, 7=Ads, 8=Influencers, 9=Products, 10=Average price"),
  sort_type: sortDirection.optional().describe('Sort order: "asc" or "desc"'),
  time: z.union([z.literal(0), z.literal(1), z.literal(7), z.literal(30), z.literal(90)]).optional().describe("Time range: 0=All, 1=Yesterday, 7=Last 7 days, 30=Last 30 days, 90=Last 90 days"),
  keyword: z.string().optional().describe("Search keyword for shop name"),
  categorize: z.string().optional().describe("Category filter, comma-separated"),
  region: z.string().optional().describe('Country/region, comma-separated, e.g. "US,GB"'),
  delivery: z.string().optional().describe('"overseas"=Cross-border, "local"=Local'),
  is_managed: z.boolean().optional().describe("Filter fully managed shops"),
  product_type: z.string().optional().describe('"brand" or "retail"'),
  sales_volume_min: z.number().finite().nonnegative().optional().describe("Minimum sales volume"),
  sales_volume_max: z.number().finite().nonnegative().optional().describe("Maximum sales volume"),
  gmv_min: z.number().finite().nonnegative().optional().describe("Minimum GMV"),
  gmv_max: z.number().finite().nonnegative().optional().describe("Maximum GMV"),
  goods_count_min: z.number().finite().nonnegative().optional().describe("Minimum product count"),
  goods_count_max: z.number().finite().nonnegative().optional().describe("Maximum product count"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad impressions"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad impressions"),
  person_count_min: z.number().finite().nonnegative().optional().describe("Minimum influencer count"),
  person_count_max: z.number().finite().nonnegative().optional().describe("Maximum influencer count"),
  video_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  video_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  avg_price_usd_min: z.number().finite().nonnegative().optional().describe("Minimum average price (USD)"),
  avg_price_usd_max: z.number().finite().nonnegative().optional().describe("Maximum average price (USD)"),
  cpm_min: z.number().finite().nonnegative().optional().describe("Minimum ad spend"),
  cpm_max: z.number().finite().nonnegative().optional().describe("Maximum ad spend"),
  sales_trend: z.union([z.literal(-1), z.literal(0), z.literal(1)]).optional().describe("Sales trend: 1=Increase, 0=Stable, -1=Decrease"),
  found_time_start: z.number().finite().nonnegative().optional().describe("First found time start (unix timestamp)"),
  found_time_end: z.number().finite().nonnegative().optional().describe("First found time end (unix timestamp)"),
  last_found_time_start: z.number().finite().nonnegative().optional().describe("Last found time start (unix timestamp)"),
  last_found_time_end: z.number().finite().nonnegative().optional().describe("Last found time end (unix timestamp)"),
});

export async function searchTiktokShops(params: z.infer<typeof searchTiktokShopsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/tiktok-shop/shop/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getTiktokShopDetailSchema = z.object({
  id: nonEmptyString.describe("TikTok shop store ID"),
});

export async function getTiktokShopDetail(params: z.infer<typeof getTiktokShopDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/tiktok-shop/shop/detail", params);
  return JSON.stringify(result.data, null, 2);
}
