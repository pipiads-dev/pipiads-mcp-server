import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { nonEmptyString, pageNumber, pageSize, platform, sortDirection } from "../validation.js";

export const searchAppsSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  plat_type: platform.describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  search_type: z.number().int().min(1).max(4).describe("Search type: 1=Keyword, 2=App name, 3=App description, 4=Developer name"),
  sort: z.number().int().min(1).max(13).describe("Sort: 1=Created, 2=Comments, 3=Rating, 4=Ads, 5=Plays, 6=Likes, 7=Days, 8=Ad start, 9=Ad end, 10=Total installs, 11=Monthly installs, 12=Monthly revenue USD, 13=Influencers"),
  sort_type: sortDirection.describe('"asc" or "desc"'),
  time: z.union([z.literal(0), z.literal(1), z.literal(7), z.literal(30), z.literal(90)]).describe("Time range: 0=All, 1=Yesterday, 7=Last 7 days, 30=Last 30 days, 90=Last 90 days"),
  keyword: z.string().optional().describe("Search keyword"),
  app_category: z.string().optional().describe("App category"),
  app_system: z.string().optional().describe('"ios" or "android"'),
  app_type: z.string().optional().describe('"game" or "app"'),
  region: z.string().optional().describe("Country/region"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  digg_count_min: z.number().finite().nonnegative().optional().describe("Minimum like count"),
  digg_count_max: z.number().finite().nonnegative().optional().describe("Maximum like count"),
  video_count_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  video_count_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  popular_person_count_min: z.number().finite().nonnegative().optional().describe("Minimum influencer count"),
  popular_person_count_max: z.number().finite().nonnegative().optional().describe("Maximum influencer count"),
  app_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum downloads"),
  app_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum downloads"),
  app_rating_min: z.number().finite().nonnegative().optional().describe("Minimum app rating"),
  app_rating_max: z.number().finite().nonnegative().optional().describe("Maximum app rating"),
  app_comment_count_min: z.number().finite().nonnegative().optional().describe("Minimum comment count"),
  app_comment_count_max: z.number().finite().nonnegative().optional().describe("Maximum comment count"),
  last_month_app_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum monthly downloads"),
  last_month_app_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum monthly downloads"),
  last_month_revenue_min: z.number().finite().nonnegative().optional().describe("Minimum monthly revenue (USD)"),
  last_month_revenue_max: z.number().finite().nonnegative().optional().describe("Maximum monthly revenue (USD)"),
  found_time_start: z.number().finite().nonnegative().optional().describe("First found time start (unix timestamp)"),
  found_time_end: z.number().finite().nonnegative().optional().describe("First found time end"),
  latest_found_time_start: z.number().finite().nonnegative().optional().describe("Last found time start"),
  latest_found_time_end: z.number().finite().nonnegative().optional().describe("Last found time end"),
  app_create_time_start: z.number().finite().nonnegative().optional().describe("App creation time start"),
  app_create_time_end: z.number().finite().nonnegative().optional().describe("App creation time end"),
});

export async function searchApps(params: z.infer<typeof searchAppsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/app/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getAppDetailSchema = z.object({
  id: nonEmptyString.describe("App ID"),
});

export async function getAppDetail(params: z.infer<typeof getAppDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/app/detail", params);
  return JSON.stringify(result.data, null, 2);
}

// --- App Developers ---

export const searchAppDevelopersSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  plat_type: platform.describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  sort: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(4), z.literal(7), z.literal(8), z.literal(9), z.literal(10), z.literal(11), z.literal(12)]).describe("Sort: 0=Ads, 1=Plays, 2=Likes, 4=Days, 7=Ad start, 8=Ad end, 9=Apps, 10=Total installs, 11=Monthly installs, 12=Monthly revenue USD"),
  time: z.number().int().min(0).max(4).describe("Time range: 0=Last 7 days, 1=Last 30 days, 2=Last 90 days, 3=All, 4=Yesterday"),
  keyword: z.string().optional().describe("Search keyword"),
  search_type: z.number().optional().describe("Search type"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
  app_category: z.array(z.string()).optional().describe("App category filter"),
  app_system: z.string().optional().describe('"ios" or "android"'),
  app_type: z.string().optional().describe('"game" or "app"'),
  region: z.array(z.string()).optional().describe("Country/region filter"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  digg_count_min: z.number().finite().nonnegative().optional().describe("Minimum like count"),
  digg_count_max: z.number().finite().nonnegative().optional().describe("Maximum like count"),
  digg_rate_min: z.number().finite().nonnegative().optional().describe("Minimum like rate"),
  digg_rate_max: z.number().finite().nonnegative().optional().describe("Maximum like rate"),
  goods_source_min: z.number().finite().nonnegative().optional().describe("Minimum ad count"),
  goods_source_max: z.number().finite().nonnegative().optional().describe("Maximum ad count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  cpm_min: z.number().finite().nonnegative().optional().describe("Minimum CPM"),
  cpm_max: z.number().finite().nonnegative().optional().describe("Maximum CPM"),
  popular_person_count_min: z.number().finite().nonnegative().optional().describe("Minimum influencer count"),
  popular_person_count_max: z.number().finite().nonnegative().optional().describe("Maximum influencer count"),
  app_count_min: z.number().finite().nonnegative().optional().describe("Minimum app count"),
  app_count_max: z.number().finite().nonnegative().optional().describe("Maximum app count"),
  app_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum downloads"),
  app_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum downloads"),
  app_comment_count_min: z.number().finite().nonnegative().optional().describe("Minimum comment count"),
  app_comment_count_max: z.number().finite().nonnegative().optional().describe("Maximum comment count"),
  last_month_app_download_count_min: z.number().finite().nonnegative().optional().describe("Minimum monthly downloads"),
  last_month_app_download_count_max: z.number().finite().nonnegative().optional().describe("Maximum monthly downloads"),
  last_month_revenue_min: z.number().finite().nonnegative().optional().describe("Minimum monthly revenue"),
  last_month_revenue_max: z.number().finite().nonnegative().optional().describe("Maximum monthly revenue"),
  start_time_start: z.number().finite().nonnegative().optional().describe("Ad start date start"),
  start_time_end: z.number().finite().nonnegative().optional().describe("Ad start date end"),
  end_time_start: z.number().finite().nonnegative().optional().describe("Ad end date start"),
  end_time_end: z.number().finite().nonnegative().optional().describe("Ad end date end"),
});

export async function searchAppDevelopers(params: z.infer<typeof searchAppDevelopersSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/app-dev/list", params);
  return JSON.stringify(result.data, null, 2);
}

export const getAppDeveloperDetailSchema = z.object({
  id: nonEmptyString.describe("App developer ID"),
});

export async function getAppDeveloperDetail(params: z.infer<typeof getAppDeveloperDetailSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/app-dev/detail", params);
  return JSON.stringify(result.data, null, 2);
}
