import { AsyncLocalStorage } from "node:async_hooks";
import { z } from "zod";

const requestSignals = new AsyncLocalStorage<AbortSignal>();
const responseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  data: z.unknown(),
  version: z.string().optional(),
  success: z.boolean().optional(),
  fail: z.boolean().optional(),
});

export type ApiResponse = z.infer<typeof responseSchema>;

// Keep concurrent calls' cancellation signals separate without changing every
// domain handler's signature.
export function withRequestSignal<T>(signal: AbortSignal, fn: () => Promise<T>): Promise<T> {
  return requestSignals.run(signal, fn);
}

function apiKey(): string {
  const key = process.env.PIPIADS_API_KEY;
  if (!key) {
    throw new Error("PIPIADS_API_KEY environment variable is required. Get your API key from https://www.pipispy.com");
  }
  return key;
}

async function request(endpoint: string, body: string | FormData): Promise<ApiResponse> {
  const timeoutMs = Number(process.env.PIPIADS_TIMEOUT_MS ?? 30_000);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new Error("PIPIADS_TIMEOUT_MS must be a positive integer up to 2147483647");
  }
  const baseUrl = (process.env.PIPIADS_BASE_URL || "https://www.pipispy.com").replace(/\/+$/, "");
  const parentSignal = requestSignals.getStore();
  const controller = new AbortController();
  const onAbort = () => controller.abort(parentSignal?.reason);
  parentSignal?.addEventListener("abort", onAbort, { once: true });
  if (parentSignal?.aborted) onAbort();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  timer.unref();

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}),
      },
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      const retryAfter = response.headers.get("retry-after");
      throw new Error(`HTTP ${response.status}: ${response.statusText}${retryAfter ? ` (Retry-After: ${retryAfter})` : ""}`);
    }
    const raw: unknown = await response.json();
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) throw new Error("Invalid API response: expected a JSON response with a numeric code");
    const result = parsed.data;
    if (result.code !== 200 || result.success === false || result.fail === true) {
      throw new Error(`API Error ${result.code}: ${result.message || "Unknown error"}`);
    }
    if (!Object.prototype.hasOwnProperty.call(raw, "data")) {
      throw new Error("Invalid API response: successful response is missing data");
    }
    return result;
  } catch (error) {
    if (parentSignal?.aborted) throw new Error("API request cancelled");
    if (timedOut) throw new Error(`API request timed out after ${timeoutMs} ms`);
    throw error;
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener("abort", onAbort);
  }
}

export async function callPipiAdsApi(uri: string, params: Record<string, unknown>): Promise<ApiResponse> {
  const isMonitor = /^\/v3\/api\/ad-monitor-(task|groups|notifications)\//.test(uri);
  return request(isMonitor ? "/open-api/v1/monitor/data" : "/open-api/v1/data", JSON.stringify({
    key: apiKey(), uri, params,
  }));
}

export async function uploadPipiAdsImage(image: Blob, filename: string): Promise<ApiResponse> {
  const form = new FormData();
  form.set("key", apiKey());
  form.set("uri", "/v3/api/open/ai-search/image/submit");
  form.set("image_data", image, filename);
  return request("/open-api/v1/upload-file", form);
}
