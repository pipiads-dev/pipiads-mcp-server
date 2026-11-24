import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../dist/server.js";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jrXkAAAAASUVORK5CYII=";
let client;
let server;
let requests;

function success(data = { items: [] }) {
  return new Response(JSON.stringify({ code: 200, message: "success", data, success: true, fail: false }), {
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(async () => {
  process.env.PIPIADS_API_KEY = "contract-test-key";
  process.env.PIPIADS_BASE_URL = "https://gateway.invalid/";
  process.env.PIPIADS_TIMEOUT_MS = "1000";
  requests = [];
  globalThis.fetch = async (url, options) => {
    // Use the native Request serializer/parser, including its multipart boundary.
    const request = new Request(url, options);
    const multipart = request.headers.get("content-type")?.startsWith("multipart/form-data;");
    const body = multipart ? await request.formData() : await request.json();
    requests.push({ url: request.url, method: request.method, headers: request.headers, body });
    return success();
  };
  [server, client] = [createServer(), new Client({ name: "contract-tests", version: "1.0.0" })];
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client?.close();
  await server?.close();
  globalThis.fetch = originalFetch;
  for (const key of ["PIPIADS_API_KEY", "PIPIADS_BASE_URL", "PIPIADS_TIMEOUT_MS"]) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

async function call(name, args = {}) {
  return client.callTool({ name, arguments: args });
}

function assertError(result, pattern) {
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, pattern);
}

test("MCP exposes all tools, strict schemas, consistent version and read/write annotations", async () => {
  const { tools } = await client.listTools();
  assert.equal(tools.length, 73);
  assert.equal(new Set(tools.map(tool => tool.name)).size, 73);
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(client.getServerVersion().version, pkg.version);
  for (const tool of tools) {
    assert.equal(tool.inputSchema.additionalProperties, false, tool.name);
    assert.ok(tool.outputSchema, tool.name);
    assert.equal(typeof tool.annotations.readOnlyHint, "boolean", tool.name);
  }
  assert.equal(tools.find(tool => tool.name === "search_ads").annotations.readOnlyHint, true);
  assert.equal(tools.find(tool => tool.name === "create_monitor_task").annotations.idempotentHint, false);
  assert.equal(tools.find(tool => tool.name === "delete_monitor_group").annotations.destructiveHint, true);
});

test("the packaged CLI entry starts over stdio without writing logs to protocol stdout", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [new URL("../dist/index.js", import.meta.url).pathname],
    env: { PIPIADS_API_KEY: "", PIPIADS_BASE_URL: "https://gateway.invalid" },
    stderr: "pipe",
  });
  const cli = new Client({ name: "stdio-smoke", version: "1.0.0" });
  try {
    await cli.connect(transport);
    assert.equal((await cli.listTools()).tools.length, 73);
    assertError(await cli.callTool({ name: "search_ads", arguments: {} }), /PIPIADS_API_KEY/);
  } finally {
    await cli.close();
  }
});

test("all 26 monitoring tools use the monitor gateway; searches keep the data gateway", async () => {
  const samples = {
    search_fb_advertisers: { name: "Example" },
    create_monitor_task: { facebook_page_id_list: ["page-1"] },
    list_monitor_tasks: {},
    get_monitor_task_detail: { task_id: "task-1" },
    cancel_monitor_task: { task_id: "task-1" },
    get_monitor_board: {},
    set_monitor_task_group: { task_id: "task-1", group_id: "group-1" },
    get_monitor_realtime_overview: { task_id: "task-1" },
    get_monitor_daily_overview: { task_id: "task-1", date: 1792080000 },
    get_monitor_landing_pages_overview: { task_id: "task-1" },
    get_monitor_latest_products: { task_id: "task-1" },
    get_monitor_product_list: { task_id: "task-1" },
    get_monitor_landing_page_list: { task_id: "task-1" },
    get_monitor_ad_count_stats: { task_id: "task-1" },
    get_monitor_deep_analysis: { task_id: "task-1", dimension: 1 },
    get_monitor_most_used_copy: { task_id: "task-1" },
    get_monitor_longest_run_copy: { task_id: "task-1" },
    get_monitor_ad_list: { task_id: "task-1" },
    get_monitor_ad_detail: { ad_id: "ad-1" },
    get_monitor_product_stats: { task_id: "task-1" },
    create_monitor_group: { name: "Competitors" },
    list_monitor_groups: {},
    update_monitor_group: { group_id: "group-1", name: "Competitors" },
    delete_monitor_group: { group_id: "group-1" },
    get_monitor_notifications: {},
    save_monitor_notifications: { notification_email: "test@example.com", notification_status: 2, instant_ad_notification: 2, instant_product_notification: 2, daily_report: 2, weekly_report: 2 },
  };
  for (const [name, args] of Object.entries(samples)) {
    const result = await call(name, args);
    assert.notEqual(result.isError, true, `${name}: ${JSON.stringify(result)}`);
    assert.equal(requests.at(-1).url, "https://gateway.invalid/open-api/v1/monitor/data", name);
    assert.equal(requests.at(-1).method, "POST");
    assert.equal(requests.at(-1).body.key, "contract-test-key");
    assert.deepEqual(result.structuredContent, { data: { items: [] } });
    assert.deepEqual(JSON.parse(result.content[0].text), { items: [] });
  }
  assert.equal(requests.length, 26);
  await call("search_ads", { page_size: 1 });
  assert.equal(requests.at(-1).url, "https://gateway.invalid/open-api/v1/data");
});

test("monitor creation supports documented lists and translates the legacy ID", async () => {
  for (const [field, value] of [
    ["facebook_page_id_list", ["page-1", "page-2"]],
    ["facebook_page_url_list", ["https://www.facebook.com/example"]],
    ["facebook_public_page_number_list", ["123456"]],
    ["facebook_shop_url_list", ["https://store.example.com"]],
  ]) {
    assert.notEqual((await call("create_monitor_task", { [field]: value })).isError, true);
    assert.deepEqual(requests.at(-1).body.params, { [field]: value });
  }
  await call("create_monitor_task", { advertiser_id: "legacy-page" });
  assert.deepEqual(requests.at(-1).body.params, { facebook_page_id_list: ["legacy-page"] });
});

test("invalid monitor inputs are rejected before any paid request", async () => {
  for (const args of [{}, { facebook_page_id_list: [] }, { facebook_page_id_list: [""] },
    { facebook_page_id_list: Array(51).fill("page") },
    { advertiser_id: "page", facebook_page_id_list: ["page"] },
    { facebook_shop_url_list: ["not a URL"] }]) {
    assert.equal((await call("create_monitor_task", args)).isError, true, JSON.stringify(args));
  }
  assertError(await call("save_monitor_notifications", {
    notification_email: "test@example.com", notification_status: 0,
    instant_ad_notification: 1, instant_product_notification: 1, daily_report: 1, weekly_report: 1,
  }), /notification_status/);
  assert.equal(requests.length, 0);
});

test("image URLs use the URL route and return the upstream image ID", async () => {
  const fetch = globalThis.fetch;
  globalThis.fetch = async (...args) => { await fetch(...args); return success("img_test"); };
  const result = await call("ai_search_submit_image", { image_url: "https://example.com/image.png" });
  assert.equal(requests[0].body.uri, "/v3/api/open/ai-search/image/submit/image-url");
  assert.deepEqual(requests[0].body.params, { image_url: "https://example.com/image.png" });
  assert.equal(result.structuredContent.data, "img_test");
});

test("raw Base64 and data URLs are sent as multipart files with intact bytes", async () => {
  for (const image_data of [png, `data:image/png;base64,${png}`]) {
    const result = await call("ai_search_submit_image", { image_data });
    assert.notEqual(result.isError, true, JSON.stringify(result));
    const request = requests.at(-1);
    assert.equal(request.url, "https://gateway.invalid/open-api/v1/upload-file");
    assert.match(request.headers.get("content-type"), /^multipart\/form-data; boundary=/);
    assert.equal(request.body.get("key"), "contract-test-key");
    assert.equal(request.body.get("uri"), "/v3/api/open/ai-search/image/submit");
    const file = request.body.get("image_data");
    assert.equal(file.name, "image.png");
    assert.equal(file.type, "image/png");
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), Buffer.from(png, "base64"));
  }
});

