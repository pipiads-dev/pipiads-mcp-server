#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  await createServer().connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
