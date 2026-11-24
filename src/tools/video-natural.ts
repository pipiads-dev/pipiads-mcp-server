import { z } from "zod";
import { callPipiAdsApi } from "../client.js";
import { pageNumber, pageSize, platform, sortDirection } from "../validation.js";

export const searchNaturalVideosSchema = z.object({
  current_page: pageNumber.describe("Page number"),
  page_size: pageSize.max(50).describe("Results per page"),
  keyword: z.string().optional().describe("Search keyword"),
  search_type: z.number().optional().describe("Search type"),
  type: z.number().optional().describe("Content type filter"),
  region: z.array(z.string()).optional().describe('Country/region codes, e.g. ["US","GB"]'),
  platform: z.string().optional().describe("Platform filter"),
  create_time_start: z.number().finite().nonnegative().optional().describe("Creation time start (unix timestamp)"),
  create_time_end: z.number().finite().nonnegative().optional().describe("Creation time end (unix timestamp)"),
  follower_count_min: z.number().finite().nonnegative().optional().describe("Minimum follower count"),
  follower_count_max: z.number().finite().nonnegative().optional().describe("Maximum follower count"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  digg_count_min: z.number().finite().nonnegative().optional().describe("Minimum like count"),
  digg_count_max: z.number().finite().nonnegative().optional().describe("Maximum like count"),
  digg_play_rate_min: z.number().finite().nonnegative().optional().describe("Minimum like-to-play rate"),
  digg_play_rate_max: z.number().finite().nonnegative().optional().describe("Maximum like-to-play rate"),
  comment_count_min: z.number().finite().nonnegative().optional().describe("Minimum comment count"),
  comment_count_max: z.number().finite().nonnegative().optional().describe("Maximum comment count"),
  share_count_min: z.number().finite().nonnegative().optional().describe("Minimum share count"),
  share_count_max: z.number().finite().nonnegative().optional().describe("Maximum share count"),
  sort_key: z.string().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
});

export async function searchNaturalVideos(params: z.infer<typeof searchNaturalVideosSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v4/api/open/video/list", params);
  return JSON.stringify(result.data, null, 2);
}