test("empty, conflicting, malformed and oversized images never reach the API", async () => {
  for (const args of [{}, { image_data: "" }, { image_url: "file:///tmp/image.png" },
    { image_url: "invalid" }, { image_url: "https://example.com/a.png", image_data: png },
    { image_data: "not base64!" }, { image_data: Buffer.from("not an image").toString("base64") },
    { image_data: `data:image/jpeg;base64,${png}` },
    { image_data: "A".repeat(4 * Math.ceil(10 * 1024 * 1024 / 3) + 204) }]) {
    assert.equal((await call("ai_search_submit_image", args)).isError, true);
  }
  assert.equal(requests.length, 0);
});

test("ad keywords, AI filters, exclusion and the full cursor survive MCP validation", async () => {
  const args = {
    extend_keywords: [{ type: 1, keyword: "phone case" }],
    exclude_word: [{ type: 2, keyword: "used" }], aigc_type: "-1", ad_state: 1,
    is_and: true, sort: 999, after: [921.20715, "video-1"], page_size: 2,
  };
  assert.notEqual((await call("search_ads", args)).isError, true);
  assert.deepEqual(requests[0].body.params, { current_page: 1, ...args });
});

test("unknown fields, invalid enums, pagination and inverted ranges fail locally", async () => {
  for (const [name, args] of [
    ["search_ads", { keyword: "would have been silently dropped" }],
    ["search_ads", { plat_type: 999 }], ["search_ads", { sort_type: "sideways" }],
    ["search_ads", { aigc_type: "3" }], ["search_ads", { page_size: 51 }],
    ["search_ads", { play_count_min: 100, play_count_max: 1 }],
    ["search_ads", { create_time_start: 100, create_time_end: 1 }],
    ["list_monitor_tasks", { page: -2.5 }], ["list_monitor_tasks", { per_page: 1000000 }],
    ["get_monitor_product_list", { task_id: "task", min_price: 20, max_price: 1 }],
    ["get_store_data_analysis", { id: "store", start_time: 100, end_time: 1 }],
    ["ai_search_image_products", { image_id: "image", page_size: 0 }],
    ["get_ad_detail", { id: " " }],
  ]) assert.equal((await call(name, args)).isError, true, `${name}: ${JSON.stringify(args)}`);
  assert.equal(requests.length, 0);
});

