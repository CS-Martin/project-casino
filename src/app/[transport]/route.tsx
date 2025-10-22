import { createMcpHandler } from "@vercel/mcp-adapter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { z } from "zod";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * MCP Server for the application
 * @param server - The server instance
 * @returns The handler function
 */
const handler = createMcpHandler(server => {
    // Tool 1: Get casino statistics overview
    server.tool(
        "get-casino-stats",
        "Get overall casino statistics including total casinos, tracked/untracked counts, and coverage metrics",
        async () => {
            const stats = await convex.query(api.casinos.index.getCasinoStats);
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(stats, null, 2),
                }]
            }
        }
    );

    // Tool 2: Search casinos
    server.tool(
        "search-casinos",
        {
            query: z.string().describe("Search query to find casinos by name, state, website, or license status"),
            limit: z.number().optional().default(10).describe("Maximum number of results to return"),
        },
        async (args) => {
            const casinos = await convex.query(api.casinos.index.getCasinosSearchable, {
                searchTerm: args.query,
                paginationOpts: { numItems: args.limit || 10, cursor: null }
            });
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(casinos.page, null, 2),
                }]
            }
        }
    );

    // Tool 3: Get casino details with offers
    server.tool(
        "get-casino-details",
        {
            casinoId: z.string().describe("The ID of the casino to get details for"),
        },
        async (args) => {
            const details = await convex.query(api.casinos.index.getCasinoDetailWithOffers, {
                casinoId: args.casinoId as any
            });
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(details, null, 2),
                }]
            }
        }
    );

    // Tool 4: Get casinos by state statistics
    server.tool(
        "get-casinos-by-state",
        "Get casino distribution across different states with tracked/untracked breakdown",
        async () => {
            const stats = await convex.query(api.casinos.index.getCasinosByStateStats);
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(stats, null, 2),
                }]
            }
        }
    );

    // Tool 5: Get offer KPIs
    server.tool(
        "get-offer-kpis",
        "Get key performance indicators for offers including total offers, active offers, and today's research stats",
        async () => {
            const kpis = await convex.query(api.offers.index.getOfferKpis);
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(kpis, null, 2),
                }]
            }
        }
    );

    // Tool 6: Get offer timeline
    server.tool(
        "get-offer-timeline",
        {
            timeRange: z.enum(["7d", "30d", "90d"]).optional().default("30d").describe("Time range for the timeline: 7 days, 30 days, or 90 days"),
        },
        async (args) => {
            const timeline = await convex.query(api.offers.index.getOfferTimeline, {
                timeRange: args.timeRange
            });
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(timeline, null, 2),
                }]
            }
        }
    );

    // Tool 7: Get offer type breakdown
    server.tool(
        "get-offer-types",
        "Get breakdown of different offer types (welcome bonus, no deposit, free spins, etc.) with counts and percentages",
        async () => {
            const breakdown = await convex.query(api.offers.index.getOfferTypeBreakdown);
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(breakdown, null, 2),
                }]
            }
        }
    );

    // Tool 8: Get AI usage statistics
    server.tool(
        "get-ai-usage-stats",
        {
            hours: z.number().optional().default(24).describe("Number of hours to look back for AI usage statistics"),
        },
        async (args) => {
            const since = Date.now() - (args.hours * 60 * 60 * 1000);
            const stats = await convex.query(api.ai_usage.index.getAIUsageStats, { since });
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(stats, null, 2),
                }]
            }
        }
    );

    // Tool 9: Get best offers
    server.tool(
        "get-best-offers",
        {
            limit: z.number().optional().default(10).describe("Maximum number of best offers to return"),
        },
        async (args) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/offers/best`);
            if (!response.ok) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({ error: "Failed to fetch best offers" }, null, 2),
                    }]
                }
            }
            const offers = await response.json();
            const limitedOffers = offers.slice(0, args.limit || 10);
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(limitedOffers, null, 2),
                }]
            }
        }
    );

    // Tool 10: Trigger casino discovery
    server.tool(
        "trigger-casino-discovery",
        {
            state: z.string().optional().describe("State abbreviation to discover casinos in (e.g., 'NJ', 'PA'). If not provided, will use default discovery logic."),
        },
        async (args) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/casinos/research`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: args.state }),
            });

            if (!response.ok) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            error: "Failed to trigger casino discovery",
                            status: response.status
                        }, null, 2),
                    }]
                }
            }

            const result = await response.json();
            return {
                content: [{
                    type: "text" as const,
                    text: `Casino discovery triggered successfully. ${JSON.stringify(result, null, 2)}`,
                }]
            }
        }
    );

    // Tool 11: Trigger offer research
    server.tool(
        "trigger-offer-research",
        {
            batchSize: z.number().optional().default(30).describe("Number of casinos to research offers for (default: 30)"),
        },
        async (args) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/offers/research/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchSize: args.batchSize || 30 }),
            });

            if (!response.ok) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            error: "Failed to trigger offer research",
                            status: response.status
                        }, null, 2),
                    }]
                }
            }

            const result = await response.json();
            return {
                content: [{
                    type: "text" as const,
                    text: `Offer research triggered for ${args.batchSize} casinos. ${JSON.stringify(result, null, 2)}`,
                }]
            }
        }
    );

    // Tool 12: Get discovery logs
    server.tool(
        "get-discovery-logs",
        {
            limit: z.number().optional().default(20).describe("Maximum number of discovery log entries to return"),
        },
        async (args) => {
            const logs = await convex.query(api.casino_discovery_logs.index.getDiscoveryLogs, {
                limit: args.limit || 20
            });
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(logs, null, 2),
                }]
            }
        }
    );

    // Tool 13: Get research logs
    server.tool(
        "get-research-logs",
        {
            limit: z.number().optional().default(20).describe("Maximum number of research log entries to return"),
        },
        async (args) => {
            const logs = await convex.query(api.offer_research_logs.index.getResearchLogs, {
                limit: args.limit || 20
            });
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(logs, null, 2),
                }]
            }
        }
    );
}, {
    capabilities: {
        tools: {}
    }
}, {
    sseEndpoint: '/sse',
    streamableHttpEndpoint: '/mcp',
    verboseLogs: true,
    maxDuration: 60
})

export { handler as GET, handler as POST };