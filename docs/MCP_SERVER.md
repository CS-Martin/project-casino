# Casino Intelligence MCP Server

This document explains how to use the Model Context Protocol (MCP) server integrated into your Casino Intelligence Platform.

## Overview

The MCP server exposes your Convex database through a standardized protocol that AI assistants can use to answer questions about casinos, offers, and system statistics.

## Available Tools

### 1. Casino Information

#### `get-casino-stats`

Get overall casino statistics including total casinos, tracked/untracked counts, and coverage metrics.

**Parameters:** None

**Example Response:**

```json
{
  "total": 150,
  "tracked": 105,
  "untracked": 45,
  "coverageGapPercentage": 30
}
```

#### `search-casinos`

Search for casinos by name, state, website, or license status.

**Parameters:**

- `query` (string, required): Search query
- `limit` (number, optional, default: 10): Maximum number of results

**Example:**

```
Query: "New Jersey"
```

#### `get-casino-details`

Get detailed information about a specific casino including all its offers.

**Parameters:**

- `casinoId` (string, required): The casino ID

**Returns:**

- Casino information
- State information
- Active, expired, and deprecated offers
- Statistics (avg bonus, wagering requirements, etc.)

#### `get-casinos-by-state`

Get casino distribution across different states with tracked/untracked breakdown.

**Parameters:** None

### 2. Offer Information

#### `get-offer-kpis`

Get key performance indicators for offers.

**Returns:**

- Total offers
- Active offers count
- Casinos with offers percentage
- Offers researched today

#### `get-offer-timeline`

Get timeline of research activity over a specified period.

**Parameters:**

- `timeRange` (enum, optional, default: "30d"): One of "7d", "30d", or "90d"

**Returns:** Daily breakdown of:

- New offers created
- Expired offers
- Research runs
- Casinos researched

#### `get-offer-types`

Get breakdown of different offer types with counts and percentages.

**Returns:**

```json
[
  {
    "offerType": "welcome_bonus",
    "count": 45,
    "percentage": 60
  },
  ...
]
```

#### `get-best-offers`

Get the best current promotional offers sorted by value.

**Parameters:**

- `limit` (number, optional, default: 10): Maximum number of offers to return

### 3. AI Usage & Logs

#### `get-ai-usage-stats`

Get AI usage statistics including costs, tokens, and success rates.

**Parameters:**

- `hours` (number, optional, default: 24): Number of hours to look back

**Returns:**

- Total calls, tokens, and costs
- Breakdown by operation
- Breakdown by model
- Success rates

#### `get-discovery-logs`

Get casino discovery log entries.

**Parameters:**

- `limit` (number, optional, default: 20): Maximum number of log entries

#### `get-research-logs`

Get offer research log entries.

**Parameters:**

- `limit` (number, optional, default: 20): Maximum number of log entries

### 4. System Actions

#### `trigger-casino-discovery`

Trigger the AI-powered casino discovery process.

**Parameters:**

- `state` (string, optional): State abbreviation (e.g., "NJ", "PA")

**Warning:** This triggers an AI operation that will incur costs.

#### `trigger-offer-research`

Trigger offer research for a batch of casinos.

**Parameters:**

- `batchSize` (number, optional, default: 30): Number of casinos to research

**Warning:** This triggers an AI operation that will incur costs.

## Endpoints

The MCP server is accessible via:

- **SSE Endpoint**: `https://your-domain.com/sse`
- **HTTP Streaming**: `https://your-domain.com/mcp`

## Integration Examples

### Using with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "casino-intelligence": {
      "url": "https://your-domain.com/sse"
    }
  }
}
```

### Using with Custom Chatbot

See the example chatbot component in `src/features/chatbot/components/chatbot-widget.tsx`.

## Common Use Cases

### Ask about casino statistics:

- "How many casinos are tracked?"
- "Show me the casino distribution by state"
- "What's our coverage gap percentage?"

### Search for specific casinos:

- "Find all casinos in New Jersey"
- "Search for DraftKings"
- "Show me licensed casinos"

### Get offer information:

- "What are the best current offers?"
- "Show me offer statistics"
- "What types of offers do we have?"

### Monitor AI usage:

- "How much did we spend on AI today?"
- "Show me AI usage in the last 24 hours"
- "What's the success rate of our AI operations?"

### Trigger operations:

- "Discover new casinos in Pennsylvania"
- "Research offers for 30 casinos"

## Security Considerations

⚠️ **Important:** The current implementation has no authentication. Before deploying to production:

1. Add API authentication to the MCP endpoints
2. Implement rate limiting
3. Add user authorization for triggering operations
4. Monitor and log all MCP requests

## Troubleshooting

### "Failed to fetch" errors

- Ensure `NEXT_PUBLIC_URL` is set correctly
- Check that your API routes are accessible
- Verify Convex is connected

### "Invalid casinoId" errors

- Use the `search-casinos` tool first to get valid IDs
- Casino IDs are in the format returned by Convex (e.g., "k7...")

### Empty results

- Check if data exists in your database
- Verify time ranges for timeline queries
- Ensure filters are not too restrictive