test("negative growth filters remain usable for finding declining products", async () => {
  const result = await call("get_product_ranking", {
    current_page: 1, page_size: 1, sort_key: "growth_rate", sort_type: "asc", time: 1792080000, type: 1,
    growth_rate_min: -0.8, growth_rate_max: -0.1, count_growth_min: -100, count_growth_max: -1,
  });
  assert.notEqual(result.isError, true, JSON.stringify(result));
  assert.equal(requests[0].body.params.growth_rate_min, -0.8);
  assert.equal(requests[0].body.params.count_growth_min, -100);
});

test("upstream HTTP, business and malformed responses become errors without retries", async () => {
  for (const [response, pattern] of [
    [new Response("rate limited", { status: 429, headers: { "Retry-After": "5" } }), /HTTP 429.*Retry-After: 5/],
    [new Response(JSON.stringify({ code: 403, message: "Insufficient credits", data: null })), /API Error 403: Insufficient credits/],
    [new Response(JSON.stringify({ code: 200, data: null, success: false })), /API Error 200/],
    [new Response(JSON.stringify({ code: 200 })), /missing data/],
    [new Response(JSON.stringify({ data: [] })), /Invalid API response/],
    [new Response("not JSON"), /JSON/],
  ]) {
    let attempts = 0;
    globalThis.fetch = async () => { attempts++; return response; };
    assertError(await call("search_ads"), pattern);
    assert.equal(attempts, 1);
  }
});

test("missing credentials fail before making a request", async () => {
  delete process.env.PIPIADS_API_KEY;
  assertError(await call("search_ads"), /PIPIADS_API_KEY/);
  assert.equal(requests.length, 0);
});

test("configured timeout aborts a stalled upstream request", async () => {
  process.env.PIPIADS_TIMEOUT_MS = "20";
  let aborted = false;
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => { aborted = true; reject(signal.reason); }, { once: true });
  });
  // Keep the test alive while the production timeout deliberately uses unref().
  const result = await Promise.race([call("search_ads"), delay(1000).then(() => { throw new Error("Request did not time out"); })]);
  assertError(result, /timed out after 20 ms/);
  assert.equal(aborted, true);
});

test("the request timeout also covers a stalled response body", async () => {
  process.env.PIPIADS_TIMEOUT_MS = "20";
  globalThis.fetch = async (_url, { signal }) => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"code":200,"data":'));
        signal.addEventListener("abort", () => controller.error(signal.reason), { once: true });
      },
    });
    return new Response(body);
  };
  const result = await Promise.race([call("search_ads"), delay(1000).then(() => { throw new Error("Body did not time out"); })]);
  assertError(result, /timed out after 20 ms/);
});

test("MCP cancellation aborts only its own concurrent upstream request", async () => {
  let started;
  const pending = new Promise(resolve => { started = resolve; });
  let aborted;
  const cancelled = new Promise(resolve => { aborted = resolve; });
  let otherStarted;
  const otherPending = new Promise(resolve => { otherStarted = resolve; });
  let finishOther;
  let otherSignal;
  globalThis.fetch = async (_url, { body, signal }) => {
    if (JSON.parse(body).params.id === "pending") {
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => { aborted(); reject(signal.reason); }, { once: true });
        started();
      });
    }
    otherSignal = signal;
    return new Promise(resolve => {
      finishOther = () => resolve(success({ id: "other" }));
      otherStarted();
    });
  };
  const controller = new AbortController();
  const request = client.callTool({ name: "get_ad_detail", arguments: { id: "pending" } }, undefined, { signal: controller.signal });
  const rejected = assert.rejects(request);
  const otherRequest = call("get_ad_detail", { id: "other" });
  await Promise.all([pending, otherPending]);
  controller.abort();
  await rejected;
  await Promise.race([cancelled, delay(500).then(() => { throw new Error("Upstream was not cancelled"); })]);
  assert.equal(otherSignal.aborted, false);
  finishOther();
  const other = await otherRequest;
  assert.deepEqual(other.structuredContent.data, { id: "other" });
});
