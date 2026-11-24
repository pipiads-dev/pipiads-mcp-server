# PipiAds MCP and Agent Skills

Research TikTok and Facebook ads, products, stores and competitors. The server exposes 73 MCP tools over local stdio. The ten skills below guide common research workflows.

## Connect the data source

Use Node.js 20 or later. Obtain your Open API key and credits from [Pipispy](https://www.pipispy.com/). In your MCP client, add the following configuration and enter your key in your local settings. Restart the server and list its tools. Listing tools does not query advertising data.

```json
{
  "mcpServers": {
    "pipiads": {
      "command": "npx",
      "args": [
        "-y",
        "pipiads-mcp-server@1.0.5"
      ],
      "env": {
        "PIPIADS_API_KEY": "<YOUR_PIPIADS_API_KEY>"
      }
    }
  }
}
```

For a first query, ask “Find one US TikTok ad about phone cases and show its source.” Paid list endpoints can charge per result. Detail queries, image search and monitoring use endpoint-specific pricing. Creating monitoring tasks or changing notifications changes your account. Persistent monitoring covers Facebook advertisers and stores or websites. Compare TikTok activity with dated searches.

## Install a skill

Run `npx skills add pipiads-dev/pipiads-mcp-server --list` to see the available skills. Install the general research skill with `npx skills add pipiads-dev/pipiads-mcp-server --skill pipiads`. Choose a specific skill by using its name from the table. Configure the MCP server in your client to run online research. See [PipiAds setup](https://www.pipiads.com/mcp).

| Research skill | Installation name | Publisher listing |
|---|---|---|
| Adspy & Ad Library: TikTok & Facebook | `adspy-ad-library-tiktok-facebook` | [ClawHub](https://clawhub.ai/fanyanggod/skills/adspy-ad-library-tiktok-facebook) |
| PipiAds Dropshipping Product Research | `dropshipping-product-research` | [ClawHub](https://clawhub.ai/fanyanggod/skills/pipiads-dropshipping-product-research) |
| Ecommerce Product Research | `ecommerce-product-research` | [ClawHub](https://clawhub.ai/fanyanggod/skills/ecommerce-product-research) |
| Facebook Ad Tracker & Monitor | `facebook-ad-tracker-monitor` | [ClawHub](https://clawhub.ai/fanyanggod/skills/facebook-ad-tracker-monitor) |
| Facebook Adspy & Facebook Ad Library | `facebook-adspy-facebook-ad-library` | [ClawHub](https://clawhub.ai/fanyanggod/skills/facebook-adspy-facebook-ad-library) |
| PipiAds - TikTok & Facebook Adspy Intelligence | `pipiads` | [ClawHub](https://clawhub.ai/fanyanggod/skills/pipiads) |
| TikTok Ad Library & TikTok Creative Center & TikTok Ads   Examples & TikTok Top Ads | `tiktok-ad-library-creative-center-ads-examples-top-ads` | [ClawHub](https://clawhub.ai/fanyanggod/skills/tiktok-ad-library-creative-center-ads-examples-top-ads) |
| TikTok Ad Tracker & Monitor | `tiktok-ad-tracker-monitor` | [ClawHub](https://clawhub.ai/fanyanggod/skills/tiktok-ad-tracker-monitor) |
| TikTok Made Me Buy It | `tiktok-made-me-buy-it` | [ClawHub](https://clawhub.ai/fanyanggod/skills/tiktok-made-me-buy-it) |
| TikTok Shop Ad Library & TikTok Shop Analytics | `tiktok-shop-ad-library-analytics` | [ClawHub](https://clawhub.ai/fanyanggod/skills/tiktok-shop-ad-library-analytics) |

## Build from source

Run `npm ci`, `npm run typecheck` and `npm test`. Tests use a simulated API. Start the compiled server with `node dist/index.js`.
