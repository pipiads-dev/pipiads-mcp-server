import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString, platform, sortDirection } from "../validation.js";

const keywordSchema = z.object({
  type: z.number().int().min(1).max(12).describe("1=Ad keyword, 2=Ad copy, 3=Advertiser, 4=Landing URL, 5=Product, 6=TikTok shop, 7=App, 8=App developer, 9=Social account, 10=Creative, 11=Store/URL, 12=TikTok product"),
  keyword: z.string().trim().min(1).describe("Search keyword"),
}).strict();

export const searchAdsSchema = z.object({
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
    .describe("Platform: 0=All, 1=TikTok, 2=Facebook. Omit for all platforms"),
  extend_keywords: z
    .array(
      keywordSchema
    )
    .optional()
    .describe("Keyword search list. Each item has a type and keyword"),
  search_type: z
    .number()
    .int().min(1).max(12)
    .optional()
    .describe(
      "Legacy search type; prefer each item's type in extend_keywords (1 through 12)"
    ),
  region: z
    .array(z.string())
    .optional()
    .describe('Country/region codes, e.g. ["US","GB","DE"]'),
  sort: z.union([z.number().int().min(1).max(21), z.literal(999)])
    .optional()
    .describe(
      "Sort: 1=Last found, 2=Created, 3=First found, 4=Plays, 5=Days, 6=Engagement, 7=Like rate, 8=Share rate, 9=Likes, 10=Comments, 11=Shares, 14=Est conversions, 15-20=FB reactions, 21=Spend, 999=Keyword relevance (use after for next page)"
    ),
  sort_type: sortDirection
    .optional()
    .describe('Sort order: "desc"(default) or "asc"'),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play/view count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play/view count"),
  digg_count_min: z.number().finite().nonnegative().optional().describe("Minimum like count"),
  digg_count_max: z.number().finite().nonnegative().optional().describe("Maximum like count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  create_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("Creation time range start (unix timestamp in seconds)"),
  create_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("Creation time range end (unix timestamp in seconds)"),
  first_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("First found time start (unix timestamp)"),
  first_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("First found time end (unix timestamp)"),
  last_time_start: z.number().finite().nonnegative()
    .optional()
    .describe("Last found time start (unix timestamp)"),
  last_time_end: z.number().finite().nonnegative()
    .optional()
    .describe("Last found time end (unix timestamp)"),
  data_type: z
    .array(z.number().int().min(1).max(8))
    .optional()
    .describe(
      "Data type filter: 1=Hot Product, 2=Mini Shop Ad, 3=E-commerce, 4=Spark Ads, 5=Game, 6=App, 7=AI, 8=Short Drama"
    ),
  is_product: z.boolean().optional().describe("Filter: has ad product"),
  is_app: z.boolean().optional().describe("Filter: has APP product"),
  is_url: z
    .number()
    .int().min(0).max(1)
    .optional()
    .describe("URL status: 0=No landing page, 1=Has landing page"),
  shop_type: z
    .array(z.string())
    .optional()
    .describe(
      'E-commerce platform filter, e.g. ["shopify","woocommerce","magento","wix","shoplazza","shopline","squarespace","shopyy"]'
    ),
  ad_cost_min: z.number().finite().nonnegative().optional().describe("Minimum ad spend (USD)"),
  ad_cost_max: z.number().finite().nonnegative().optional().describe("Maximum ad spend (USD)"),
  comment_count_min: z.number().finite().nonnegative().optional().describe("Minimum comment count"),
  comment_count_max: z.number().finite().nonnegative().optional().describe("Maximum comment count"),
  share_count_min: z.number().finite().nonnegative().optional().describe("Minimum share count"),
  share_count_max: z.number().finite().nonnegative().optional().describe("Maximum share count"),
  ad_language: z
    .array(z.string())
    .optional()
    .describe('Ad language filter, e.g. ["en","zh"]'),
  formate_type: z
    .array(z.number().int().min(1).max(3))
    .optional()
    .describe("Ad format: 1=Video, 2=Image, 3=Carousel"),
  aigc_type: z.enum(["-1", "0", "1", "2"]).optional().describe("AI creative: -1=AI generated, 0=Non-AI, 1=Advertiser labelled, 2=Official AI. Omit for all."),
  ad_state: z.union([z.literal(0), z.literal(1)]).optional().describe("Delivery state: 1=Active, 0=Stopped"),
  after: z.array(z.union([z.string(), z.number().finite()])).min(1).optional().describe("Copy the complete cursor from the previous result. For sort=999 use [last _score, last video_id]."),
  is_and: z.boolean().optional().describe("Combine keyword items with AND (true) or OR (false, default)"),
  exclude_word: z.array(keywordSchema).optional().describe("Excluded keyword items; wire parameter is exclude_word"),
});

export async function searchAds(
  params: z.infer<typeof searchAdsSchema>
): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/adspy/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getAdDetailSchema = z.object({
  id: nonEmptyString.describe("Ad video ID (video_id from search results)"),
});

export async function getAdDetail(
  params: z.infer<typeof getAdDetailSchema>
): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/adspy/detail", params);
  return JSON.stringify(result.data, null, 2);
}
