import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { withRequestSignal } from "./client.js";
import { validateRanges } from "./validation.js";

// --- Imports ---
import { searchAdsSchema, searchAds, getAdDetailSchema, getAdDetail } from "./tools/ads.js";
import { searchProductsSchema, searchProducts, getProductDetailSchema, getProductDetail, searchAdlibraryProductsSchema, searchAdlibraryProducts, getAdlibraryProductDetailSchema, getAdlibraryProductDetail } from "./tools/products.js";
import { searchTiktokProductsSchema, searchTiktokProducts, getTiktokProductDetailSchema, getTiktokProductDetail, searchTiktokShopsSchema, searchTiktokShops, getTiktokShopDetailSchema, getTiktokShopDetail } from "./tools/tiktok.js";
import { searchAdvertisersSchema, searchAdvertisers, getAdvertiserDetailSchema, getAdvertiserDetail, searchStoresSchema, searchStores, getStoreDetailSchema, getStoreDetail, getStoreCompetitionSchema, getStoreCompetition, getStoreDataAnalysisSchema, getStoreDataAnalysis, getStorePlayCostSchema, getStorePlayCost, getStoreRegionAnalysisSchema, getStoreRegionAnalysis, getStoreAdCopyAnalysisSchema, getStoreAdCopyAnalysis, getStoreAdScheduleSchema, getStoreAdSchedule, getStoreProductAnalysisSchema, getStoreProductAnalysis, getStoreRankDataSchema, getStoreRankData, getStoreAdTrendSchema, getStoreAdTrend, getStoreDeliveryAnalysisSchema, getStoreDeliveryAnalysis, getStoreLongestRunAdsSchema, getStoreLongestRunAds, getStoreMostUsedAdsSchema, getStoreMostUsedAds, getStoreFbPagesSchema, getStoreFbPages } from "./tools/stores.js";
import { searchLibAdsSchema, searchLibAds, getLibAdDetailSchema, getLibAdDetail } from "./tools/lib-ads.js";
import { getProductRankingSchema, getProductRanking, getNewProductRankingSchema, getNewProductRanking, getAppRankingSchema, getAppRanking, getNewAppRankingSchema, getNewAppRanking, getAppDevRankingSchema, getAppDevRanking } from "./tools/rankings.js";
import { searchAppsSchema, searchApps, getAppDetailSchema, getAppDetail, searchAppDevelopersSchema, searchAppDevelopers, getAppDeveloperDetailSchema, getAppDeveloperDetail } from "./tools/apps.js";
import { searchNaturalVideosSchema, searchNaturalVideos } from "./tools/video-natural.js";
import { searchFbAdvertisersSchema, searchFbAdvertisers, createMonitorTaskSchema, createMonitorTask, listMonitorTasksSchema, listMonitorTasks, getMonitorTaskDetailSchema, getMonitorTaskDetail, cancelMonitorTaskSchema, cancelMonitorTask, getMonitorBoardSchema, getMonitorBoard, setMonitorTaskGroupSchema, setMonitorTaskGroup, getMonitorRealtimeOverviewSchema, getMonitorRealtimeOverview, getMonitorDailyOverviewSchema, getMonitorDailyOverview, getMonitorLandingPagesOverviewSchema, getMonitorLandingPagesOverview, getMonitorLatestProductsSchema, getMonitorLatestProducts, getMonitorProductListSchema, getMonitorProductList, getMonitorLandingPageListSchema, getMonitorLandingPageList, getMonitorAdCountStatsSchema, getMonitorAdCountStats, getMonitorDeepAnalysisSchema, getMonitorDeepAnalysis, getMonitorMostUsedCopySchema, getMonitorMostUsedCopy, getMonitorLongestRunCopySchema, getMonitorLongestRunCopy, getMonitorAdListSchema, getMonitorAdList, getMonitorAdDetailSchema, getMonitorAdDetail, getMonitorProductStatsSchema, getMonitorProductStats } from "./tools/monitor.js";
import { createMonitorGroupSchema, createMonitorGroup, listMonitorGroupsSchema, listMonitorGroups, updateMonitorGroupSchema, updateMonitorGroup, deleteMonitorGroupSchema, deleteMonitorGroup, getMonitorNotificationsSchema, getMonitorNotifications, saveMonitorNotificationsSchema, saveMonitorNotifications } from "./tools/monitor-groups.js";
import { aiSearchSubmitImageSchema, aiSearchSubmitImage, aiSearchImageStatusSchema, aiSearchImageStatus, aiSearchImageSummarySchema, aiSearchImageSummary, aiSearchImageAdsSchema, aiSearchImageAds, aiSearchImageProductsSchema, aiSearchImageProducts, aiSearchImageStoresSchema, aiSearchImageStores, aiSearchImageTiktokProductsSchema, aiSearchImageTiktokProducts, aiSearchImageTiktokShopsSchema, aiSearchImageTiktokShops } from "./tools/ai-search.js";

