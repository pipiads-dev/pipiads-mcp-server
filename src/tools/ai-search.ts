import { z } from "zod";
import { callPipiAdsApi, uploadPipiAdsImage } from "../client.js";
import { httpUrl, nonEmptyString, pageNumber, pageSize, platform, sortDirection } from "../validation.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const aiSearchSubmitImageSchema = z.object({
  image_url: httpUrl.optional().describe("Public HTTP/HTTPS image URL. Provide exactly one of image_url or image_data."),
  image_data: z.string().min(1).max(4 * Math.ceil(MAX_IMAGE_BYTES / 3) + 200).optional().describe("Base64 image bytes or image data URL (JPEG, PNG, GIF, BMP, WebP; max 10 MiB). Sent as a multipart file. Do not also supply image_url."),
});

export async function aiSearchSubmitImage(params: z.infer<typeof aiSearchSubmitImageSchema>): Promise<string> {
  if (Boolean(params.image_url) === Boolean(params.image_data)) {
    throw new Error("Provide exactly one of image_url or image_data");
  }
  const result = params.image_url
    ? await callPipiAdsApi("/v3/api/open/ai-search/image/submit/image-url", { image_url: params.image_url })
    : await uploadImage(params.image_data!);
  return JSON.stringify(result.data, null, 2);
}

async function uploadImage(value: string) {
  const dataUrl = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s.exec(value);
  const base64 = (dataUrl ? dataUrl[2] : value).replace(/\s/g, "");
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error("image_data must contain valid standard Base64 image bytes");
  }
  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || bytes.toString("base64") !== base64) {
    throw new Error("image_data must be valid Base64 and decode to between 1 byte and 10 MiB");
  }
  let format: string;
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) format = "png";
  else if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) format = "jpeg";
  else if (["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString())) format = "gif";
  else if (bytes.subarray(0, 2).toString() === "BM") format = "bmp";
  else if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") format = "webp";
  else throw new Error("image_data must be a JPEG, PNG, GIF, BMP or WebP image");
  if (dataUrl && dataUrl[1].toLowerCase().replace("image/jpg", "image/jpeg") !== `image/${format}`) {
    throw new Error("Image data URL MIME type does not match its image bytes");
  }
  return uploadPipiAdsImage(new Blob([new Uint8Array(bytes)], { type: `image/${format}` }), `image.${format}`);
}

export const aiSearchImageStatusSchema = z.object({
  image_id: nonEmptyString.describe("Image ID from submit response"),
});

export async function aiSearchImageStatus(params: z.infer<typeof aiSearchImageStatusSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/status", params);
  return JSON.stringify(result.data, null, 2);
}

export const aiSearchImageSummarySchema = z.object({
  image_id: nonEmptyString.describe("Image ID from submit response"),
});

export async function aiSearchImageSummary(params: z.infer<typeof aiSearchImageSummarySchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/resultSummary", params);
  return JSON.stringify(result.data, null, 2);
}

// Shared pagination for AI search result tools
const aiSearchPaginationSchema = {
  image_id: nonEmptyString.describe("Image ID from submit response"),
  current_page: pageNumber.optional().default(1).describe("Page number"),
  page_size: pageSize.optional().default(20).describe("Results per page"),
};

export const aiSearchImageAdsSchema = z.object({
  ...aiSearchPaginationSchema,
  sort: z.number().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
  plat_type: platform.optional().describe("Platform: 1=TikTok, 2=Facebook"),
  region: z.array(z.string()).optional().describe("Country/region filter"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  digg_count_min: z.number().finite().nonnegative().optional().describe("Minimum like count"),
  digg_count_max: z.number().finite().nonnegative().optional().describe("Maximum like count"),
  put_day_min: z.number().finite().nonnegative().optional().describe("Minimum delivery days"),
  put_day_max: z.number().finite().nonnegative().optional().describe("Maximum delivery days"),
  create_time_start: z.number().finite().nonnegative().optional().describe("Creation time start"),
  create_time_end: z.number().finite().nonnegative().optional().describe("Creation time end"),
});

export async function aiSearchImageAds(params: z.infer<typeof aiSearchImageAdsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/search4/ad/search", params);
  return JSON.stringify(result.data, null, 2);
}

export const aiSearchImageProductsSchema = z.object({
  ...aiSearchPaginationSchema,
  sort: z.string().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
  plat_type: platform.optional().describe("Platform: 0=All, 1=TikTok, 2=Facebook"),
  region: z.string().optional().describe("Country/region, comma-separated"),
  play_count_min: z.number().finite().nonnegative().optional().describe("Minimum play count"),
  play_count_max: z.number().finite().nonnegative().optional().describe("Maximum play count"),
  price_min: z.number().finite().nonnegative().optional().describe("Minimum price (USD)"),
  price_max: z.number().finite().nonnegative().optional().describe("Maximum price (USD)"),
});

export async function aiSearchImageProducts(params: z.infer<typeof aiSearchImageProductsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/product/search", params);
  return JSON.stringify(result.data, null, 2);
}

export const aiSearchImageStoresSchema = z.object({
  ...aiSearchPaginationSchema,
  sort: z.number().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
  data_type: z.number().int().min(0).max(3).optional().describe("Platform type"),
  region: z.array(z.string()).optional().describe("Country/region filter"),
});

export async function aiSearchImageStores(params: z.infer<typeof aiSearchImageStoresSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/root-path/search", params);
  return JSON.stringify(result.data, null, 2);
}

export const aiSearchImageTiktokProductsSchema = z.object({
  ...aiSearchPaginationSchema,
  sort: z.number().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
  time: z.number().optional().describe("Time range"),
  region: z.string().optional().describe("Country/region"),
});

export async function aiSearchImageTiktokProducts(params: z.infer<typeof aiSearchImageTiktokProductsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/tiktok-product/search", params);
  return JSON.stringify(result.data, null, 2);
}

export const aiSearchImageTiktokShopsSchema = z.object({
  ...aiSearchPaginationSchema,
  sort: z.number().optional().describe("Sort field"),
  sort_type: sortDirection.optional().describe('"asc" or "desc"'),
  time: z.number().optional().describe("Time range"),
  region: z.string().optional().describe("Country/region"),
});

export async function aiSearchImageTiktokShops(params: z.infer<typeof aiSearchImageTiktokShopsSchema>): Promise<string> {
  const result = await callPipiAdsApi("/v3/api/open/ai-search/image/tiktok-shop/search", params);
  return JSON.stringify(result.data, null, 2);
}
