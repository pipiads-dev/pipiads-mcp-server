import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString, pageNumber, pageSize, sortDirection } from "../validation.js";

export const searchLibAdsSchema = z.object({
  page: pageNumber.optional().default(1).describe("Page number"),
  per_page: pageSize.optional().default(20).describe("Results per page"),
  order_by: z.string().optional().describe("Sort field"),
  direction: sortDirection.optional().describe('"asc" or "desc"'),
  ad_content: z.string().optional().describe("Ad content keyword search"),
  ad_content_md5: z.string().optional().describe("Ad content MD5 hash"),
  ad_platform: z.string().optional().describe("Ad platform filter"),
  ad_status: z.string().optional().describe("Ad status filter"),
  ad_forecast: z.number().optional().describe("Ad forecast filter"),
  country: z.string().optional().describe("Country filter"),
  language: z.string().optional().describe("Language filter"),
  data_type: z.string().optional().describe("Data type filter"),
  source_ad_id: nonEmptyString.optional().describe("Source ad ID"),
  source_advertiser_id: nonEmptyString.optional().describe("Source advertiser ID"),
  ad_started_at_start: z.number().finite().nonnegative().optional().describe("Ad start time start (unix timestamp)"),
  ad_started_at_end: z.number().finite().nonnegative().optional().describe("Ad start time end"),
  first_discovered_at_start: z.number().finite().nonnegative().optional().describe("First discovered time start"),
  first_discovered_at_end: z.number().finite().nonnegative().optional().describe("First discovered time end"),
  last_discovered_at_start: z.number().finite().nonnegative().optional().describe("Last discovered time start"),
  last_discovered_at_end: z.number().finite().nonnegative().optional().describe("Last discovered time end"),
  latest_actived_at_start: z.number().finite().nonnegative().optional().describe("Latest active time start"),
  latest_actived_at_end: z.number().finite().nonnegative().optional().describe("Latest active time end"),
  active_days_start: z.number().finite().nonnegative().optional().describe("Minimum active days"),
  active_days_end: z.number().finite().nonnegative().optional().describe("Maximum active days"),
  ad_audience_reach_start: z.number().finite().nonnegative().optional().describe("Minimum audience reach"),
  ad_audience_reach_end: z.number().finite().nonnegative().optional().describe("Maximum audience reach"),
  ad_cost_start: z.number().finite().nonnegative().optional().describe("Minimum ad cost"),
  ad_cost_end: z.number().finite().nonnegative().optional().describe("Maximum ad cost"),
});

export async function searchLibAds(params: z.infer<typeof searchLibAdsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/lib-ads/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getLibAdDetailSchema = z.object({
  id: nonEmptyString.describe("Ad library item ID"),
});

export async function getLibAdDetail(params: z.infer<typeof getLibAdDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/lib-ads/detail", params);
  return JSON.stringify(result.data, null, 2);
}