export function createServer(): McpServer {
  const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
  const server = new McpServer({ name: "pipiads", version });
  const writes = new Set([
    "create_monitor_task", "cancel_monitor_task", "set_monitor_task_group",
    "create_monitor_group", "update_monitor_group", "delete_monitor_group",
    "save_monitor_notifications", "ai_search_submit_image",
  ]);
  const destructive = new Set([
    "cancel_monitor_task", "set_monitor_task_group", "update_monitor_group",
    "delete_monitor_group", "save_monitor_notifications",
  ]);

  function register<T extends z.AnyZodObject>(name: string, description: string, schema: T, fn: (params: z.infer<T>) => Promise<string>) {
    server.registerTool(name, {
      description,
      inputSchema: schema.strict(),
      outputSchema: { data: z.unknown() },
      annotations: {
        readOnlyHint: !writes.has(name),
        destructiveHint: destructive.has(name),
        idempotentHint: !writes.has(name),
        openWorldHint: true,
      },
    }, async (params, extra) => {
      try {
        const parsed = schema.strict().parse(params);
        validateRanges(parsed);
        const text = await withRequestSignal(extra.signal, () => fn(parsed));
        return { content: [{ type: "text" as const, text }], structuredContent: { data: JSON.parse(text) } };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
      }
    });
  }

  // ===== Ad Spy =====
  register("search_ads", "Search TikTok/Facebook ads. Use extend_keywords for text; filter by AI creative type, active state, region, engagement, spend and dates. 1 credit per result.", searchAdsSchema, searchAds);
  register("get_ad_detail", "Get detailed info for a specific ad by video ID. 1 credit (free if queried within 3 days).", getAdDetailSchema, getAdDetail);

  // ===== Ad Products =====
  register("search_products", "Search e-commerce products advertised on TikTok/Facebook. Filter by keyword, price, category, region, ad metrics. 1 credit per result.", searchProductsSchema, searchProducts);
  register("get_product_detail", "Get product detail including images, price, landing page, Shopify data. 1 credit (free if queried within 3 days).", getProductDetailSchema, getProductDetail);

  // ===== Ad Library Products (Meta/Facebook) =====
  register("search_adlibrary_products", "Search Meta Ad Library products. Filter by price, platform, ad status, active days. 1 credit per result.", searchAdlibraryProductsSchema, searchAdlibraryProducts);
  register("get_adlibrary_product_detail", "Get Meta Ad Library product detail with store and advertiser info. 1 credit.", getAdlibraryProductDetailSchema, getAdlibraryProductDetail);

  // ===== TikTok Shop Products =====
  register("search_tiktok_products", "Search TikTok Shop products by sales, GMV, price, trends, influencers. Requires sort, sort_type, time. 1 credit per result.", searchTiktokProductsSchema, searchTiktokProducts);
  register("get_tiktok_product_detail", "Get TikTok Shop product detail. 1 credit (free if queried within 3 days).", getTiktokProductDetailSchema, getTiktokProductDetail);

  // ===== TikTok Shop Stores =====
  register("search_tiktok_shops", "Search TikTok Shop stores by sales, GMV, product count, influencers.", searchTiktokShopsSchema, searchTiktokShops);
  register("get_tiktok_shop_detail", "Get TikTok Shop store detail by ID.", getTiktokShopDetailSchema, getTiktokShopDetail);

  // ===== Advertisers & Stores =====
  register("search_advertisers", "Search advertiser leaderboard. Filter by platform, region, ad metrics, monthly visits.", searchAdvertisersSchema, searchAdvertisers);
  register("get_advertiser_detail", "Get advertiser detail by ID. Returns domain, ad count, products, region distribution.", getAdvertiserDetailSchema, getAdvertiserDetail);
  register("search_stores", "Search store ranking list. Filter by platform, region, ad metrics, monthly visits.", searchStoresSchema, searchStores);
  register("get_store_detail", "Get store detail by 13-char store ID.", getStoreDetailSchema, getStoreDetail);

  // ===== Store Analysis =====
  register("get_store_competition", "Get store competition product options for analysis.", getStoreCompetitionSchema, getStoreCompetition);
  register("get_store_data_analysis", "Get store all-platform data analysis (TikTok, Facebook, Meta).", getStoreDataAnalysisSchema, getStoreDataAnalysis);
  register("get_store_play_cost", "Get store play cost / daily ad increment statistics.", getStorePlayCostSchema, getStorePlayCost);
  register("get_store_region_analysis", "Get store regional ad distribution analysis.", getStoreRegionAnalysisSchema, getStoreRegionAnalysis);
  register("get_store_ad_copy_analysis", "Get store TikTok ad copy analysis with pagination.", getStoreAdCopyAnalysisSchema, getStoreAdCopyAnalysis);
  register("get_store_ad_schedule", "Get store ad campaign schedule.", getStoreAdScheduleSchema, getStoreAdSchedule);
  register("get_store_product_analysis", "Get store product analysis.", getStoreProductAnalysisSchema, getStoreProductAnalysis);
  register("get_store_rank_data", "Get store traffic ranking data.", getStoreRankDataSchema, getStoreRankData);
  register("get_store_ad_trend", "Get store Meta Ad Library ad trend analysis. Requires start_time and end_time.", getStoreAdTrendSchema, getStoreAdTrend);
  register("get_store_delivery_analysis", "Get store Meta Ad Library in-depth delivery analysis.", getStoreDeliveryAnalysisSchema, getStoreDeliveryAnalysis);
  register("get_store_longest_run_ads", "Get store longest-running ad content from Meta Ad Library.", getStoreLongestRunAdsSchema, getStoreLongestRunAds);
  register("get_store_most_used_ads", "Get store most-used ad content from Meta Ad Library.", getStoreMostUsedAdsSchema, getStoreMostUsedAds);
  register("get_store_fb_pages", "Get store Facebook advertiser pages from Meta Ad Library.", getStoreFbPagesSchema, getStoreFbPages);

  // ===== Meta Ad Library =====
  register("search_lib_ads", "Search Meta Ad Library ads. Filter by content, platform, status, cost, reach, active days.", searchLibAdsSchema, searchLibAds);
  register("get_lib_ad_detail", "Get Meta Ad Library ad detail by ID.", getLibAdDetailSchema, getLibAdDetail);

  // ===== Rankings =====
  register("get_product_ranking", "Get ad product ranking list. Requires sort_key, sort_type, time, type.", getProductRankingSchema, getProductRanking);
  register("get_new_product_ranking", "Get new ad product ranking list. Requires found_time, sort_key, sort_type, type.", getNewProductRankingSchema, getNewProductRanking);
  register("get_app_ranking", "Get top apps ranking list.", getAppRankingSchema, getAppRanking);
  register("get_new_app_ranking", "Get new apps ranking list.", getNewAppRankingSchema, getNewAppRanking);
  register("get_app_dev_ranking", "Get top app developers ranking list.", getAppDevRankingSchema, getAppDevRanking);

  // ===== Apps =====
  register("search_apps", "Search apps advertised on TikTok/Facebook. Filter by category, system, downloads, revenue.", searchAppsSchema, searchApps);
  register("get_app_detail", "Get app detail by ID.", getAppDetailSchema, getAppDetail);
  register("search_app_developers", "Search app developers. Filter by app count, downloads, revenue.", searchAppDevelopersSchema, searchAppDevelopers);
  register("get_app_developer_detail", "Get app developer detail by ID.", getAppDeveloperDetailSchema, getAppDeveloperDetail);

  // ===== Natural Traffic Videos =====
  register("search_natural_videos", "Search TikTok Made Me Buy It / natural traffic videos. Filter by plays, likes, followers.", searchNaturalVideosSchema, searchNaturalVideos);

  // ===== Ad Monitor =====
  register("search_fb_advertisers", "Search Facebook advertisers by name (for creating monitor tasks).", searchFbAdvertisersSchema, searchFbAdvertisers);
  register("create_monitor_task", "Create Facebook advertiser or store/website monitoring tasks. Supply exactly one target list, max 50. 1 credit per successful creation. Does not monitor TikTok.", createMonitorTaskSchema, createMonitorTask);
  register("list_monitor_tasks", "List all ad monitoring tasks with optional filters.", listMonitorTasksSchema, listMonitorTasks);
  register("get_monitor_task_detail", "Get monitor task detail by task ID.", getMonitorTaskDetailSchema, getMonitorTaskDetail);
  register("cancel_monitor_task", "Cancel an ad monitoring task.", cancelMonitorTaskSchema, cancelMonitorTask);
  register("get_monitor_board", "Get monitoring task overview dashboard.", getMonitorBoardSchema, getMonitorBoard);
  register("set_monitor_task_group", "Assign a monitor task to a group.", setMonitorTaskGroupSchema, setMonitorTaskGroup);
  register("get_monitor_realtime_overview", "Get real-time overview of a monitor task.", getMonitorRealtimeOverviewSchema, getMonitorRealtimeOverview);
  register("get_monitor_daily_overview", "Get daily overview of a monitor task.", getMonitorDailyOverviewSchema, getMonitorDailyOverview);
  register("get_monitor_landing_pages_overview", "Get landing pages overview for a monitor task.", getMonitorLandingPagesOverviewSchema, getMonitorLandingPagesOverview);
  register("get_monitor_latest_products", "Get latest ad products discovered by a monitor task.", getMonitorLatestProductsSchema, getMonitorLatestProducts);
  register("get_monitor_product_list", "Get ad product list for a monitor task with filters.", getMonitorProductListSchema, getMonitorProductList);
  register("get_monitor_landing_page_list", "Get landing page list for a monitor task.", getMonitorLandingPageListSchema, getMonitorLandingPageList);
  register("get_monitor_ad_count_stats", "Get ad count statistics for a monitor task.", getMonitorAdCountStatsSchema, getMonitorAdCountStats);
  register("get_monitor_deep_analysis", "Get deep campaign analysis for a monitor task.", getMonitorDeepAnalysisSchema, getMonitorDeepAnalysis);
  register("get_monitor_most_used_copy", "Get most-used ad copy for a monitor task.", getMonitorMostUsedCopySchema, getMonitorMostUsedCopy);
  register("get_monitor_longest_run_copy", "Get longest-running ad copy for a monitor task.", getMonitorLongestRunCopySchema, getMonitorLongestRunCopy);
  register("get_monitor_ad_list", "Get ad list for a monitor task with extensive filters.", getMonitorAdListSchema, getMonitorAdList);
  register("get_monitor_ad_detail", "Get ad detail from a monitor task by ad ID.", getMonitorAdDetailSchema, getMonitorAdDetail);
  register("get_monitor_product_stats", "Get active ad product statistics for a monitor task.", getMonitorProductStatsSchema, getMonitorProductStats);

  // ===== Monitor Groups & Notifications =====
  register("create_monitor_group", "Create a new monitor task group.", createMonitorGroupSchema, createMonitorGroup);
  register("list_monitor_groups", "List all monitor task groups.", listMonitorGroupsSchema, listMonitorGroups);
  register("update_monitor_group", "Update a monitor group name.", updateMonitorGroupSchema, updateMonitorGroup);
  register("delete_monitor_group", "Delete a monitor group.", deleteMonitorGroupSchema, deleteMonitorGroup);
  register("get_monitor_notifications", "Get current notification settings.", getMonitorNotificationsSchema, getMonitorNotifications);
  register("save_monitor_notifications", "Save notification settings (email, instant alerts, reports).", saveMonitorNotificationsSchema, saveMonitorNotifications);

  // ===== AI Image Search =====
  register("ai_search_submit_image", "Submit exactly one public image URL or Base64 image for visual search. Free. Returns an image ID string; poll status before fetching results.", aiSearchSubmitImageSchema, aiSearchSubmitImage);
  register("ai_search_image_status", "Check processing status of a submitted image search.", aiSearchImageStatusSchema, aiSearchImageStatus);
  register("ai_search_image_summary", "Get result summary of an AI image search.", aiSearchImageSummarySchema, aiSearchImageSummary);
  register("ai_search_image_ads", "Search ads similar to a submitted image.", aiSearchImageAdsSchema, aiSearchImageAds);
  register("ai_search_image_products", "Search products similar to a submitted image.", aiSearchImageProductsSchema, aiSearchImageProducts);
  register("ai_search_image_stores", "Search stores/advertisers similar to a submitted image.", aiSearchImageStoresSchema, aiSearchImageStores);
  register("ai_search_image_tiktok_products", "Search TikTok Shop products similar to a submitted image.", aiSearchImageTiktokProductsSchema, aiSearchImageTiktokProducts);
  register("ai_search_image_tiktok_shops", "Search TikTok shops similar to a submitted image.", aiSearchImageTiktokShopsSchema, aiSearchImageTiktokShops);

  return server;
}
